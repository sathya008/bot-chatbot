import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" style={{ background: 'transparent', backgroundColor: 'transparent' }}>
      <body
        className={inter.className}
        style={{
          background: 'transparent',
          backgroundColor: 'transparent',
          margin: 0,
          padding: 0
        }}
      >
        {children}
      </body>
    </html>
  )
}