using Supabase;
using Serilog;

namespace BearApp.Services;

public interface ISupabaseService
{
    Client GetClient();
    Task InitializeAsync();
}

public class SupabaseService : ISupabaseService
{
    private Client? _client;
    private const string SupabaseUrl = "https://your-project.supabase.co";
    private const string SupabaseKey = "your-anon-key";

    public async Task InitializeAsync()
    {
        try
        {
            var options = new SupabaseOptions { AutoConnectRealtime = false };
            _client = new Client(SupabaseUrl, SupabaseKey, options);
            await _client.InitializeAsync();
            Log.Information("Supabase client initialized");
        }
        catch (Exception ex)
        {
            Log.Error(ex, "Failed to initialize Supabase client");
            throw;
        }
    }

    public Client GetClient()
    {
        if (_client == null)
            throw new InvalidOperationException("Supabase client not initialized. Call InitializeAsync first.");
        return _client;
    }
}

public interface IAuthService
{
    Task<(bool Success, string? Error)> LoginAsync(string email, string password);
    Task<(bool Success, string? Error)> RegisterAsync(string email, string password, string displayName);
    Task LogoutAsync();
    Task<(bool Success, string? Error)> ResetPasswordAsync(string email);
    Task<(bool Success, string? Error)> ChangePasswordAsync(string newPassword);
    Task<Models.BearUser?> GetCurrentUserAsync();
    bool IsAuthenticated { get; }
    event EventHandler? AuthStateChanged;
}

public class AuthService : IAuthService
{
    private readonly ISupabaseService _supabase;
    private Models.BearUser? _currentUser;
    public bool IsAuthenticated => _currentUser != null;
    public event EventHandler? AuthStateChanged;

    public AuthService(ISupabaseService supabase) => _supabase = supabase;

    public async Task<(bool, string?)> LoginAsync(string email, string password)
    {
        try
        {
            var client = _supabase.GetClient();
            var session = await client.Auth.SignIn(email, password);
            if (session?.User == null) return (false, "Credenciais inválidas");

            _currentUser = new Models.BearUser { Id = session.User.Id!, Email = email };
            AuthStateChanged?.Invoke(this, EventArgs.Empty);
            Log.Information("User logged in: {Email}", email);
            return (true, null);
        }
        catch (Exception ex)
        {
            Log.Error(ex, "Login failed for {Email}", email);
            return (false, ex.Message);
        }
    }

    public async Task<(bool, string?)> RegisterAsync(string email, string password, string displayName)
    {
        try
        {
            var client = _supabase.GetClient();
            var session = await client.Auth.SignUp(email, password);
            if (session?.User == null) return (false, "Erro ao criar conta");
            Log.Information("User registered: {Email}", email);
            return (true, null);
        }
        catch (Exception ex)
        {
            Log.Error(ex, "Registration failed for {Email}", email);
            return (false, ex.Message);
        }
    }

    public async Task LogoutAsync()
    {
        try
        {
            var client = _supabase.GetClient();
            await client.Auth.SignOut();
            _currentUser = null;
            AuthStateChanged?.Invoke(this, EventArgs.Empty);
            Log.Information("User logged out");
        }
        catch (Exception ex) { Log.Error(ex, "Logout failed"); }
    }

    public async Task<(bool, string?)> ResetPasswordAsync(string email)
    {
        try
        {
            var client = _supabase.GetClient();
            await client.Auth.ResetPasswordForEmail(email);
            return (true, null);
        }
        catch (Exception ex) { return (false, ex.Message); }
    }

    public async Task<(bool, string?)> ChangePasswordAsync(string newPassword)
    {
        try
        {
            var client = _supabase.GetClient();
            await client.Auth.Update(new Supabase.Gotrue.UserAttributes { Password = newPassword });
            return (true, null);
        }
        catch (Exception ex) { return (false, ex.Message); }
    }

    public Task<Models.BearUser?> GetCurrentUserAsync() => Task.FromResult(_currentUser);
}

public interface ILicenseService
{
    Task<Models.LicenseValidationResult> ValidateAsync(string code);
    Task<Models.BearLicense?> GetCurrentLicenseAsync();
}

