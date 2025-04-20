import type React from "react"

import { ArrowRight, Loader2 } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import axios from "axios"

export default function LoginForm() {
    const [email, setEmail] = useState("")
    const [pin, setPin] = useState(["", "", "", "", "", ""])
    const [isLoading, setIsLoading] = useState(false)
    const [pinSent, setPinSent] = useState(false)
    const { toast } = useToast()

    const handleGoogleLogin = () => {
        setIsLoading(true)
        window.location.href = "/auth/google"
    }

    const handleSendPin = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email || !email.includes("@")) {
            toast({
                title: "Virheellinen sähköposti",
                description: "Syötä voimassa oleva sähköpostiosoite.",
                variant: "destructive",
            })
            return
        }

        setIsLoading(true)

        try {
            await axios.post('/auth/email/create-pin', {
                email
            })
            setPinSent(true)
            toast({
                title: "PIN-koodi lähetetty",
                description: `PIN-koodi on lähetetty osoitteeseen ${email}.`,
            })
        } catch (error) {
            toast({
                title: "Virhe",
                description: "Virheellinen sähköpostiosoite.",
            })
        } finally {
            setIsLoading(false)
        }
    }

    // Käsittele PIN-koodin syöttö
    const handlePinChange = (index: number, value: string) => {
        if (value.length > 1) {
            value = value.slice(0, 1)
        }

        const newPin = [...pin]
        newPin[index] = value

        // Siirrä fokus seuraavaan kenttään, jos syötetty merkki
        if (value && index < 5) {
            const nextInput = document.getElementById(`pin-${index + 1}`)
            if (nextInput) {
                nextInput.focus()
            }
        }

        setPin(newPin)
    }

    // Check pin code
    const handlePinSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const pinCode = pin.join("")
        if (pinCode.length !== 6) {
            toast({
                title: "Virheellinen PIN-koodi",
                description: "Syötä kaikki 6 numeroa.",
                variant: "destructive",
            })
            return
        }

        setIsLoading(true)
        try {
            await axios.post('/auth/email/check-pin', {
                email,
                pinCode
            })
        } catch (error) {
            console.log('error.status', (error as any).status)
            if ((error as any).status === 429) {
                toast({
                    title: "Virhe",
                    description: "Olet yrittänyt liian monta kertaa. Yritä hetken kuluttua uudelleen.",
                    variant: "destructive",
                })
            } else {
                toast({
                    title: "Virhe",
                    description: "Virheellinen PIN-koodi.",
                    variant: "destructive",
                })
            }
        } finally {
            setIsLoading(false)
        }
    }

    // Käsittele näppäimistötapahtumat PIN-koodikentissä
    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        // Backspace-näppäin: poista nykyinen merkki ja siirry edelliseen kenttään
        if (e.key === "Backspace" && !pin[index] && index > 0) {
            const prevInput = document.getElementById(`pin-${index - 1}`)
            if (prevInput) {
                prevInput.focus()
            }
        }
    }

    return (
        <Tabs defaultValue="google" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="google">Google</TabsTrigger>
                <TabsTrigger value="email">Sähköposti</TabsTrigger>
            </TabsList>
            <TabsContent value="google" className="space-y-4">
                <div className="text-sm text-muted-foreground mb-4">
                    Kirjaudu sisään Google-tililläsi nopeasti ja turvallisesti.
                </div>
                <Button
                    className="w-full flex items-center justify-center gap-2"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
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
                            Kirjaudu Google-tilillä
                        </>
                    )}
                </Button>
            </TabsContent>
            <TabsContent value="email" className="space-y-4">
                {!pinSent ? (
                    <form onSubmit={handleSendPin} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">
                                Sähköpostiosoite
                            </label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="nimi@yritys.fi"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ArrowRight className="h-4 w-4 mr-2" />}
                            Lähetä PIN-koodi
                        </Button>
                    </form>
                ) : (
                    <form onSubmit={handlePinSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="pin-0" className="text-sm font-medium">
                                Syötä 6-numeroinen PIN-koodi
                            </label>
                            <p className="text-xs text-muted-foreground">PIN-koodi on lähetetty osoitteeseen {email}</p>
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
                                        onChange={(e) => handlePinChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        autoFocus={index === 0}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <button type="button" className="text-sm text-primary hover:underline" onClick={() => setPinSent(false)}>
                                Vaihda sähköposti
                            </button>
                            <button type="button" className="text-sm text-primary hover:underline" onClick={handleSendPin}>
                                Lähetä koodi uudelleen
                            </button>
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading || pin.some((p) => p === "")}>
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ArrowRight className="h-4 w-4 mr-2" />}
                            Kirjaudu sisään
                        </Button>
                    </form>
                )}
            </TabsContent>
        </Tabs>
    )
}
