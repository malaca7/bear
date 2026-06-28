using System.Windows;
using BearApp.Services;
using Microsoft.Extensions.DependencyInjection;
using Serilog;

namespace BearApp;

public partial class App : Application
{
    public static IServiceProvider Services { get; private set; } = null!;

    protected override void OnStartup(StartupEventArgs e)
    {
        base.OnStartup(e);

        // Configure logging
        Log.Logger = new LoggerConfiguration()
            .MinimumLevel.Debug()
            .WriteTo.File("logs/bear-.log", rollingInterval: RollingInterval.Day)
            .CreateLogger();

        // Configure DI
        var services = new ServiceCollection();
        ConfigureServices(services);
        Services = services.BuildServiceProvider();

        Log.Information("BEAR App started");
    }

    private void ConfigureServices(IServiceCollection services)
    {
        // Services
        services.AddSingleton<ISupabaseService, SupabaseService>();
        services.AddSingleton<IAuthService, AuthService>();
        services.AddSingleton<ILicenseService, LicenseService>();
        services.AddSingleton<IUpdateService, UpdateService>();
        services.AddSingleton<INotificationService, NotificationService>();
        services.AddSingleton<IConfigService, ConfigService>();
        services.AddSingleton<ILogService, LogService>();

        // ViewModels
        services.AddTransient<ViewModels.LoginViewModel>();
        services.AddTransient<ViewModels.RegisterViewModel>();
        services.AddTransient<ViewModels.DashboardViewModel>();
        services.AddTransient<ViewModels.ProfileViewModel>();
        services.AddTransient<ViewModels.LicenseViewModel>();
        services.AddTransient<ViewModels.SettingsViewModel>();
        services.AddTransient<ViewModels.NotificationsViewModel>();
        services.AddTransient<ViewModels.UpdatesViewModel>();

        // HTTP client
        services.AddHttpClient();
    }

    protected override void OnExit(ExitEventArgs e)
    {
        Log.Information("BEAR App shutting down");
        Log.CloseAndFlush();
        base.OnExit(e);
    }
}
