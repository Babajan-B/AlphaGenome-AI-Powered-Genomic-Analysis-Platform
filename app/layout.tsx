import type { Metadata } from 'next'
import '../styles/globals.css'

export const metadata: Metadata = {
  title: 'AlphaGenome - AI-Powered Genomic Analysis',
  description: 'Professional genomic sequence analysis powered by Google Gemini AI. Developed by Dr. Babajan Banaganapalli',
  authors: [{ name: 'Dr. Babajan Banaganapalli', url: 'https://github.com/Babajan-B' }],
  creator: 'Dr. Babajan Banaganapalli',
  keywords: ['genomics', 'bioinformatics', 'AI', 'AlphaGenome', 'DeepMind', 'Google Gemini', 'gene prediction', 'variant analysis'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {children}
      </body>
    </html>
  )
}