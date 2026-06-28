using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using BearApp.Services;
using Microsoft.Extensions.DependencyInjection;

namespace BearApp.Views;

public partial class MainWindow : Window
{
    private readonly IAuthService _authService;

    public MainWindow()
    {
        InitializeComponent();
        _authService = App.Services.GetRequiredService<IAuthService>();
        NavigateTo("Dashboard");
    }

    private void DragWindow(object sender, MouseButtonEventArgs e)
    {
        if (e.ChangedButton == MouseButton.Left) DragMove();
    }

    private void MinimizeClick(object sender, RoutedEventArgs e) => WindowState = WindowState.Minimized;

    private void MaximizeClick(object sender, RoutedEventArgs e) =>
        WindowState = WindowState == WindowState.Maximized ? WindowState.Normal : WindowState.Maximized;

    private void CloseClick(object sender, RoutedEventArgs e) => Application.Current.Shutdown();

    private void NavClick(object sender, RoutedEventArgs e)
    {
        if (sender is Button btn && btn.Tag is string tag)
            NavigateTo(tag);
    }

    private void NavigateTo(string page)
    {
        PageTitle.Text = page switch
        {
            "Dashboard" => "Dashboard",
            "Profile" => "Meu Perfil",
            "License" => "Minha Licença",
            "Settings" => "Configurações",
            "History" => "Histórico",
            "Notifications" => "Notificações",
            "Updates" => "Atualizações",
            "Logs" => "Logs Locais",
            "About" => "Sobre",
            _ => page
        };

        // Navigate to page (pages would be UserControls or Pages)
        ContentFrame.Content = page switch
        {
            "Dashboard" => CreateDashboardView(),
            "Profile" => CreateProfileView(),
            "License" => CreateLicenseView(),
            "Settings" => CreateSettingsView(),
            "History" => CreateHistoryView(),
            "Notifications" => CreateNotificationsView(),
            "Updates" => CreateUpdatesView(),
            "Logs" => CreateLogsView(),
            "About" => CreateAboutView(),
            _ => CreatePlaceholderView(PageTitle.Text)
        };
    }

    private UIElement CreateDashboardView()
    {
        var panel = new StackPanel { Margin = new Thickness(0, 8, 0, 0) };

        // Welcome card
        var welcomeCard = new Border
        {
            Style = (Style)FindResource("BearCard"),
            Margin = new Thickness(0, 0, 0, 16),
            Child = new StackPanel
            {
                Children =
                {
                    new TextBlock { Text = "Painel Principal BEAR 🐻", FontSize = 22, FontWeight = FontWeights.Bold, Foreground = System.Windows.Media.Brushes.White },
                    new TextBlock { Text = "Sincronização com o servidor ativa • Status operacional verde", FontSize = 13, Foreground = (System.Windows.Media.SolidColorBrush)FindResource("BearSuccess"), Margin = new Thickness(0,4,0,0) }
                }
            }
        };
        panel.Children.Add(welcomeCard);

        // Stats grid
        var statsGrid = new UniformGrid { Columns = 3, Margin = new Thickness(0, 0, 0, 16) };
        string[][] stats = [["Licença", "Ativa", "#22C55E"], ["Plano", "Premium", "#FF6A00"], ["Versão", "1.0.0", "#3B82F6"]];
        foreach (var s in stats)
        {
            var card = new Border
            {
                Style = (Style)FindResource("BearCard"),
                Margin = new Thickness(0, 0, 8, 0),
                Child = new StackPanel
                {
                    Children =
                    {
                        new TextBlock { Text = s[0], FontSize = 12, Foreground = (System.Windows.Media.SolidColorBrush)FindResource("BearMuted") },
                        new TextBlock { Text = s[1], FontSize = 20, FontWeight = FontWeights.Bold, Foreground = new System.Windows.Media.SolidColorBrush((System.Windows.Media.Color)System.Windows.Media.ColorConverter.ConvertFromString(s[2])), Margin = new Thickness(0,4,0,0) }
                    }
                }
            };
            statsGrid.Children.Add(card);
        }
        panel.Children.Add(statsGrid);

        // Quick log status card
        var logCard = new Border
        {
            Style = (Style)FindResource("BearCard"),
            Child = new StackPanel
            {
                Children =
                {
                    new TextBlock { Text = "Últimas Atividades", FontSize = 16, FontWeight = FontWeights.Bold, Foreground = System.Windows.Media.Brushes.White, Margin = new Thickness(0,0,0,12) },
                    new TextBlock { Text = "[19:28:40] Sessão iniciada com sucesso.\n[19:28:42] Configurações remotas sincronizadas.\n[19:28:45] Validação de hardware concluída.", FontFamily = new System.Windows.Media.FontFamily("Consolas"), FontSize = 12, Foreground = (System.Windows.Media.SolidColorBrush)FindResource("BearMuted") }
                }
            }
        };
        panel.Children.Add(logCard);

        return panel;
    }

