import type React from 'react'

import axios from 'axios'
import { ArrowRight, Loader2 } from 'lucide-react'

import posthog from 'posthog-js'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/app/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTranslation } from '../../lib/translations'

export default function LoginForm() {
  const t = useTranslation()
  const [email, setEmail] = useState('')
  const [pin, setPin] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [pinSent, setPinSent] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()

  const handleGoogleLogin = () => {
    posthog.capture('google_login', {
      variant: localStorage.getItem('variant'),
    })
    window.location.href = '/api/auth/google'
  }

  const handleSendPin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes('@')) {
      toast({
        title: 'Virheellinen sähköposti',
        description: 'Syötä voimassa oleva sähköpostiosoite.',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)

    try {
      setPin(Array.from({ length: 6 }).fill('') as string[])
      await axios.post('/auth/email/create-pin', {
        email,
      })
      posthog.capture('send_pin', {
        variant: localStorage.getItem('variant'),
      })
      setPinSent(true)
      toast({
        title: 'PIN-koodi lähetetty',
        description: `PIN-koodi on lähetetty osoitteeseen ${email}.`,
      })
    }
    catch (error) {
      if ((error as any).response.status === 429) {
        toast({
          title: 'Virhe',
          description: 'Olet yrittänyt liian monta kertaa. Yritä hetken kuluttua uudelleen.',
          variant: 'destructive',
        })
      }
      else {
        toast({
          title: 'Virhe',
          description: 'Virheellinen sähköpostiosoite.',
          variant: 'destructive',
        })
      }
    }
    finally {
      setIsLoading(false)
    }
  }

  // Handle PIN code input
  const handlePinChange = (index: number, value: string) => {
    // Handle single character input
    if (value.length > 1) {
      value = value.slice(0, 1)
    }

    const newPin = [...pin]
    newPin[index] = value

    // Move focus to next input if a character was entered
    if (value && index < 5) {
      const nextInput = document.getElementById(`pin-${index + 1}`)
      if (nextInput) {
        nextInput.focus()
      }
    }

    setPin(newPin)
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text')
    const digits = pastedData.replace(/\D/g, '').split('').slice(0, 6)
    const newPin = [...pin]

    digits.forEach((digit, i) => {
      if (i < 6) {
        newPin[i] = digit
      }
    })

    setPin(newPin)

    // Focus the last filled input or the last input if all are filled
    const lastFilledIndex = newPin.findIndex(p => p === '')
    const focusIndex = lastFilledIndex === -1 ? 5 : lastFilledIndex
    const nextInput = document.getElementById(`pin-${focusIndex}`)
    if (nextInput) {
      nextInput.focus()
    }
  }

  // Check pin code
  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const pinCode = pin.join('')
    if (pinCode.length !== 6) {
      toast({
        title: t('login.form.email.invalid.invalidPin'),
        description: t('login.form.email.invalid.enter6DigitPin'),
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    try {
      await axios.post('/auth/email/check-pin', {
        email,
        pinCode,
      })
      navigate('/app')
    }
    catch (error) {
      console.log('error.status', (error as any).status)
      if ((error as any).status === 429) {
        toast({
          title: t('login.form.email.invalid.error'),
          description: t('login.form.email.invalid.tooManyAttempts'),
          variant: 'destructive',
        })
      }
      else {
        toast({
          title: t('login.form.email.invalid.error'),
          description: t('login.form.email.invalid.invalidPin'),
          variant: 'destructive',
        })
      }
    }
    finally {
      setIsLoading(false)
    }
  }

  // Handle keyboard events in PIN code fields
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Backspace key: delete current character and move to previous field
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      const prevInput = document.getElementById(`pin-${index - 1}`)
      if (prevInput) {
        prevInput.focus()
      }
    }
  }

  return (
    <Tabs defaultValue="google" className="w-full">
      <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 mb-4 h-auto min-h-[5rem] sm:min-h-[2.5rem]">
        <TabsTrigger value="google">
          {t('login.form.google')}
        </TabsTrigger>
        <TabsTrigger value="email">
          {t('login.form.email')}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="google" className="space-y-4 mt-6">
        <Button
          className="w-full max-w-md mx-auto flex items-center justify-center gap-2"
          size="lg"
          onClick={handleGoogleLogin}
          disabled={isLoading}
        >
          {isLoading
            ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              )
            : (
                <>
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  {t('login.form.google')}
                </>
              )}
        </Button>
      </TabsContent>
      <TabsContent value="email" className="space-y-4">
        {!pinSent
          ? (
              <form onSubmit={handleSendPin} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    {t('login.form.email.title')}
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('login.form.email.placeholder')}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ArrowRight className="h-4 w-4 mr-2" />}
                  {t('login.form.email.sendPin')}
                </Button>
              </form>
            )
          : (
              <form onSubmit={handlePinSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="pin-0" className="text-sm font-medium">
                    {t('login.form.email.enter6DigitPin')}
                  </label>
                  <p className="text-xs text-muted-foreground">
                    {t('login.form.email.pinSentTo')}
                    {' '}
                    {email}
                  </p>
                  <div className="flex gap-2 justify-between mt-2">
                    {pin.map((digit, index) => (
                      <Input
                        key={index}
                        id={`pin-${index}`}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        className="w-10 h-12 text-center text-lg"
                        value={digit}
                        onChange={e => handlePinChange(index, e.target.value)}
                        onKeyDown={e => handleKeyDown(index, e)}
                        onPaste={handlePaste}
                        autoFocus={index === 0}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <button type="button" className="text-sm text-primary hover:underline" onClick={() => setPinSent(false)}>
                    {t('login.form.email.changeEmail')}
                  </button>
                  <button type="button" className="text-sm text-primary hover:underline" onClick={handleSendPin}>
                    {t('login.form.email.sendPinAgain')}
                  </button>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading || pin.includes('')}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ArrowRight className="h-4 w-4 mr-2" />}
                  {t('login.form.email.login')}
                </Button>
              </form>
            )}
      </TabsContent>
    </Tabs>
  )
}
