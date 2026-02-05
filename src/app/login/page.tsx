'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { loginAction } from '@/actions/user'
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react'

type LoginForm = {
  email: string
  password: string
}

export default function LoginPage() {
  const { register, handleSubmit } = useForm<LoginForm>()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const onSubmit = async (data: LoginForm) => {
    setLoading(true)
    setError('')

    const formData = new FormData()
    formData.append('email', data.email)
    formData.append('password', data.password)

    const result = await loginAction(formData)

    if (!result?.success) {
      setError(result?.message || 'Login gagal')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>
            Masuk untuk melanjutkan
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4 mt-4"
          >
            <div>
              <label className="text-sm flex items-center gap-2">
                <Mail className="w-4 h-4" /> Email
              </label>
              <input
                {...register('email')}
                type="email"
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="text-sm flex items-center gap-2">
                <Lock className="w-4 h-4" /> Password
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className="w-full border rounded px-3 py-2 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-gray-500" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            <Button
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Signing in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}