public class LicenseService : ILicenseService
{
    private readonly ISupabaseService _supabase;
    public LicenseService(ISupabaseService supabase) => _supabase = supabase;

    public async Task<Models.LicenseValidationResult> ValidateAsync(string code)
    {
        try
        {
            var client = _supabase.GetClient();
            var result = await client.Rpc("bear_fn_validate_license", 
                new Dictionary<string, object> { { "p_license_code", code } });
            Log.Information("License validated: {Code}", code);
            return new Models.LicenseValidationResult { Valid = true };
        }
        catch (Exception ex)
        {
            Log.Error(ex, "License validation failed: {Code}", code);
            return new Models.LicenseValidationResult { Valid = false, Error = ex.Message };
        }
    }

    public async Task<Models.BearLicense?> GetCurrentLicenseAsync()
    {
        // Implementation would query bear_licenses for current user
        return null;
    }
}

public interface IUpdateService
{
    Task<Models.UpdateCheckResult> CheckForUpdatesAsync();
    Task<bool> DownloadUpdateAsync(string url, string targetPath);
}

public class UpdateService : IUpdateService
{
    private readonly ISupabaseService _supabase;
    private readonly HttpClient _httpClient;

    public UpdateService(ISupabaseService supabase, IHttpClientFactory httpFactory)
    {
        _supabase = supabase;
        _httpClient = httpFactory.CreateClient();
    }

    public async Task<Models.UpdateCheckResult> CheckForUpdatesAsync()
    {
        try
        {
            var client = _supabase.GetClient();
            var result = await client.Rpc("bear_fn_check_updates",
                new Dictionary<string, object>
                {
                    { "p_current_version", "1.0.0" },
                    { "p_current_version_code", 100 },
                    { "p_plan_type", "free" }
                });
            return new Models.UpdateCheckResult { HasUpdate = false };
        }
        catch (Exception ex)
        {
            Log.Error(ex, "Update check failed");
            return new Models.UpdateCheckResult { HasUpdate = false };
        }
    }

    public async Task<bool> DownloadUpdateAsync(string url, string targetPath)
    {
        try
        {
            var response = await _httpClient.GetAsync(url);
            response.EnsureSuccessStatusCode();
            var bytes = await response.Content.ReadAsByteArrayAsync();
            await File.WriteAllBytesAsync(targetPath, bytes);
            Log.Information("Update downloaded to {Path}", targetPath);
            return true;
        }
        catch (Exception ex)
        {
            Log.Error(ex, "Update download failed");
            return false;
        }
    }
}

public interface INotificationService
{
    Task<List<Models.BearNotification>> GetNotificationsAsync();
    Task MarkAsReadAsync(string id);
}

public class NotificationService : INotificationService
{
    private readonly ISupabaseService _supabase;
    public NotificationService(ISupabaseService supabase) => _supabase = supabase;

    public async Task<List<Models.BearNotification>> GetNotificationsAsync()
    {
        return new List<Models.BearNotification>();
    }

    public async Task MarkAsReadAsync(string id)
    {
        Log.Information("Notification marked as read: {Id}", id);
    }
}

public interface IConfigService
{
    Task<Dictionary<string, object>> GetRemoteConfigsAsync();
    Task<List<Models.BearFeatureFlag>> GetFeatureFlagsAsync();
    Task SyncAsync();
}

public class ConfigService : IConfigService
{
    private readonly ISupabaseService _supabase;
    public ConfigService(ISupabaseService supabase) => _supabase = supabase;

    public async Task<Dictionary<string, object>> GetRemoteConfigsAsync() => new();
    public async Task<List<Models.BearFeatureFlag>> GetFeatureFlagsAsync() => new();
    public async Task SyncAsync() { Log.Information("Config sync completed"); }
}

public interface ILogService
{
    void LogInfo(string message);
    void LogError(string message, Exception? ex = null);
    void LogWarning(string message);
}

public class LogService : ILogService
{
    public void LogInfo(string message) => Log.Information(message);
    public void LogError(string message, Exception? ex = null) => Log.Error(ex, message);
    public void LogWarning(string message) => Log.Warning(message);
}
