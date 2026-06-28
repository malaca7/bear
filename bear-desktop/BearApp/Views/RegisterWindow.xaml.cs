using System.Windows;
using System.Windows.Input;
using BearApp.Services;
using Microsoft.Extensions.DependencyInjection;

namespace BearApp.Views;

public partial class RegisterWindow : Window
{
    private readonly IAuthService _authService;

    public RegisterWindow()
    {
        InitializeComponent();
        _authService = App.Services.GetRequiredService<IAuthService>();
    }

    private void DragWindow(object sender, MouseButtonEventArgs e) => DragMove();
    
    private void CloseClick(object sender, RoutedEventArgs e) => Close();

    private async void RegisterClick(object sender, RoutedEventArgs e)
    {
        ErrorBorder.Visibility = Visibility.Collapsed;
        var name = NameBox.Text.Trim();
        var email = EmailBox.Text.Trim();
        var password = PasswordBox.Password;
        var confirmPassword = ConfirmPasswordBox.Password;

        if (string.IsNullOrWhiteSpace(name) || string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
        {
            ShowError("Preencha todos os campos");
            return;
        }

        if (password != confirmPassword)
        {
            ShowError("As senhas não coincidem");
            return;
        }

        RegisterButton.IsEnabled = false;
        RegisterButton.Content = "Criando conta...";

        var (success, error) = await _authService.RegisterAsync(email, password, name);

        if (success)
        {
            MessageBox.Show("Conta criada com sucesso! Faça login para continuar.", "Cadastro BEAR", MessageBoxButton.OK, MessageBoxImage.Information);
            var loginWindow = new LoginWindow();
            loginWindow.Show();
            Close();
        }
        else
        {
            ShowError(error ?? "Erro ao criar conta");
            RegisterButton.IsEnabled = true;
            RegisterButton.Content = "Criar Conta";
        }
    }

    private void ShowError(string message)
    {
        ErrorText.Text = message;
        ErrorBorder.Visibility = Visibility.Visible;
    }

    private void LoginClick(object sender, MouseButtonEventArgs e)
    {
        var loginWindow = new LoginWindow();
        loginWindow.Show();
        Close();
    }
}
