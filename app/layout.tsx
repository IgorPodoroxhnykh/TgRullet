
import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";
import ErudaProvider from "@/components/ErudaProvider";



export const metadata: Metadata = {
  title: "Telegram Mini App",
  description: "A Simple Telegram Mini App using Next.js 16",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  return (
    <html lang="ru">
      <head>
        <Script src='https://telegram.org/js/telegram-web-app.js' strategy="beforeInteractive" />
      </head>
      <body
      >
        <ErudaProvider>
          {children}
        </ErudaProvider>

      </body>
    </html>
  );
}
