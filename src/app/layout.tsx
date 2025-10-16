// src/app/layout.tsx
import './(site)/globals.css' // if you have global styles

export const metadata = {
  title: 'My Site',
  description: '…',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