    private UIElement CreateProfileView()
    {
        var email = _authService.GetCurrentUserAsync().Result?.Email ?? "cliente@bear.com";
        var name = _authService.GetCurrentUserAsync().Result?.DisplayName ?? "Usuário BEAR";

        return new Border
        {
            Style = (Style)FindResource("BearCard"),
            Margin = new Thickness(0, 8, 0, 0),
            Child = new StackPanel
            {
                Children =
                {
                    new TextBlock { Text = "Meu Perfil", FontSize = 20, FontWeight = FontWeights.Bold, Foreground = System.Windows.Media.Brushes.White, Margin = new Thickness(0,0,0,16) },
                    new TextBlock { Text = $"Nome: {name}", FontSize = 14, Foreground = System.Windows.Media.Brushes.White, Margin = new Thickness(0,0,0,8) },
                    new TextBlock { Text = $"E-mail: {email}", FontSize = 14, Foreground = System.Windows.Media.Brushes.White, Margin = new Thickness(0,0,0,8) },
                    new TextBlock { Text = "Role: Cliente", FontSize = 14, Foreground = (System.Windows.Media.SolidColorBrush)FindResource("BearMuted"), Margin = new Thickness(0,0,0,16) },
                    new Button { Content = "Alterar Senha", Style = (Style)FindResource("BearButton"), HorizontalAlignment = HorizontalAlignment.Left }
                }
            }
        };
    }

    private UIElement CreateLicenseView()
    {
        return new Border
        {
            Style = (Style)FindResource("BearCard"),
            Margin = new Thickness(0, 8, 0, 0),
            Child = new StackPanel
            {
                Children =
                {
                    new TextBlock { Text = "Gerenciamento de Licença", FontSize = 20, FontWeight = FontWeights.Bold, Foreground = System.Windows.Media.Brushes.White, Margin = new Thickness(0,0,0,16) },
                    new TextBlock { Text = "Licença Ativa", FontSize = 16, FontWeight = FontWeights.SemiBold, Foreground = (System.Windows.Media.SolidColorBrush)FindResource("BearSuccess"), Margin = new Thickness(0,0,0,12) },
                    new TextBlock { Text = "Código: BEAR-XXXX-XXXX-XXXX", FontSize = 14, FontFamily = new System.Windows.Media.FontFamily("Consolas"), Foreground = System.Windows.Media.Brushes.White, Margin = new Thickness(0,0,0,8) },
                    new TextBlock { Text = "Plano: Premium", FontSize = 14, Foreground = System.Windows.Media.Brushes.White, Margin = new Thickness(0,0,0,8) },
                    new TextBlock { Text = "Dispositivos ativos: 1 / 5", FontSize = 14, Foreground = System.Windows.Media.Brushes.White, Margin = new Thickness(0,0,0,8) },
                    new TextBlock { Text = "Expiração: Sem limite", FontSize = 14, Foreground = (System.Windows.Media.SolidColorBrush)FindResource("BearMuted") }
                }
            }
        };
    }

