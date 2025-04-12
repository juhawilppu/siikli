import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DashboardDataDto } from "@/types/types"
import { formatDate } from "@/utils/date"
import { formatMoneyFi } from "@/utils/money"
import axios from "axios"
import { FileText, Package, Plus, Truck, Users } from "lucide-react"
import { useEffect, useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"

const formatMetric = (value: number, unit: 'money' | 'count') => {
    if (unit == 'money') {
        return formatMoneyFi(value, 0)
    } else {
        return value
    }
}

export const Dashboard = () => {
    const [data, setData] = useState<DashboardDataDto>()
    const navigate = useNavigate()

    useEffect(() => {
        axios.get('/dashboard').then(res => setData(res.data))
    }, [])

    const metrics = [
        { title: "Kokonaismyynti tänä vuonna", data: data?.metrics.salesThisYear },
        { title: "Laskuja lähetetty", data: data?.metrics.invoicesSent },
        { title: "Tilauksia tänään", data: data?.metrics.ordersToday },
        { title: "Laskuttamattomat myynnit", data: data?.metrics.uninvoiced },
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
                                <div className="text-2xl font-bold">{metric.data ? formatMetric(metric.data.value, metric.data.unit) : '-'}</div>
                                {metric.data?.change ?
                                    <p className={`text-xs ${metric.data?.change > 0 ? "text-green-500" : "text-red-500"}`}>
                                        {metric.data?.change} verrattuna viime kk
                                    </p> : <p className="text-xs">-</p>}
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
                            <CardTitle>Tilaukset</CardTitle>
                            <CardDescription>{data ? `Sinulla on ${data.orders.length} tilausta tänään` : '-'}</CardDescription>
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
                                    <TableHead className="text-right">Summa</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data && data.orders.map((order) => (
                                    <TableRow key={order.orderId}>
                                        <TableCell className="font-medium">{order.orderId}</TableCell>
                                        <TableCell>{order.customerName}</TableCell>
                                        <TableCell>{formatDate(order.deliveryDate)}</TableCell>
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