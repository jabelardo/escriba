import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Provider from "./Provider";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { MarkdownProvider } from "@/context/MarkdownContext";
import { ProjectProvider } from "@/context/ProjectContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Escriba",
  description: "Your AI writing assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Provider>
          <ProjectProvider>
            <MarkdownProvider>
              <div className="flex h-screen">
                <Sidebar />
                <main className="flex-1 overflow-y-auto">
                  {children}
                </main>
              </div>
            </MarkdownProvider>
          </ProjectProvider>
        </Provider>
      </body>
    </html>
  );
}
