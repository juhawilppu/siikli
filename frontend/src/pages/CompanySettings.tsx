"use client"

import type React from "react"

import { Save } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GetCompanySettings } from "@/types/types"
import axios from "axios"

export default function CompanySettings() {
  const [companyData, setCompanyData] = useState<GetCompanySettings>()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCompanyData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically save the data to your backend
    console.log("Saving company data:", companyData)
    // Show success message or handle errors
  }


  useEffect(() => {
    axios
      .get(`/tenants`)
      .then((response) => {
        setCompanyData(response.data)
      })
  }, [])

  if (!companyData) {
    return <div></div>
  }

  return (
    <>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Oma yritys</h1>
        <p className="text-muted-foreground">Voit hallinnoida yrityksesi asetuksia täällä</p>
      </div>

      <Tabs defaultValue="company" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="company">Yritys</TabsTrigger>
          <TabsTrigger value="users">Käyttäjät</TabsTrigger>
          <TabsTrigger value="preferences">Asetukset</TabsTrigger>
        </TabsList>

        <TabsContent value="company">
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Yritys</CardTitle>
                <CardDescription>
                  Update your company details. This information will appear on invoices and other documents.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nimi</Label>
                      <Input id="name" name="name" value={companyData?.name} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="businessId">Y-tunnus</Label>
                      <Input
                        id="businessId"
                        name="businessId"
                        value={companyData.businessId}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <Separator className="my-4" />
                  <h3 className="text-lg font-medium">Osoite</h3>

                  <div className="space-y-2">
                    <Label htmlFor="streetAddress">Katuosoite</Label>
                    <Input
                      id="streetAddress"
                      name="streetAddress"
                      value={companyData.streetAddress}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Postinumero</Label>
                      <Input
                        id="postalCode"
                        name="postalCode"
                        value={companyData.postalCode}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="city">Kaupunki</Label>
                      <Input id="city" name="city" value={companyData.city} onChange={handleInputChange} />
                    </div>
                  </div>

                  <Separator className="my-4" />
                  <h3 className="text-lg font-medium">Banking Information</h3>

                  <div className="space-y-2">
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input
                      id="bankName"
                      name="bankName"
                      value={companyData.invoiceBankName}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="bankAccount">Bank Account (IBAN)</Label>
                      <Input
                        id="bankAccount"
                        name="bankAccount"
                        value={companyData.invoiceBankNumber}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="swiftBic">SWIFT/BIC</Label>
                      <Input
                        id="swiftBic"
                        name="swiftBic"
                        value={companyData.invoiceReference}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <Separator className="my-4" />
                  <h3 className="text-lg font-medium">Contact Information</h3>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" name="phone" value={companyData.phone} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={companyData.email}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      name="website"
                      value={companyData.website}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Cancel</Button>
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage user accounts and permissions.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">User management settings will appear here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>System Preferences</CardTitle>
              <CardDescription>Configure system-wide preferences and defaults.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">System preferences settings will appear here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  )
}

