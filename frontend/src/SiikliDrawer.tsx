import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'

import NewOrderIcon from '@mui/icons-material/Add'
import SalesReportIcon from '@mui/icons-material/BarChart'
import CustomersIcon from '@mui/icons-material/ContactMail'
import PackageListIcon from '@mui/icons-material/Description'
import InvoicesIcon from '@mui/icons-material/Email'
import ProductsIcon from '@mui/icons-material/Layers'
import OwnCompanyIcon from '@mui/icons-material/Store'
import OrdersIcon from '@mui/icons-material/Web'
import { NavLink } from 'react-router-dom'

const SiikliDrawer = () => {
  return (
    <Drawer
      variant='permanent'
      anchor='left'
      open={true}
      sx={{ toolbar: (theme) => theme.mixins.toolbar }}
    >
      <Divider />
      <List sx={{ marginTop: '60px' }}>
        <NavLink
          to='/orders'
          id='drawer-orders'
          end
          className={({ isActive }) => (isActive ? 'active' : 'inactive')}
        >
          <ListItem button>
            <ListItemIcon>
              <OrdersIcon />
            </ListItemIcon>
            <ListItemText primary='Tilaukset' />
          </ListItem>
        </NavLink>
        <NavLink
          to='/orders/0/edit'
          id='drawer-new-order'
          className={({ isActive }) => (isActive ? 'active' : 'inactive')}
        >
          <ListItem button>
            <ListItemIcon>
              <NewOrderIcon />
            </ListItemIcon>
            <ListItemText primary='Uusi tilaus' />
          </ListItem>
        </NavLink>
        <NavLink
          to='/packaging_list'
          className={({ isActive }) => (isActive ? 'active' : 'inactive')}
        >
          <ListItem button>
            <ListItemIcon>
              <PackageListIcon />
            </ListItemIcon>
            <ListItemText primary='Pakkauslista' />
          </ListItem>
        </NavLink>
        <NavLink
          to='/invoices'
          className={({ isActive }) => (isActive ? 'active' : 'inactive')}
        >
          <ListItem button>
            <ListItemIcon>
              <InvoicesIcon />
            </ListItemIcon>
            <ListItemText primary='Laskutus' />
          </ListItem>
        </NavLink>
        <NavLink
          to='/sales_report'
          className={({ isActive }) => (isActive ? 'active' : 'inactive')}
        >
          <ListItem button>
            <ListItemIcon>
              <SalesReportIcon />
            </ListItemIcon>
            <ListItemText primary='Myyntiraportti' />
          </ListItem>
        </NavLink>
        <NavLink
          to='/products'
          id='drawer-products'
          className={({ isActive }) => (isActive ? 'active' : 'inactive')}
        >
          <ListItem button>
            <ListItemIcon>
              <ProductsIcon />
            </ListItemIcon>
            <ListItemText primary='Tuotteet' />
          </ListItem>
        </NavLink>
        <NavLink
          to='/customers'
          id='drawer-customers'
          className={({ isActive }) => (isActive ? 'active' : 'inactive')}
        >
          <ListItem button>
            <ListItemIcon>
              <CustomersIcon />
            </ListItemIcon>
            <ListItemText primary='Asiakkaat' />
          </ListItem>
        </NavLink>
        <NavLink
          to='/package_configuration'
          className={({ isActive }) => (isActive ? 'active' : 'inactive')}
        >
          <ListItem button>
            <ListItemIcon>
              <OwnCompanyIcon />
            </ListItemIcon>
            <ListItemText primary='Pakkausasetukset' />
          </ListItem>
        </NavLink>
        <NavLink
          to='/own_company'
          className={({ isActive }) => (isActive ? 'active' : 'inactive')}
        >
          <ListItem button>
            <ListItemIcon>
              <OwnCompanyIcon />
            </ListItemIcon>
            <ListItemText primary='Oma yritys' />
          </ListItem>
        </NavLink>
      </List>
    </Drawer>
  )
}

export default SiikliDrawer