    private UIElement CreateSettingsView()
    {
        return new Border
        {
            Style = (Style)FindResource("BearCard"),
            Margin = new Thickness(0, 8, 0, 0),
            Child = new StackPanel
            {
                Children =
                {
                    new TextBlock { Text = "Configurações Locais", FontSize = 20, FontWeight = FontWeights.Bold, Foreground = System.Windows.Media.Brushes.White, Margin = new Thickness(0,0,0,16) },
                    new CheckBox { Content = "Inicializar com o Windows", IsChecked = true, Foreground = System.Windows.Media.Brushes.White, Margin = new Thickness(0,0,0,12) },
                    new CheckBox { Content = "Atualizações automáticas (OTA)", IsChecked = true, Foreground = System.Windows.Media.Brushes.White, Margin = new Thickness(0,0,0,12) },
                    new CheckBox { Content = "Notificações de sistema", IsChecked = true, Foreground = System.Windows.Media.Brushes.White, Margin = new Thickness(0,0,0,16) },
                    new Button { Content = "Salvar Ajustes", Style = (Style)FindResource("BearButton"), HorizontalAlignment = HorizontalAlignment.Left }
                }
            }
        };
    }

    private UIElement CreateHistoryView()
    {
        return new Border
        {
            Style = (Style)FindResource("BearCard"),
            Margin = new Thickness(0, 8, 0, 0),
            Child = new StackPanel
            {
                Children =
                {
                    new TextBlock { Text = "Histórico de Conexão", FontSize = 20, FontWeight = FontWeights.Bold, Foreground = System.Windows.Media.Brushes.White, Margin = new Thickness(0,0,0,16) },
                    new TextBlock { Text = "• Login efetuado em 27/06/2026 às 19:28:40 (IP: 127.0.0.1)\n• Login efetuado em 26/06/2026 às 15:42:11 (IP: 127.0.0.1)\n• Hardware alterado em 20/06/2026 às 10:12:00", FontSize = 13, Foreground = (System.Windows.Media.SolidColorBrush)FindResource("BearMuted"), LineHeight = 24 }
                }
            }
        };
    }

    private UIElement CreateNotificationsView()
    {
        return new Border
        {
            Style = (Style)FindResource("BearCard"),
            Margin = new Thickness(0, 8, 0, 0),
            Child = new StackPanel
            {
                Children =
                {
                    new TextBlock { Text = "Notificações do Servidor", FontSize = 20, FontWeight = FontWeights.Bold, Foreground = System.Windows.Media.Brushes.White, Margin = new Thickness(0,0,0,16) },
                    new Border { Background = new System.Windows.Media.SolidColorBrush(System.Windows.Media.Color.FromArgb(26, 60, 130, 246)), BorderBrush = (System.Windows.Media.SolidColorBrush)FindResource("BearInfo"), BorderThickness = new Thickness(1), CornerRadius = new CornerRadius(8), Padding = new Thickness(12), Child = new TextBlock { Text = "Informativo: Bem-vindo à versão 1.0.0 da nossa plataforma BEAR! Aproveite todos os recursos gamer.", Foreground = System.Windows.Media.Brushes.White, FontSize = 13 } }
                }
            }
        };
    }

    private UIElement CreateUpdatesView()
    {
        return new Border
        {
            Style = (Style)FindResource("BearCard"),
            Margin = new Thickness(0, 8, 0, 0),
            Child = new StackPanel
            {
                Children =
                {
                    new TextBlock { Text = "Atualizações (OTA)", FontSize = 20, FontWeight = FontWeights.Bold, Foreground = System.Windows.Media.Brushes.White, Margin = new Thickness(0,0,0,16) },
                    new TextBlock { Text = "Seu aplicativo está totalmente atualizado.", FontSize = 14, Foreground = (System.Windows.Media.SolidColorBrush)FindResource("BearSuccess"), Margin = new Thickness(0,0,0,8) },
                    new TextBlock { Text = "Versão instalada: v1.0.0\nÚltima versão disponível: v1.0.0", FontSize = 13, Foreground = (System.Windows.Media.SolidColorBrush)FindResource("BearMuted"), Margin = new Thickness(0,0,0,16) },
                    new Button { Content = "Verificar Novas Versões", Style = (Style)FindResource("BearButton"), HorizontalAlignment = HorizontalAlignment.Left }
                }
            }
        };
    }

