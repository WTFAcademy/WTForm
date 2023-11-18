import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { createRoot } from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';
import './globals.css'

const inter = Inter({ subsets: ['latin'] })
const root = createRoot(document.getElementById('root'));

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <Auth0Provider
        domain="dev-0iu7uwkq2z18z0b6.us.auth0.com"
        clientId="kAUYPqHDP3DKp7qEFVD1tWWWW6Rn3jrg"
        authorizationParams={{
          redirect_uri: window.location.origin
        }}
      >
          <body className={inter.className}>{children}</body>
      </Auth0Provider>,
    </html>
  )
}
