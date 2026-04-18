import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Guia IA — Sua jornada com inteligencia artificial",
  description:
    "Plataforma interna para guiar colaboradores no uso de ferramentas de IA. Descubra como IA pode transformar seu trabalho.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased" suppressHydrationWarning>
      <body
        className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
