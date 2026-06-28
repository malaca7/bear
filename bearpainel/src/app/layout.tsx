import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import AuthInitializer from "./AuthInitializer";
import "./globals.css";

export const metadata: Metadata = {
  title: "BEAR Platform",
  description: "Plataforma de distribuição e gerenciamento de aplicativo BEAR",
  keywords: ["BEAR", "platform", "license", "management"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthInitializer />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
