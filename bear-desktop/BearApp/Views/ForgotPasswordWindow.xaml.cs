using System.Windows;
using System.Windows.Input;
using BearApp.Services;
using Microsoft.Extensions.DependencyInjection;

namespace BearApp.Views;

public partial class ForgotPasswordWindow : Window
{
    private readonly IAuthService _authService;

    public ForgotPasswordWindow()
    {
        InitializeComponent();
        _authService = App.Services.GetRequiredService<IAuthService>();
    }

    private void DragWindow(object sender, MouseButtonEventArgs e) => DragMove();

    private void CloseClick(object sender, RoutedEventArgs e) => Close();

    private async void SubmitClick(object sender, RoutedEventArgs e)
    {
        ErrorBorder.Visibility = Visibility.Collapsed;
        SuccessBorder.Visibility = Visibility.Collapsed;

        var email = EmailBox.Text.Trim();
        if (string.IsNullOrWhiteSpace(email))
        {
            ShowError("Por favor, preencha o e-mail");
            return;
        }

        SubmitButton.IsEnabled = false;
        SubmitButton.Content = "Enviando...";

        var (success, error) = await _authService.ResetPasswordAsync(email);

        if (success)
        {
            ShowSuccess("E-mail de recuperação enviado com sucesso. Verifique sua caixa de entrada.");
            EmailBox.Text = string.Empty;
        }
        else
        {
            ShowError(error ?? "Erro ao solicitar recuperação");
        }

        SubmitButton.IsEnabled = true;
        SubmitButton.Content = "Enviar E-mail de Recuperação";
    }

    private void ShowError(string message)
    {
        ErrorText.Text = message;
        ErrorBorder.Visibility = Visibility.Visible;
    }

    private void ShowSuccess(string message)
    {
        SuccessText.Text = message;
        SuccessBorder.Visibility = Visibility.Visible;
    }

    private void BackToLoginClick(object sender, MouseButtonEventArgs e)
    {
        var loginWindow = new LoginWindow();
        loginWindow.Show();
        Close();
    }
}
