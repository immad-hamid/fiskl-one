import { Routes } from '@angular/router';

export const INVOICE_ROUTES: Routes = [
  {
    path: 'list',
    loadComponent: () =>
      import('./invoice-list/invoice-list.component').then(
        (m) => m.InvoiceListComponent
      ),
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./invoice-form/invoice-form.component').then(
        (m) => m.InvoiceFormComponent
      ),
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./invoice-form/invoice-form.component').then(
        (m) => m.InvoiceFormComponent
      ),
  },
  {
    path: 'detail/:id',
    loadComponent: () =>
      import('./invoice-detail/invoice-detail.component').then(
        (m) => m.InvoiceDetailComponent
      ),
  },
  { path: '', redirectTo: 'list', pathMatch: 'full' },
];
