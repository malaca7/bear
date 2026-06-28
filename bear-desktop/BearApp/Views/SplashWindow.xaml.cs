using System.Windows;
using BearApp.Services;
using Microsoft.Extensions.DependencyInjection;

namespace BearApp.Views;

public partial class SplashWindow : Window
{
    public SplashWindow()
    {
        InitializeComponent();
        Loaded += SplashWindow_Loaded;
    }

    private async void SplashWindow_Loaded(object sender, RoutedEventArgs e)
    {
        try
        {
            StatusText.Text = "Inicializando serviços...";
            var supabase = App.Services.GetRequiredService<ISupabaseService>();
            await supabase.InitializeAsync();

            StatusText.Text = "Sincronizando configurações...";
            var configService = App.Services.GetRequiredService<IConfigService>();
            await configService.SyncAsync();

            StatusText.Text = "Verificando sessão...";
            await Task.Delay(500);

            StatusText.Text = "Pronto!";
            await Task.Delay(300);

            var loginWindow = new LoginWindow();
            loginWindow.Show();
            Close();
        }
        catch (Exception ex)
        {
            StatusText.Text = $"Erro: {ex.Message}";
            await Task.Delay(3000);
            var loginWindow = new LoginWindow();
            loginWindow.Show();
            Close();
        }
    }
}
