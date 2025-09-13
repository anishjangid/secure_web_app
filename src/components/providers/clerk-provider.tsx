'use client'

import { ClerkProvider } from '@clerk/nextjs'
import { ReactNode } from 'react'

interface ClerkProviderWrapperProps {
  children: ReactNode
}

export function ClerkProviderWrapper({ children }: ClerkProviderWrapperProps) {
  return (
    <ClerkProvider
      appearance={{
        elements: {
          formButtonPrimary: 'bg-primary hover:bg-primary/90',
          card: 'bg-card',
          headerTitle: 'text-foreground',
          headerSubtitle: 'text-muted-foreground',
          socialButtonsBlockButton: 'border border-input',
          socialButtonsBlockButtonText: 'text-foreground',
          formFieldInput: 'bg-background border-input',
          footerActionLink: 'text-primary hover:text-primary/80',
        },
      }}
    >
      {children}
    </ClerkProvider>
  )
}
