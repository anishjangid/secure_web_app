import { SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import { currentUser } from '@clerk/nextjs/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Upload, Users, BarChart3 } from 'lucide-react'
import Link from 'next/link'

export default async function Home() {
  const user = await currentUser()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Secure Web App</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link href="/dashboard">
                  <Button variant="outline">Dashboard</Button>
                </Link>
                <UserButton afterSignOutUrl="/" />
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <SignInButton mode="modal">
                  <Button variant="outline">Sign In</Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button>Sign Up</Button>
                </SignUpButton>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Secure Web Application
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Role-Based Access Control & Secure File Upload
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Shield className="h-12 w-12 text-blue-600 mx-auto mb-2" />
              <CardTitle>RBAC System</CardTitle>
              <CardDescription>
                5 distinct roles with fine-grained permissions
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Upload className="h-12 w-12 text-green-600 mx-auto mb-2" />
              <CardTitle>File Upload</CardTitle>
              <CardDescription>
                Secure file upload with real-time progress
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Users className="h-12 w-12 text-purple-600 mx-auto mb-2" />
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Complete user and role management interface
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <BarChart3 className="h-12 w-12 text-orange-600 mx-auto mb-2" />
              <CardTitle>Analytics</CardTitle>
              <CardDescription>
                Dashboard with stats and activity tracking
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {!user && (
          <div className="text-center">
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle>Get Started</CardTitle>
                <CardDescription>
                  Sign up to access the full application features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <SignUpButton mode="modal">
                  <Button className="w-full">Create Account</Button>
                </SignUpButton>
                <SignInButton mode="modal">
                  <Button variant="outline" className="w-full">Sign In</Button>
                </SignInButton>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-gray-600 dark:text-gray-400">
          <p>&copy; 2024 Secure Web App. Built with Next.js, Clerk, and Prisma.</p>
        </div>
      </footer>
    </div>
  )
}