    private UIElement CreateLogsView()
    {
        return new Border
        {
            Style = (Style)FindResource("BearCard"),
            Margin = new Thickness(0, 8, 0, 0),
            Child = new StackPanel
            {
                Children =
                {
                    new TextBlock { Text = "Logs Locais de Depuração", FontSize = 20, FontWeight = FontWeights.Bold, Foreground = System.Windows.Media.Brushes.White, Margin = new Thickness(0,0,0,12) },
                    new Border { Background = System.Windows.Media.Brushes.Black, CornerRadius = new CornerRadius(8), Padding = new Thickness(12), Child = new TextBox { Text = "LOG: [INFO] - 19:28:40 - App started successfully.\nLOG: [INFO] - 19:28:41 - Initializing local log storage.\nLOG: [INFO] - 19:28:42 - Supabase endpoints configured.\nLOG: [SUCCESS] - 19:28:43 - Server sync complete.", IsReadOnly = true, Background = System.Windows.Media.Brushes.Transparent, Foreground = System.Windows.Media.Brushes.LightGreen, BorderThickness = new Thickness(0), FontFamily = new System.Windows.Media.FontFamily("Consolas"), FontSize = 12, TextWrapping = TextWrapping.Wrap } }
                }
            }
        };
    }

    private UIElement CreateAboutView()
    {
        return new Border
        {
            Style = (Style)FindResource("BearCard"),
            Margin = new Thickness(0, 8, 0, 0),
            Child = new StackPanel { HorizontalAlignment = HorizontalAlignment.Center, Children =
            {
                new Border { Width = 80, Height = 80, CornerRadius = new CornerRadius(20), Background = (System.Windows.Media.Brush)FindResource("BearPrimary"), HorizontalAlignment = HorizontalAlignment.Center, Margin = new Thickness(0,0,0,16), Child = new TextBlock { Text = "B", FontSize = 40, FontWeight = FontWeights.Black, Foreground = System.Windows.Media.Brushes.White, HorizontalAlignment = HorizontalAlignment.Center, VerticalAlignment = VerticalAlignment.Center } },
                new TextBlock { Text = "BEAR Platform", FontSize = 24, FontWeight = FontWeights.Bold, Foreground = System.Windows.Media.Brushes.White, HorizontalAlignment = HorizontalAlignment.Center },
                new TextBlock { Text = "Versão 1.0.0", FontSize = 14, Foreground = (System.Windows.Media.SolidColorBrush)FindResource("BearMuted"), HorizontalAlignment = HorizontalAlignment.Center, Margin = new Thickness(0,8,0,16) },
                new TextBlock { Text = "Plataforma de distribuição e gerenciamento.\n© 2026 BEAR. Todos os direitos reservados.", FontSize = 13, Foreground = (System.Windows.Media.SolidColorBrush)FindResource("BearMuted"), TextAlignment = TextAlignment.Center, LineHeight = 22 }
            }}
        };
    }

    private UIElement CreatePlaceholderView(string title)
    {
        return new Border
        {
            Style = (Style)FindResource("BearCard"),
            Margin = new Thickness(0, 8, 0, 0),
            Child = new TextBlock { Text = $"Página: {title}\n\nConteúdo será implementado aqui.", FontSize = 14, Foreground = (System.Windows.Media.SolidColorBrush)FindResource("BearMuted"), TextAlignment = TextAlignment.Center, VerticalAlignment = VerticalAlignment.Center }
        };
    }

    private async void LogoutClick(object sender, RoutedEventArgs e)
    {
        await _authService.LogoutAsync();
        var loginWindow = new LoginWindow();
        loginWindow.Show();
        Close();
    }
}
