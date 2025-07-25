import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

import { Invoice } from '../../../core/models/invoice';
import { InvoiceFilters, InvoiceService } from '../../../core/services/invoice.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzTagModule,
    NzCardModule,
    NzInputModule,
    NzSelectModule,
    NzDatePickerModule,
    NzFormModule,
    NzGridModule,
    NzSpinModule,
    NzEmptyModule,
    NzPopconfirmModule,
    NzToolTipModule,
    NzDropDownModule,
    NzMenuModule
  ],
  template: `
    <div class="invoice-list-container">
      <div class="page-header">
        <h1>Invoice Management</h1>
        <button nz-button nzType="primary" (click)="createInvoice()">
          <span nz-icon nzType="plus"></span>
          Create Invoice
        </button>
      </div>

      <!-- Filters -->
      <nz-card nzTitle="Filters" class="filter-card" [nzBodyStyle]="{ padding: '16px' }">
        <form nz-form [formGroup]="filterForm" (ngSubmit)="applyFilters()">
          <div nz-row [nzGutter]="16">
            <div nz-col nzXs="24" nzSm="12" nzMd="6">
              <nz-form-item>
                <nz-form-label>Search</nz-form-label>
                <nz-form-control>
                  <input 
                    nz-input 
                    placeholder="Search by buyer name..." 
                    formControlName="buyerBusinessName"
                    (keyup.enter)="applyFilters()">
                </nz-form-control>
              </nz-form-item>
            </div>

            <div nz-col nzXs="24" nzSm="12" nzMd="6">
              <nz-form-item>
                <nz-form-label>Status</nz-form-label>
                <nz-form-control>
                  <nz-select 
                    nzPlaceHolder="Select status" 
                    formControlName="status"
                    nzAllowClear>
                    <nz-option nzValue="pending" nzLabel="Pending"></nz-option>
                    <nz-option nzValue="completed" nzLabel="Completed"></nz-option>
                    <nz-option nzValue="cancelled" nzLabel="Cancelled"></nz-option>
                    <nz-option nzValue="draft" nzLabel="Draft"></nz-option>
                  </nz-select>
                </nz-form-control>
              </nz-form-item>
            </div>

            <div nz-col nzXs="24" nzSm="12" nzMd="6">
              <nz-form-item>
                <nz-form-label>Invoice Type</nz-form-label>
                <nz-form-control>
                  <nz-select 
                    nzPlaceHolder="Select type" 
                    formControlName="invoiceType"
                    nzAllowClear>
                    <nz-option nzValue="Sale Invoice" nzLabel="Sale Invoice"></nz-option>
                    <nz-option nzValue="Purchase Invoice" nzLabel="Purchase Invoice"></nz-option>
                    <nz-option nzValue="Credit Note" nzLabel="Credit Note"></nz-option>
                    <nz-option nzValue="Debit Note" nzLabel="Debit Note"></nz-option>
                  </nz-select>
                </nz-form-control>
              </nz-form-item>
            </div>

            <div nz-col nzXs="24" nzSm="12" nzMd="6">
              <nz-form-item>
                <nz-form-label>Date Range</nz-form-label>
                <nz-form-control>
                  <nz-range-picker 
                    formControlName="dateRange"
                    nzFormat="yyyy-MM-dd">
                  </nz-range-picker>
                </nz-form-control>
              </nz-form-item>
            </div>
          </div>

          <div class="filter-actions">
            <button nz-button nzType="primary" (click)="applyFilters()">
              <span nz-icon nzType="search"></span>
              Search
            </button>
            <button nz-button (click)="resetFilters()">
              <span nz-icon nzType="reload"></span>
              Reset
            </button>
          </div>
        </form>
      </nz-card>

      <!-- Invoice Table -->
      <nz-card nzTitle="Invoices" class="table-card">
        <div class="table-actions" nz-card-extra>
          <button 
            nz-button 
            nzType="default" 
            (click)="refreshData()"
            nz-tooltip
            nzTooltipTitle="Refresh">
            <span nz-icon nzType="reload"></span>
          </button>
        </div>

        <nz-spin [nzSpinning]="loading">
          <nz-table 
            #invoiceTable 
            [nzData]="invoices"
            [nzTotal]="total"
            [nzPageSize]="pageSize"
            [nzPageIndex]="pageIndex"
            [nzShowSizeChanger]="true"
            [nzPageSizeOptions]="[10, 20, 50, 100]"
            [nzShowQuickJumper]="true"
            [nzShowTotal]="totalTemplate"
            (nzPageIndexChange)="onPageIndexChange($event)"
            (nzPageSizeChange)="onPageSizeChange($event)"
            nzSize="middle">
            
            <thead>
              <tr>
                <th nzWidth="120px">Invoice #</th>
                <th>Type</th>
                <th>Buyer Business</th>
                <th>Seller Business</th>
                <th>Date</th>
                <th nzWidth="120px">Amount (PKR)</th>
                <th nzWidth="100px">Status</th>
                <th nzWidth="150px" nzAlign="center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let invoice of invoiceTable.data; trackBy: trackByInvoice">
                <td>
                  <strong>{{ invoice.invoiceNumber }}</strong>
                  <div class="invoice-ref" *ngIf="invoice.invoiceRefNo">
                    <small>Ref: {{ invoice.invoiceRefNo }}</small>
                  </div>
                </td>
                <td>
                  <nz-tag nzColor="blue">{{ invoice.invoiceType }}</nz-tag>
                </td>
                <td>
                  <div class="business-info">
                    <strong>{{ invoice.buyerBusinessName }}</strong>
                    <div><small>{{ invoice.buyerProvince }}</small></div>
                  </div>
                </td>
                <td>
                  <div class="business-info">
                    <strong>{{ invoice.sellerBusinessName }}</strong>
                    <div><small>{{ invoice.sellerProvince }}</small></div>
                  </div>
                </td>
                <td>{{ invoice.invoiceDate | date:'dd/MM/yyyy' }}</td>
                <td>
                  <strong>{{ invoice.totalAmount | number:'1.2-2' }}</strong>
                </td>
                <td>
                  <nz-tag [nzColor]="getStatusColor(invoice.status!)">
                    {{ invoice.status | titlecase }}
                  </nz-tag>
                </td>
                <td nzAlign="center">
                  <div class="action-buttons">
                    <button 
                      nz-button 
                      nzType="link" 
                      nzSize="small"
                      (click)="viewInvoice(invoice.id!)"
                      nz-tooltip
                      nzTooltipTitle="View Details">
                      <span nz-icon nzType="eye"></span>
                    </button>

                    <button 
                      nz-button 
                      nzType="link" 
                      nzSize="small"
                      (click)="editInvoice(invoice.id!)"
                      nz-tooltip
                      nzTooltipTitle="Edit">
                      <span nz-icon nzType="edit"></span>
                    </button>

                    <button 
                      nz-button 
                      nzType="link" 
                      nzSize="small"
                      (click)="downloadPDF(invoice.id!)"
                      nz-tooltip
                      nzTooltipTitle="Download PDF">
                      <span nz-icon nzType="download"></span>
                    </button>

                    <div nz-dropdown [nzDropdownMenu]="actionMenu" nzPlacement="bottomRight">
                      <button nz-button nzType="link" nzSize="small">
                        <span nz-icon nzType="more"></span>
                      </button>
                    </div>

                    <nz-dropdown-menu #actionMenu="nzDropdownMenu">
                      <ul nz-menu>
                        <li nz-menu-item (click)="changeStatus(invoice.id!, 'completed')">
                          <span nz-icon nzType="check"></span>
                          Mark Completed
                        </li>
                        <li nz-menu-item (click)="changeStatus(invoice.id!, 'pending')">
                          <span nz-icon nzType="clock-circle"></span>
                          Mark Pending
                        </li>
                        <li nz-menu-divider></li>
                        <li nz-menu-item 
                            nz-popconfirm
                            nzPopconfirmTitle="Are you sure you want to delete this invoice?"
                            nzPopconfirmPlacement="topRight"
                            (nzOnConfirm)="deleteInvoice(invoice.id!)">
                          <span nz-icon nzType="delete" class="text-danger"></span>
                          Delete
                        </li>
                      </ul>
                    </nz-dropdown-menu>
                  </div>
                </td>
              </tr>
            </tbody>
          </nz-table>

          <ng-template #totalTemplate let-total let-range="range">
            Showing {{ range[0] }}-{{ range[1] }} of {{ total }} invoices
          </ng-template>

          <nz-empty 
            *ngIf="invoices.length === 0 && !loading"
            nzNotFoundContent="No invoices found">
            <div nz-empty-footer>
              <button nz-button nzType="primary" (click)="createInvoice()">
                Create Invoice
              </button>
            </div>
          </nz-empty>
        </nz-spin>
      </nz-card>
    </div>
  `,
  styles: [`
    .invoice-list-container {
      padding: 0;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .page-header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: #262626;
    }

    .filter-card, .table-card {
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      margin-bottom: 16px;
    }

    .filter-actions {
      display: flex;
      gap: 8px;
      margin-top: 16px;
    }

    .table-actions {
      display: flex;
      gap: 8px;
    }

    .action-buttons {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .business-info strong {
      display: block;
      margin-bottom: 2px;
    }

    .business-info small {
      color: #8c8c8c;
    }

    .invoice-ref {
      margin-top: 2px;
    }

    .invoice-ref small {
      color: #8c8c8c;
    }

    .text-danger {
      color: #ff4d4f !important;
    }

    :host ::ng-deep .ant-table-tbody > tr:hover > td {
      background: #f5f5f5;
    }

    :host ::ng-deep .ant-empty-footer {
      margin-top: 16px;
    }
  `]
})
export class InvoiceListComponent implements OnInit {
  invoices: Invoice[] = [];
  loading = false;
  total = 0;
  pageIndex = 1;
  pageSize = 10;
  filterForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private invoiceService: InvoiceService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.filterForm = this.fb.group({
      buyerBusinessName: [''],
      status: [null],
      invoiceType: [null],
      dateRange: [null]
    });
  }

  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices(): void {
    this.loading = true;
    const filters = this.buildFilters();
    
    this.invoiceService.getInvoices(filters).subscribe({
      next: (response) => {
        this.invoices = response.data.invoices;
        this.total = response.data.pagination.total;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading invoices:', error);
        this.loading = false;
      }
    });
  }

  buildFilters(): InvoiceFilters {
    const formValue = this.filterForm.value;
    const filters: InvoiceFilters = {
      page: this.pageIndex,
      limit: this.pageSize
    };

    if (formValue.buyerBusinessName) {
      filters.buyerBusinessName = formValue.buyerBusinessName;
    }
    if (formValue.status) {
      filters.status = formValue.status;
    }
    if (formValue.invoiceType) {
      filters.invoiceType = formValue.invoiceType;
    }
    if (formValue.dateRange && formValue.dateRange.length === 2) {
      filters.dateFrom = formValue.dateRange[0].toISOString().split('T')[0];
      filters.dateTo = formValue.dateRange[1].toISOString().split('T')[0];
    }

    return filters;
  }

  applyFilters(): void {
    this.pageIndex = 1;
    this.loadInvoices();
  }

  resetFilters(): void {
    this.filterForm.reset();
    this.pageIndex = 1;
    this.loadInvoices();
  }

  refreshData(): void {
    this.loadInvoices();
  }

  onPageIndexChange(pageIndex: number): void {
    this.pageIndex = pageIndex;
    this.loadInvoices();
  }

  onPageSizeChange(pageSize: number): void {
    this.pageSize = pageSize;
    this.pageIndex = 1;
    this.loadInvoices();
  }

  trackByInvoice(index: number, invoice: Invoice): number {
    return invoice.id || index;
  }

  getStatusColor(status: string): string {
    const statusColors: { [key: string]: string } = {
      'pending': 'orange',
      'completed': 'green',
      'cancelled': 'red',
      'draft': 'blue'
    };
    return statusColors[status.toLowerCase()] || 'default';
  }

  createInvoice(): void {
    this.router.navigate(['/invoices/create']);
  }

  viewInvoice(id: number): void {
    this.router.navigate(['/invoices/detail', id]);
  }

  editInvoice(id: number): void {
    this.router.navigate(['/invoices/edit', id]);
  }

  changeStatus(id: number, status: string): void {
    this.invoiceService.updateInvoiceStatus(id, status).subscribe({
      next: (response) => {
        this.notificationService.success('Success', `Invoice status updated to ${status}`);
        this.loadInvoices();
      },
      error: (error) => {
        console.error('Error updating status:', error);
      }
    });
  }

  deleteInvoice(id: number): void {
    this.invoiceService.deleteInvoice(id).subscribe({
      next: () => {
        this.notificationService.success('Success', 'Invoice deleted successfully');
        this.loadInvoices();
      },
      error: (error) => {
        console.error('Error deleting invoice:', error);
      }
    });
  }

  downloadPDF(id: number): void {
    this.invoiceService.downloadPDF(id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `invoice-${id}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.notificationService.success('Success', 'PDF downloaded successfully');
      },
      error: (error) => {
        console.error('Error downloading PDF:', error);
      }
    });
  }
}