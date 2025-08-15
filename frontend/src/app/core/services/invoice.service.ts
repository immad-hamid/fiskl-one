import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { InvoiceListResponse, ApiResponse, Invoice, InvoiceStats } from '../models/invoice';

export interface InvoiceFilters {
  page?: number;
  limit?: number;
  status?: string;
  invoiceType?: string;
  sellerBusinessName?: string;
  buyerBusinessName?: string;
  dateFrom?: string;
  dateTo?: string;
}

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private readonly apiUrl = `${environment.apiUrl}/invoices`;

  constructor(private http: HttpClient) {}

  getInvoices(filters: InvoiceFilters = {}): Observable<InvoiceListResponse> {
    let params = new HttpParams();
    
    Object.keys(filters).forEach(key => {
      const value = filters[key as keyof InvoiceFilters];
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<InvoiceListResponse>(this.apiUrl, { params });
  }

  getInvoiceById(id: number): Observable<ApiResponse<Invoice>> {
    return this.http.get<ApiResponse<Invoice>>(`${this.apiUrl}/${id}`);
  }

  createInvoice(invoice: Invoice): Observable<ApiResponse<Invoice>> {
    return this.http.post<ApiResponse<Invoice>>(this.apiUrl, invoice);
  }

  updateInvoice(id: number, invoice: Partial<Invoice>): Observable<ApiResponse<Invoice>> {
    return this.http.put<ApiResponse<Invoice>>(`${this.apiUrl}/${id}`, invoice);
  }

  updateInvoiceStatus(id: number, status: string): Observable<ApiResponse<Invoice>> {
    return this.http.patch<ApiResponse<Invoice>>(`${this.apiUrl}/${id}/status`, { status });
  }

  updateInvoiceFbrStatus(id: number, fbrStatus: string): Observable<ApiResponse<Invoice>> {
    return this.http.patch<ApiResponse<Invoice>>(`${this.apiUrl}/${id}/fbr-status`, { fbrStatus });
  }

  postToFbr(id: number): Observable<ApiResponse<Invoice>> {
    return this.http.post<ApiResponse<Invoice>>(`${this.apiUrl}/${id}/post-to-fbr`, {});
  }

  deleteInvoice(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  downloadPDF(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/pdf`, { 
      responseType: 'blob'
    });
  }

  getInvoiceStats(): Observable<ApiResponse<InvoiceStats>> {
    return this.http.get<ApiResponse<InvoiceStats>>(`${this.apiUrl}/stats`);
  }
}