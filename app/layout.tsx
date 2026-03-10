import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { TooltipProvider } from "@/components/ui/tooltip"
import { FloatingToaster } from "@/components/components/floating-toaster"
import { ToastProvider } from "@/hooks/use-toast"
import { ThemeProvider } from "@/components/theme-provider"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const BASE_URL = "https://clynic-sys.vercel.app"

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Clynic System — Software de gestion clinica",
    template: "%s | Clynic System",
  },
  description:
    "Plataforma SaaS para centros clinicos privados. Gestiona citas, pacientes, historial clinico, sucursales y equipos medicos desde un solo panel. Arranca en minutos.",
  keywords: [
    "software clinica",
    "sistema de citas medicas",
    "gestion clinica",
    "expediente medico",
    "agenda medica",
    "software medico",
    "SaaS salud",
    "administracion clinica",
    "historial clinico",
  ],
  authors: [{ name: "Clynic System", url: BASE_URL }],
  creator: "Clynic System",
  openGraph: {
    type: "website",
    locale: "es_SV",
    url: BASE_URL,
    siteName: "Clynic System",
    title: "Clynic System — Software de gestion clinica",
    description:
      "Plataforma SaaS para centros clinicos privados. Gestiona citas, pacientes, historial clinico, sucursales y equipos medicos desde un solo panel.",
    images: [
      {
        url: "/system/Dashboard_Adminstracion.png",
        width: 1280,
        height: 720,
        alt: "Clynic System — Panel administrativo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Clynic System — Software de gestion clinica",
    description:
      "Plataforma SaaS para centros clinicos privados. Agenda, pacientes, historial clinico y sucursales en un solo panel.",
    images: ["/system/Dashboard_resepcion.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: BASE_URL,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            <ToastProvider>
              {children}
              <FloatingToaster />
            </ToastProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}