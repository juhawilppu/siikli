import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, Package, Plus, Truck, Users } from "lucide-react"

export const Dashboard = () => {
    const recentOrders = [
        { id: "ORD-7392", customer: "Maatilayhtiö Oy", date: "2023-04-01", status: "Delivered", amount: "€2,345.00" },
        { id: "ORD-7391", customer: "Viljelijät Cooperative", date: "2023-03-30", status: "In Transit", amount: "€1,789.50" },
        { id: "ORD-7390", customer: "Suomen Maatalous Ltd", date: "2023-03-29", status: "Processing", amount: "€3,210.75" },
        { id: "ORD-7389", customer: "Organic Farms Finland", date: "2023-03-28", status: "Delivered", amount: "€945.25" },
        { id: "ORD-7388", customer: "Kasvattajat Group", date: "2023-03-27", status: "Delivered", amount: "€4,567.00" },
    ]

    const metrics = [
        { title: "Total Sales This Year", value: "€2.4M", change: "+12.5%" },
        { title: "Invoices Sent", value: "187", change: "+4.3%" },
        { title: "Orders In Transit", value: "24", change: "-2.1%" },
        { title: "Open Customer Balances", value: "€145K", change: "-8.7%" },
    ]

    const quickActions = [
        { title: "New Order", icon: Package },
        { title: "New Invoice", icon: FileText },
        { title: "Add Customer", icon: Users },
        { title: "Schedule Transport", icon: Truck },
    ]
    return (
        <>
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">Welcome back to Siikli ERP. Here's what's happening today.</p>
            </div>

            {/* Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {metrics.map((metric) => (
                    <Card key={metric.title}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metric.value}</div>
                            <p className={`text-xs ${metric.change.startsWith("+") ? "text-green-500" : "text-red-500"}`}>
                                {metric.change} from last month
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Common tasks you can perform right away</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        {quickActions.map((action) => (
                            <Button key={action.title} variant="outline" className="h-auto flex-col gap-2 p-4">
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
                        <CardTitle>Recent Orders</CardTitle>
                        <CardDescription>You have {recentOrders.length} orders this week</CardDescription>
                    </div>
                    <Button size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        New Order
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
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
                        Previous
                    </Button>
                    <Button variant="outline" size="sm">
                        Next
                    </Button>
                </CardFooter>
            </Card>
        </>
    )
}