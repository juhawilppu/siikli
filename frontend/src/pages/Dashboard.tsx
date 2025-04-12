import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DashboardDataDto } from "@/types/types"
import axios from "axios"
import { FileText, Package, Plus, Truck, Users } from "lucide-react"
import { useEffect, useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"

export const Dashboard = () => {
    const [data, setData] = useState<DashboardDataDto>()
    const navigate = useNavigate()

    useEffect(() => {
        axios.get('/dashboard').then(res => setData(res.data))
    }, [])

    const recentOrders = [
        { id: "ORD-7392", customer: "Maatilayhtiö Oy", date: "2023-04-01", status: "Delivered", amount: "€2,345.00" },
        { id: "ORD-7391", customer: "Viljelijät Cooperative", date: "2023-03-30", status: "In Transit", amount: "€1,789.50" },
        { id: "ORD-7390", customer: "Suomen Maatalous Ltd", date: "2023-03-29", status: "Processing", amount: "€3,210.75" },
        { id: "ORD-7389", customer: "Organic Farms Finland", date: "2023-03-28", status: "Delivered", amount: "€945.25" },
        { id: "ORD-7388", customer: "Kasvattajat Group", date: "2023-03-27", status: "Delivered", amount: "€4,567.00" },
    ]

    const metrics = [
        { title: "Kokonaismyynti tänä vuonna", data: data?.salesThisYear },
        { title: "Laskuja lähetetty", data: data?.salesThisYear },
        { title: "Tilauksia tänään", data: data?.salesThisYear },
        { title: "Laskuttamattomat myynnit", data: data?.salesThisYear },
    ]

    const quickActions = [
        { title: "Uusi tilaus", icon: Package, href: '/orders/new' },
        { title: "Kuormakirjat tänään", icon: FileText, href: '/orders/new' },
        { title: "Luo asiakas", icon: Users, href: '/customers' },
        { title: "Luo tuote", icon: Truck, href: '/products' },
    ]
    return (
        <>
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Etusivu</h1>
                <p className="text-muted-foreground">Tervetuloa Siikliin! Katso viimeaikaiset tapahtumat tästä.</p>
            </div>
            <div className="space-y-5">

                {/* Metrics */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {metrics.map((metric) => (
                        <Card key={metric.title}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{metric.data ? metric.data.value : '-'}</div>
                                {metric.data ?
                                    <p className={`text-xs ${metric.data?.change > 0 ? "text-green-500" : "text-red-500"}`}>
                                        {metric.data?.change} verrattuna viime kk
                                    </p> : <p>-</p>}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Pikatoiminnot</CardTitle>
                        <CardDescription>Usein käytetyt toiminnot</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                            {quickActions.map((action) => (
                                <Button onClick={() => navigate(action.href)} key={action.title} variant="outline" className="h-auto flex-col gap-2 p-4">
                                    <action.icon className="h-5 w-5" />
                                    <span>{action.title}</span>
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Orders */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Viimeaikaiset tilaukset</CardTitle>
                            <CardDescription>Sinulla on {recentOrders.length} tilausta tällä viikolla</CardDescription>
                        </div>
                        <NavLink to='/orders/new'>
                            <Button size="sm">
                                <Plus className="mr-2 h-4 w-4" />
                                Uusi tilaus
                            </Button>
                        </NavLink>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tilaus ID</TableHead>
                                    <TableHead>Asiakas</TableHead>
                                    <TableHead>Päivämäärä</TableHead>
                                    <TableHead>Tila</TableHead>
                                    <TableHead className="text-right">Summa</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentOrders.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-medium">{order.id}</TableCell>
                                        <TableCell>{order.customer}</TableCell>
                                        <TableCell>{order.date}</TableCell>
                                        <TableCell>
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${order.status === "Delivered"
                                                    ? "bg-green-100 text-green-800"
                                                    : order.status === "In Transit"
                                                        ? "bg-blue-100 text-blue-800"
                                                        : "bg-yellow-100 text-yellow-800"
                                                    }`}
                                            >
                                                {order.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">{order.amount}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button variant="outline" size="sm">
                            Edellinen
                        </Button>
                        <Button variant="outline" size="sm">
                            Seuraava
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </>
    )
}