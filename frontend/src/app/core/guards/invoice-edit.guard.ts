import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { InvoiceService } from '../services/invoice.service';
import { NotificationService } from '../services/notification.service';

export const invoiceEditGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const invoiceService = inject(InvoiceService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);
  
  const invoiceId = route.paramMap.get('id');
  
  if (!invoiceId) {
    router.navigate(['/invoices/list']);
    return false;
  }

  return invoiceService.getInvoiceById(+invoiceId).pipe(
    map(response => {
      const invoice = response.data;
      
      // Check if invoice is completed and posted to FBR
      if (invoice.status === 'completed' && invoice.fbrStatus === 'posted') {
        notificationService.warning(
          'Access Denied', 
          'This invoice has been posted to FBR and cannot be edited.'
        );
        router.navigate(['/invoices/detail', invoiceId]);
        return false;
      }
      
      return true;
    }),
    catchError(error => {
      console.error('Error checking invoice status:', error);
      notificationService.error(
        'Error', 
        'Unable to verify invoice status. Please try again.'
      );
      router.navigate(['/invoices/list']);
      return of(false);
    })
  );
};
