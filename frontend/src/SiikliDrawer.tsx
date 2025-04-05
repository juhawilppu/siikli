
import { BarChart3, Box, FileText, Home, Package, Settings, Truck, Users, Warehouse } from "lucide-react"
import { NavLink } from "react-router-dom"
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarRail } from './components/ui/sidebar'

const SiikliDrawer = () => {

  const navItems = [
    { title: "Etusivu", href: '/', icon: Home, active: true },
    { title: "Tilaukset", href: '/orders', icon: Package },
    { title: "Uusi tilaus", href: '/orders/new', icon: Package },
    { title: "Pakkauslista", href: '/packaging-list', icon: FileText },
    { title: "Laskutus", href: '/invoices', icon: Users },
    { title: "Myyntiraportti", href: '/sales-report', icon: Box },
    { title: "Tuotteet", href: '/products', icon: Truck },
    { title: "Asiakkaat", href: '/customers', icon: Warehouse },
    { title: "Pakkausasetukset", href: '/packaging-settings', icon: BarChart3 },
    { title: "Oma yritys", href: '/own-company', icon: Settings },
  ]

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex h-14 items-center px-4">
            <span className="font-semibold text-xl">Siikli</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <NavLink to={item.href}>
                      <SidebarMenuButton asChild isActive={item.active}>
                        <a href="#">
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </NavLink>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <div className="p-4 text-xs text-muted-foreground">
            <p>Siikli ERP v2.0.0</p>
            <p>© 2025 Siikli Solutions</p>
          </div>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    </SidebarProvider>
  )
}

export default SiikliDrawer
