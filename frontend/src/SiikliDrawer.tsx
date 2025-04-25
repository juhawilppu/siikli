
import { Boxes, Building2, ClipboardList, FileText, Home, LineChart, PlusCircle, Receipt, ShoppingBasket, Users } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail } from './components/ui/sidebar';

export const navItems = [
  { title: "Etusivu", href: '/', icon: Home },
  { title: "Tilaukset", href: '/orders', icon: ClipboardList },
  { title: "Uusi tilaus", href: '/orders/new', icon: PlusCircle },
  { title: "Pakkauslista", href: '/packaging-list', icon: FileText },
  { title: "Laskutus", href: '/invoices', icon: Receipt },
  { title: "Myyntiraportti", href: '/sales-report', icon: LineChart },
  { title: "Tuotteet", href: '/products', icon: ShoppingBasket },
  { title: "Asiakkaat", href: '/customers', icon: Users },
  { title: "Pakkausasetukset", href: '/packaging-settings', icon: Boxes },
  { title: "Oma yritys", href: '/own-company', icon: Building2 },
];

const SiikliDrawer = () => {

  const location = useLocation();

  const isActive = (href: string) => location.pathname === href


  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex h-14 items-center px-4">
          <span className="text-primary font-semibold text-xl">Siikli</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <NavLink to={item.href}>
                    <SidebarMenuButton asChild isActive={isActive(item.href)}>
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
  )
}

export default SiikliDrawer
