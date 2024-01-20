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
import { StyledLink } from './StyledLink'

const SiikliDrawer = () => {
  return (
    <Drawer
      variant='permanent'
      anchor='left'
      open={true}
      sx={{ toolbar: (theme) => theme.mixins.toolbar }}
    >
      <Divider />
      <List>
        <StyledLink to='/orders' id='drawer-orders'>
          <ListItem button>
            <ListItemIcon>
              <OrdersIcon />
            </ListItemIcon>
            <ListItemText primary='Tilaukset' />
          </ListItem>
        </StyledLink>
        <StyledLink to='/orders/0/edit' id='drawer-new-order'>
          <ListItem button>
            <ListItemIcon>
              <NewOrderIcon />
            </ListItemIcon>
            <ListItemText primary='Uusi tilaus' />
          </ListItem>
        </StyledLink>
        <StyledLink to='/packaging_list'>
          <ListItem button>
            <ListItemIcon>
              <PackageListIcon />
            </ListItemIcon>
            <ListItemText primary='Pakkauslista' />
          </ListItem>
        </StyledLink>
        <StyledLink to='/invoices'>
          <ListItem button>
            <ListItemIcon>
              <InvoicesIcon />
            </ListItemIcon>
            <ListItemText primary='Laskutus' />
          </ListItem>
        </StyledLink>
        <StyledLink to='/sales_report'>
          <ListItem button>
            <ListItemIcon>
              <SalesReportIcon />
            </ListItemIcon>
            <ListItemText primary='Myyntiraportti' />
          </ListItem>
        </StyledLink>
        <StyledLink to='/products' id='drawer-products'>
          <ListItem button>
            <ListItemIcon>
              <ProductsIcon />
            </ListItemIcon>
            <ListItemText primary='Tuotteet' />
          </ListItem>
        </StyledLink>
        <StyledLink to='/customers' id='drawer-customers'>
          <ListItem button>
            <ListItemIcon>
              <CustomersIcon />
            </ListItemIcon>
            <ListItemText primary='Asiakkaat' />
          </ListItem>
        </StyledLink>
        <StyledLink to='/package_configuration'>
          <ListItem button>
            <ListItemIcon>
              <OwnCompanyIcon />
            </ListItemIcon>
            <ListItemText primary='Pakkausasetukset' />
          </ListItem>
        </StyledLink>
        <StyledLink to='/own_company'>
          <ListItem button>
            <ListItemIcon>
              <OwnCompanyIcon />
            </ListItemIcon>
            <ListItemText primary='Oma yritys' />
          </ListItem>
        </StyledLink>
      </List>
    </Drawer>
  )
}

export default SiikliDrawer
