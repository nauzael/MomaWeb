import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-sans",
});

const poppinsHeading = Poppins({
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-heading",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://momanature.com'),
  title: {
    default: "Moma | Turismo de Naturaleza y Aventura en Colombia",
    template: "%s | Moma Nature"
  },
  description: "Descubre experiencias únicas en la naturaleza colombiana con Moma. Turismo sostenible, aventura y conexión con comunidades locales.",
  keywords: ["turismo de naturaleza", "colombia", "ecoturismo", "aventura", "viajes sostenibles", "moma nature"],
  authors: [{ name: "Moma Nature Team" }],
  creator: "Moma Nature",
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: "https://momanature.com",
    title: "Moma | Turismo de Naturaleza",
    description: "Descubre la magia de la naturaleza colombiana con experiencias únicas y sostenibles.",
    siteName: "Moma Nature",
    images: [
      {
        url: "/images/hero-bg.jpg", // Ensure this exists or use a valid public image path
        width: 1200,
        height: 630,
        alt: "Moma Nature - Turismo de Naturaleza en Colombia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Moma | Turismo de Naturaleza",
    description: "Explora Colombia con Moma Nature. Experiencias auténticas y sostenibles.",
    images: ["/images/hero-bg.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased text-foreground selection:bg-moma-green/30",
          poppinsHeading.variable,
          poppins.variable
        )}
        suppressHydrationWarning
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Moma Nature',
              url: 'https://momanature.com',
              logo: 'https://momanature.com/images/logo.png',
              sameAs: [
                'https://facebook.com/momanature',
                'https://instagram.com/momanature',
                'https://twitter.com/momanature'
              ],
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+57 321 456 7890',
                contactType: 'customer service',
                areaServed: 'CO',
                availableLanguage: 'es'
              }
            })
          }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          forcedTheme="light"
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
