using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using BearApp.Services;

namespace BearApp.ViewModels;

public partial class LoginViewModel : ObservableObject
{
    private readonly IAuthService _authService;

    [ObservableProperty] private string email = string.Empty;
    [ObservableProperty] private string password = string.Empty;
    [ObservableProperty] private string errorMessage = string.Empty;
    [ObservableProperty] private bool isLoading;
    [ObservableProperty] private bool rememberMe;

    public event EventHandler? LoginSuccessful;
    public event EventHandler? NavigateToRegister;
    public event EventHandler? NavigateToForgotPassword;

    public LoginViewModel(IAuthService authService) => _authService = authService;

    [RelayCommand]
    private async Task LoginAsync()
    {
        if (string.IsNullOrWhiteSpace(Email) || string.IsNullOrWhiteSpace(Password))
        { ErrorMessage = "Preencha todos os campos"; return; }

        IsLoading = true; ErrorMessage = string.Empty;
        var (success, error) = await _authService.LoginAsync(Email, Password);
        IsLoading = false;

        if (success) LoginSuccessful?.Invoke(this, EventArgs.Empty);
        else ErrorMessage = error ?? "Erro ao fazer login";
    }

    [RelayCommand] private void GoToRegister() => NavigateToRegister?.Invoke(this, EventArgs.Empty);
    [RelayCommand] private void GoToForgotPassword() => NavigateToForgotPassword?.Invoke(this, EventArgs.Empty);
}

public partial class RegisterViewModel : ObservableObject
{
    private readonly IAuthService _authService;

    [ObservableProperty] private string displayName = string.Empty;
    [ObservableProperty] private string email = string.Empty;
    [ObservableProperty] private string password = string.Empty;
    [ObservableProperty] private string confirmPassword = string.Empty;
    [ObservableProperty] private string errorMessage = string.Empty;
    [ObservableProperty] private bool isLoading;

    public event EventHandler? RegisterSuccessful;
    public event EventHandler? NavigateToLogin;

    public RegisterViewModel(IAuthService authService) => _authService = authService;

    [RelayCommand]
    private async Task RegisterAsync()
    {
        if (Password != ConfirmPassword) { ErrorMessage = "Senhas não coincidem"; return; }
        if (Password.Length < 6) { ErrorMessage = "Senha deve ter no mínimo 6 caracteres"; return; }

        IsLoading = true; ErrorMessage = string.Empty;
        var (success, error) = await _authService.RegisterAsync(Email, Password, DisplayName);
        IsLoading = false;

        if (success) RegisterSuccessful?.Invoke(this, EventArgs.Empty);
        else ErrorMessage = error ?? "Erro ao criar conta";
    }

    [RelayCommand] private void GoToLogin() => NavigateToLogin?.Invoke(this, EventArgs.Empty);
}

public partial class DashboardViewModel : ObservableObject
{
    private readonly IAuthService _authService;
    private readonly ILicenseService _licenseService;
    private readonly IConfigService _configService;

    [ObservableProperty] private string userName = string.Empty;
    [ObservableProperty] private string licenseStatus = "Sem licença";
    [ObservableProperty] private string planName = "Free";
    [ObservableProperty] private string appVersion = "1.0.0";
    [ObservableProperty] private bool isLoading = true;

    public DashboardViewModel(IAuthService authService, ILicenseService licenseService, IConfigService configService)
    {
        _authService = authService; _licenseService = licenseService; _configService = configService;
    }

    [RelayCommand]
    private async Task LoadAsync()
    {
        IsLoading = true;
        var user = await _authService.GetCurrentUserAsync();
        if (user != null) UserName = user.DisplayName ?? user.Email;

        var license = await _licenseService.GetCurrentLicenseAsync();
        if (license != null)
        {
            LicenseStatus = license.Status;
            PlanName = license.Plan?.Name ?? "Free";
        }

        await _configService.SyncAsync();
        IsLoading = false;
    }
}

public partial class ProfileViewModel : ObservableObject
{
    private readonly IAuthService _authService;

    [ObservableProperty] private string displayName = string.Empty;
    [ObservableProperty] private string email = string.Empty;
    [ObservableProperty] private string role = string.Empty;
    [ObservableProperty] private bool isSaving;
    [ObservableProperty] private string statusMessage = string.Empty;

    public ProfileViewModel(IAuthService authService) => _authService = authService;

    [RelayCommand]
    private async Task LoadAsync()
    {
        var user = await _authService.GetCurrentUserAsync();
        if (user != null) { DisplayName = user.DisplayName ?? ""; Email = user.Email; Role = user.Role; }
    }
}

public partial class LicenseViewModel : ObservableObject
{
    private readonly ILicenseService _licenseService;

    [ObservableProperty] private string licenseCode = string.Empty;
    [ObservableProperty] private string status = string.Empty;
    [ObservableProperty] private string planName = string.Empty;
    [ObservableProperty] private int maxDevices;
    [ObservableProperty] private int activeDevices;
    [ObservableProperty] private string expiresAt = string.Empty;
    [ObservableProperty] private bool isLoading;
    [ObservableProperty] private string errorMessage = string.Empty;

    public LicenseViewModel(ILicenseService licenseService) => _licenseService = licenseService;

    [RelayCommand]
    private async Task ValidateAsync()
    {
        if (string.IsNullOrWhiteSpace(LicenseCode)) { ErrorMessage = "Insira o código da licença"; return; }
        IsLoading = true; ErrorMessage = string.Empty;
        var result = await _licenseService.ValidateAsync(LicenseCode);
        IsLoading = false;
        if (!result.Valid) ErrorMessage = result.Message ?? "Licença inválida";
        else { Status = "Ativa"; PlanName = result.PlanName ?? ""; }
    }
}

public partial class SettingsViewModel : ObservableObject
{
    [ObservableProperty] private bool autoUpdate = true;
    [ObservableProperty] private bool darkMode = true;
    [ObservableProperty] private string language = "pt-BR";
    [ObservableProperty] private bool notifications = true;
}

public partial class NotificationsViewModel : ObservableObject
{
    private readonly INotificationService _notificationService;
    [ObservableProperty] private bool isLoading;

    public NotificationsViewModel(INotificationService notificationService) => _notificationService = notificationService;

    [RelayCommand]
    private async Task LoadAsync()
    {
        IsLoading = true;
        await _notificationService.GetNotificationsAsync();
        IsLoading = false;
    }
}

public partial class UpdatesViewModel : ObservableObject
{
    private readonly IUpdateService _updateService;

    [ObservableProperty] private bool hasUpdate;
    [ObservableProperty] private string latestVersion = string.Empty;
    [ObservableProperty] private string changelog = string.Empty;
    [ObservableProperty] private bool isChecking;
    [ObservableProperty] private bool isDownloading;
    [ObservableProperty] private double downloadProgress;

    public UpdatesViewModel(IUpdateService updateService) => _updateService = updateService;

    [RelayCommand]
    private async Task CheckAsync()
    {
        IsChecking = true;
        var result = await _updateService.CheckForUpdatesAsync();
        HasUpdate = result.HasUpdate;
        if (result.HasUpdate)
        { LatestVersion = result.LatestVersion ?? ""; Changelog = result.Changelog ?? ""; }
        IsChecking = false;
    }
}
