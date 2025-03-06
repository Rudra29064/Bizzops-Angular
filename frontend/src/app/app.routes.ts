import { Routes } from '@angular/router';
import { InventoryComponent } from './components/inventory/inventory.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SalesComponent } from './components/sales/sales.component';
import { InvoiceComponent } from './components/invoice/invoice.component';
import { ExpensesComponent } from './components/expenses/expenses.component';
import { LandingComponent } from './components/landing/landing.component';
import { SigninComponent } from './components/signin/signin.component';
import { SignupComponent } from './components/signup/signup.component';
import { PricingComponent } from './components/pricing/pricing.component';

export const routes: Routes = [
  { path: '', component: LandingComponent }, // Default route
  { path: 'landing', component: LandingComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'inventory', component: InventoryComponent },
  { path: 'sales', component: SalesComponent },
  { path: 'invoice', component: InvoiceComponent },
  { path: 'expenses', component: ExpensesComponent },
  { path: 'signin', component: SigninComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'pricing', component: PricingComponent },
//   { path: 'orders', component: OrdersComponent },
//   { path: 'report', component: ReportComponent },
//   { path: 'notes', component: NotesComponent },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' }
];