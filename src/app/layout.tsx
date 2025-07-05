import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthWrapper from "./AuthWrapper";

const inter = Inter({
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: "Escriba",
  description: "AI writing assistant markdown editor with GitHub integration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} flex flex-col h-full`}>
        <AuthWrapper>{children}</AuthWrapper>
      </body>
    </html>
  );
}
