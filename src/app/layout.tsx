import type { Metadata } from "next";
import { Nunito, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TopBar } from "@/components/TopBar";
import Link from "next/link";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "脑力星球 (Brain Planet) - 免费免登陆的儿童益智游戏平台",
  description: "精选全球优质儿童益智游戏，涵盖数学思维、逻辑推理、色彩感知。全免费、免登陆、无广告打扰，完美支持离线游玩的家长育儿神器。",
  keywords: ["儿童益智游戏", "免费无需登陆", "数学思维训练", "全脑开发", "育儿神器", "在线数独", "24点游戏", "宝宝学数学"],
  authors: [{ name: "Aimake" }],
  openGraph: {
    title: "脑力星球 (Brain Planet) - 免费免登陆的儿童益智游戏平台",
    description: "精选全球优质益智游戏，不收集隐私，无广告打扰，纯净的儿童脑力训练营。",
    url: "https://kids.aimake.cc",
    siteName: "脑力星球 (Brain Planet)",
    images: [
      {
        url: "https://kids.aimake.cc/icon.svg",
        width: 800,
        height: 600,
        alt: "脑力星球 (Brain Planet)",
      },
    ],
    locale: "zh_CN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "脑力星球 - 儿童益智训练营",
    description: "全免费、免登陆、支持离线的儿童益智游戏集合！",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "脑力星球",
  },
};

import Script from "next/script";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <Script id="json-ld" type="application/ld+json" strategy="beforeInteractive">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "脑力星球 (Brain Planet)",
            "url": "https://kids.aimake.cc",
            "description": "专为 3-12 岁设计的免费儿童益智游戏平台，涵盖数学思维、逻辑推理等全脑开发内容。",
            "applicationCategory": "EducationalGame",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "CNY"
            }
          })}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gray-50 flex flex-col`}
      >
        <TopBar />
        <main className="max-w-5xl mx-auto p-4 md:p-8 flex-1 w-full flex flex-col">
          {children}
        </main>
        
        {/* Footer */}
        <footer className="w-full py-6 mt-auto bg-white border-t border-gray-100">
          <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
            <div>
              &copy; {new Date().getFullYear()} 脑力星球 (Brain Planet). All rights reserved.
            </div>
            <div className="flex items-center gap-6">
              <a 
                href="https://chico.aimake.cc/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-green-600 transition-colors font-medium"
              >
                Powered by Chico
              </a>
              <Link 
                href="/about" 
                className="hover:text-indigo-600 transition-colors font-medium flex items-center gap-1"
              >
                关于星球
              </Link>
              <a 
                href="https://github.com/chicogong/brain-planet" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-gray-900 transition-colors font-medium flex items-center gap-1"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"></path>
                </svg>
                GitHub 仓库
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
