import type React from 'react'

import axios from 'axios'
import { ArrowRight, Loader2 } from 'lucide-react'

import posthog from 'posthog-js'
import { useState } from 'react'
import { GoogleIcon } from '@/app/components/custom-icons'
import { useAuth } from '@/app/context/AuthContext'
import { useToast } from '@/app/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTranslation } from '@/lib/translations'

export default function LoginForm() {
  const t = useTranslation()

  const { refreshSession } = useAuth()
  const [email, setEmail] = useState('')
  const [pin, setPin] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [pinSent, setPinSent] = useState(false)
  const { toast } = useToast()

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
      await refreshSession()
    }
    catch (error) {
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
                  <GoogleIcon />
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
                  <div className="flex gap-2 justify-center mt-2 w-full max-w-xs mx-auto">
                    {pin.map((digit, index) => (
                      <Input
                        key={index}
                        id={`pin-${index}`}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        className="w-10 h-12 text-center text-lg flex-shrink-0"
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
