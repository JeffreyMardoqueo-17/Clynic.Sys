import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { TooltipProvider } from "@/components/ui/tooltip"
import { FloatingToaster } from "@/components/components/floating-toaster"
import { ToastProvider } from "@/hooks/use-toast"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Clynic System",
  description: "Sistema de gestión clínica",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <TooltipProvider>
          <ToastProvider>
            {children}
            <FloatingToaster />
          </ToastProvider>
        </TooltipProvider>
      </body>
    </html>
  )
}