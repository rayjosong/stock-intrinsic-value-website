import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AppHeader } from "@/components/app-header"
import { AppFooter } from "@/components/app-footer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Stock Analysis Platform",
  description: "Comprehensive stock analysis with intrinsic value and economic moat assessment",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppHeader />
        <main className="min-h-screen">{children}</main>
        <AppFooter />
      </body>
    </html>
  )
}



import './globals.css'