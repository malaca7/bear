using System.Windows;
using System.Windows.Input;
using BearApp.Services;
using Microsoft.Extensions.DependencyInjection;

namespace BearApp.Views;

public partial class LoginWindow : Window
{
    private readonly IAuthService _authService;

    public LoginWindow()
    {
        InitializeComponent();
        _authService = App.Services.GetRequiredService<IAuthService>();
    }

    private void DragWindow(object sender, MouseButtonEventArgs e) => DragMove();
    private void CloseClick(object sender, RoutedEventArgs e) => Application.Current.Shutdown();

    private async void LoginClick(object sender, RoutedEventArgs e)
    {
        ErrorBorder.Visibility = Visibility.Collapsed;
        var email = EmailBox.Text.Trim();
        var password = PasswordBox.Password;

        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
        {
            ShowError("Preencha todos os campos");
            return;
        }

        LoginButton.IsEnabled = false;
        LoginButton.Content = "Entrando...";

        var (success, error) = await _authService.LoginAsync(email, password);

        if (success)
        {
            var mainWindow = new MainWindow();
            mainWindow.Show();
            Close();
        }
        else
        {
            ShowError(error ?? "E-mail ou senha incorretos");
            LoginButton.IsEnabled = true;
            LoginButton.Content = "Entrar";
        }
    }

    private void ShowError(string message)
    {
        ErrorText.Text = message;
        ErrorBorder.Visibility = Visibility.Visible;
    }

    private void RegisterClick(object sender, MouseButtonEventArgs e)
    {
        var registerWindow = new RegisterWindow();
        registerWindow.Show();
        Close();
    }

    private void ForgotPasswordClick(object sender, MouseButtonEventArgs e)
    {
        var forgotPasswordWindow = new ForgotPasswordWindow();
        forgotPasswordWindow.Show();
        Close();
    }
}
