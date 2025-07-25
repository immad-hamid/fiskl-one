import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NzCardComponent } from 'ng-zorro-antd/card';
import { NzDescriptionsComponent, NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzDividerComponent } from 'ng-zorro-antd/divider';
import {
    NzDropDownModule,
} from 'ng-zorro-antd/dropdown';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { Invoice } from '../../../core/models/invoice';
import { InvoiceService } from '../../../core/services/invoice.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-invoice-form',
  standalone: true,
  imports: [
    CommonModule,
    NzCardComponent,
    NzStatisticModule,
    NzTagModule,
    NzDescriptionsModule,
    NzDropDownModule,
    NzTableModule,
    NzDividerComponent,
    NzDropDownModule,
    NzGridModule,
    NzSpinModule,
    NzTagModule,
  ],
  template: ` <div class="invoice-detail-container">
    <div class="page-header">
      <div class="header-left">
        <button nz-button (click)="goBack()">
          <span nz-icon nzType="arrow-left"></span>
          Back
        </button>
        <h1 *ngIf="invoice">Invoice {{ invoice.invoiceNumber }}</h1>
      </div>
      <div class="header-actions" *ngIf="invoice">
        <button nz-button (click)="editInvoice()">
          <span nz-icon nzType="edit"></span>
          Edit
        </button>
        <button nz-button nzType="primary" (click)="downloadPDF()">
          <span nz-icon nzType="download"></span>
          Download PDF
        </button>
        <div
          nz-dropdown
          [nzDropdownMenu]="actionMenu"
          nzPlacement="bottomRight"
        >
          <button nz-button>
            <span nz-icon nzType="more"></span>
          </button>
        </div>
        <nz-dropdown-menu #actionMenu="nzDropdownMenu">
          <ul nz-menu>
            <li nz-menu-item (click)="changeStatus('completed')">
              <span nz-icon nzType="check"></span>
              Mark Completed
            </li>
            <li nz-menu-item (click)="changeStatus('pending')">
              <span nz-icon nzType="clock-circle"></span>
              Mark Pending
            </li>
            <li nz-menu-divider></li>
            <li
              nz-menu-item
              nz-popconfirm
              nzPopconfirmTitle="Are you sure you want to delete this invoice?"
              (nzOnConfirm)="deleteInvoice()"
            >
              <span nz-icon nzType="delete" class="text-danger"></span>
              Delete Invoice
            </li>
          </ul>
        </nz-dropdown-menu>
      </div>
    </div>
    <nz-spin [nzSpinning]="loading">
      <div *ngIf="invoice">
        <!-- Invoice Header -->
        <nz-card class="detail-card">
          <div nz-row nzGutter="16">
            <div nz-col nzXs="24" nzSm="12" nzMd="6">
              <nz-statistic
                nzTitle="Invoice Type"
                [nzValue]="invoice.invoiceType"
              >
              </nz-statistic>
            </div>
            <div nz-col nzXs="24" nzSm="12" nzMd="6">
              <!-- <nz-statistic
                nzTitle="Invoice Date"
                [nzValue]="invoice.invoiceDate | date : 'dd/MM/yyyy'"
              >
              </nz-statistic> -->
            </div>
            <div nz-col nzXs="24" nzSm="12" nzMd="6">
              <!-- <nz-statistic
                nzTitle="Status"
                [nzValue]="invoice.status | titlecase"
              >
                <ng-template #nzValueTemplate>
                  <nz-tag [nzColor]="getStatusColor(invoice.status!)">
                    {{ invoice.status | titlecase }}
                  </nz-tag>
                </ng-template>
              </nz-statistic> -->
            </div>
            <div nz-col nzXs="24" nzSm="12" nzMd="6">
              <nz-statistic
                nzTitle="Total Amount"
                [nzValue]="invoice.totalAmount!"
                nzPrefix="PKR "
                [nzValueStyle]="{
                  color: '#1890ff',
                  fontSize: '24px',
                  fontWeight: 'bold'
                }"
              >
              </nz-statistic>
            </div>
          </div>
        </nz-card>

        <!-- Invoice Details -->
        <nz-card nzTitle="Invoice Information" class="detail-card">
          <nz-descriptions
            nzBordered
            [nzColumn]="{ xxl: 3, xl: 2, lg: 2, md: 2, sm: 1, xs: 1 }"
          >
            <nz-descriptions-item nzTitle="Invoice Number">
              <strong>{{ invoice.invoiceNumber }}</strong>
            </nz-descriptions-item>
            <nz-descriptions-item
              nzTitle="Reference Number"
              *ngIf="invoice.invoiceRefNo"
            >
              {{ invoice.invoiceRefNo }}
            </nz-descriptions-item>
            <nz-descriptions-item nzTitle="Scenario ID">
              <nz-tag nzColor="blue">{{ invoice.scenarioId }}</nz-tag>
            </nz-descriptions-item>
            <nz-descriptions-item nzTitle="Created Date">
              {{ invoice.createdAt | date : 'dd/MM/yyyy HH:mm' }}
            </nz-descriptions-item>
            <nz-descriptions-item nzTitle="Last Updated">
              {{ invoice.updatedAt | date : 'dd/MM/yyyy HH:mm' }}
            </nz-descriptions-item>
          </nz-descriptions>
        </nz-card>

        <!-- Seller & Buyer Information -->
        <div nz-row [nzGutter]="16">
          <div nz-col nzXs="24" nzMd="12">
            <nz-card nzTitle="Seller Information" class="detail-card">
              <nz-descriptions nzBordered [nzColumn]="1">
                <nz-descriptions-item nzTitle="Business Name">
                  <strong>{{ invoice.sellerBusinessName }}</strong>
                </nz-descriptions-item>
                <nz-descriptions-item nzTitle="NTN/CNIC">
                  {{ invoice.sellerNTNCNIC }}
                </nz-descriptions-item>
                <nz-descriptions-item nzTitle="Province">
                  {{ invoice.sellerProvince }}
                </nz-descriptions-item>
                <nz-descriptions-item nzTitle="Address">
                  {{ invoice.sellerAddress }}
                </nz-descriptions-item>
              </nz-descriptions>
            </nz-card>
          </div>

          <div nz-col nzXs="24" nzMd="12">
            <nz-card nzTitle="Buyer Information" class="detail-card">
              <nz-descriptions nzBordered [nzColumn]="1">
                <nz-descriptions-item nzTitle="Business Name">
                  <strong>{{ invoice.buyerBusinessName }}</strong>
                </nz-descriptions-item>
                <nz-descriptions-item nzTitle="NTN/CNIC">
                  {{ invoice.buyerNTNCNIC }}
                </nz-descriptions-item>
                <nz-descriptions-item nzTitle="Province">
                  {{ invoice.buyerProvince }}
                </nz-descriptions-item>
                <nz-descriptions-item nzTitle="Registration Type">
                  <nz-tag
                    [nzColor]="
                      invoice.buyerRegistrationType === 'Registered'
                        ? 'green'
                        : 'orange'
                    "
                  >
                    {{ invoice.buyerRegistrationType }}
                  </nz-tag>
                </nz-descriptions-item>
                <nz-descriptions-item nzTitle="Address">
                  {{ invoice.buyerAddress }}
                </nz-descriptions-item>
              </nz-descriptions>
            </nz-card>
          </div>
        </div>

        <!-- Invoice Items -->
        <nz-card nzTitle="Invoice Items" class="detail-card">
          <nz-table
            [nzData]="invoice.items"
            [nzShowPagination]="false"
            nzSize="small"
            [nzScroll]="{ x: '1200px' }"
          >
            <thead>
              <tr>
                <th nzLeft>HS Code</th>
                <th>Description</th>
                <th>Rate</th>
                <th>UoM</th>
                <th nzAlign="right">Quantity</th>
                <th nzAlign="right">Unit Price</th>
                <th nzAlign="right">Sales Tax</th>
                <th nzAlign="right">FED</th>
                <th nzAlign="right">Discount</th>
                <th nzAlign="right">Further Tax</th>
                <th nzAlign="right" nzRight>Total Value</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of invoice.items; let i = index">
                <td nzLeft>
                  <strong>{{ item.hsCode }}</strong>
                </td>
                <td>
                  <div class="item-description">
                    {{ item.productDescription }}
                    <div *ngIf="item.saleType" class="item-meta">
                      <small>Type: {{ item.saleType }}</small>
                    </div>
                  </div>
                </td>
                <td>{{ item.rate }}</td>
                <td>{{ item.uoM }}</td>
                <td nzAlign="right">{{ item.quantity | number : '1.2-2' }}</td>
                <td nzAlign="right">
                  PKR {{ item.valueSalesExcludingST | number : '1.2-2' }}
                </td>
                <td nzAlign="right">
                  PKR {{ item.salesTaxApplicable | number : '1.2-2' }}
                </td>
                <td nzAlign="right">
                  PKR {{ item.fedPayable | number : '1.2-2' }}
                </td>
                <td nzAlign="right">
                  PKR {{ item.discount | number : '1.2-2' }}
                </td>
                <td nzAlign="right">
                  PKR {{ item.furtherTax | number : '1.2-2' }}
                </td>
                <td nzAlign="right" nzRight>
                  <strong class="total-amount"
                    >PKR {{ item.totalValues | number : '1.2-2' }}</strong
                  >
                </td>
              </tr>
            </tbody>
          </nz-table>

          <!-- Invoice Summary -->
          <div class="invoice-summary">
            <div class="summary-content">
              <div class="summary-row">
                <span>Subtotal (Excl. Tax):</span>
                <span>PKR {{ getSubtotal() | number : '1.2-2' }}</span>
              </div>
              <div class="summary-row">
                <span>Total Sales Tax:</span>
                <span>PKR {{ getTotalSalesTax() | number : '1.2-2' }}</span>
              </div>
              <div class="summary-row">
                <span>Total FED:</span>
                <span>PKR {{ getTotalFED() | number : '1.2-2' }}</span>
              </div>
              <div class="summary-row">
                <span>Total Discount:</span>
                <span>PKR {{ getTotalDiscount() | number : '1.2-2' }}</span>
              </div>
              <div class="summary-row">
                <span>Total Further Tax:</span>
                <span>PKR {{ getTotalFurtherTax() | number : '1.2-2' }}</span>
              </div>
              <nz-divider></nz-divider>
              <div class="summary-row grand-total">
                <span><strong>Grand Total:</strong></span>
                <span
                  ><strong
                    >PKR {{ invoice.totalAmount | number : '1.2-2' }}</strong
                  ></span
                >
              </div>
            </div>
          </div>
        </nz-card>
      </div>
    </nz-spin>
  </div>`,
  styles: [
    `
      .invoice-detail-container {
        padding: 0;
      }
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
      }

      .header-left {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .header-left h1 {
        margin: 0;
        font-size: 24px;
        font-weight: 600;
        color: #262626;
      }

      .header-actions {
        display: flex;
        gap: 8px;
      }

      .detail-card {
        margin-bottom: 16px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .item-description {
        max-width: 200px;
      }

      .item-meta {
        margin-top: 4px;
      }

      .item-meta small {
        color: #8c8c8c;
      }

      .total-amount {
        color: #1890ff;
        font-size: 14px;
      }

      .invoice-summary {
        margin-top: 24px;
        display: flex;
        justify-content: flex-end;
      }

      .summary-content {
        min-width: 300px;
        background: #fafafa;
        padding: 16px;
        border-radius: 6px;
      }

      .summary-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        padding: 4px 0;
      }

      .summary-row:last-child {
        margin-bottom: 0;
      }

      .grand-total {
        font-size: 16px;
        color: #1890ff;
      }

      .text-danger {
        color: #ff4d4f !important;
      }

      :host ::ng-deep .ant-statistic-title {
        font-size: 14px;
        color: #8c8c8c;
        margin-bottom: 8px;
      }

      :host ::ng-deep .ant-descriptions-item-label {
        font-weight: 500;
        background-color: #fafafa;
      }

      :host ::ng-deep .ant-table-thead > tr > th {
        background-color: #fafafa;
        font-weight: 600;
      }
    `,
  ],
})
export class InvoiceDetailComponent implements OnInit {
  invoice: Invoice | null = null;
  loading = false;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private invoiceService: InvoiceService,
    private notificationService: NotificationService
  ) {}
  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.loadInvoice(+params['id']);
      }
    });
  }
  loadInvoice(id: number): void {
    this.loading = true;
    this.invoiceService.getInvoiceById(id).subscribe({
      next: (response) => {
        this.invoice = response.data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading invoice:', error);
        this.notificationService.error('Error', 'Failed to load invoice');
        this.loading = false;
      },
    });
  }
  getStatusColor(status: string): string {
    const statusColors: { [key: string]: string } = {
      pending: 'orange',
      completed: 'green',
      cancelled: 'red',
      draft: 'blue',
    };
    return statusColors[status.toLowerCase()] || 'default';
  }
  getSubtotal(): number {
    if (!this.invoice?.items) return 0;
    return this.invoice.items.reduce(
      (sum, item) => sum + Number(item.valueSalesExcludingST),
      0
    );
  }
  getTotalSalesTax(): number {
    if (!this.invoice?.items) return 0;
    return this.invoice.items.reduce(
      (sum, item) => sum + Number(item.salesTaxApplicable),
      0
    );
  }
  getTotalFED(): number {
    if (!this.invoice?.items) return 0;
    return this.invoice.items.reduce(
      (sum, item) => sum + Number(item.fedPayable),
      0
    );
  }
  getTotalDiscount(): number {
    if (!this.invoice?.items) return 0;
    return this.invoice.items.reduce(
      (sum, item) => sum + Number(item.discount),
      0
    );
  }
  getTotalFurtherTax(): number {
    if (!this.invoice?.items) return 0;
    return this.invoice.items.reduce(
      (sum, item) => sum + Number(item.furtherTax),
      0
    );
  }
  goBack(): void {
    this.router.navigate(['/invoices/list']);
  }
  editInvoice(): void {
    if (this.invoice?.id) {
      this.router.navigate(['/invoices/edit', this.invoice.id]);
    }
  }
  changeStatus(status: string): void {
    if (!this.invoice?.id) return;
    this.invoiceService.updateInvoiceStatus(this.invoice.id, status).subscribe({
      next: (response) => {
        this.invoice = response.data;
        this.notificationService.success(
          'Success',
          `Invoice status updated to ${status}`
        );
      },
      error: (error) => {
        console.error('Error updating status:', error);
      },
    });
  }
  deleteInvoice(): void {
    if (!this.invoice?.id) return;
    this.invoiceService.deleteInvoice(this.invoice.id).subscribe({
      next: () => {
        this.notificationService.success(
          'Success',
          'Invoice deleted successfully'
        );
        this.router.navigate(['/invoices/list']);
      },
      error: (error) => {
        console.error('Error deleting invoice:', error);
      },
    });
  }
  downloadPDF(): void {
    if (!this.invoice?.id) return;
    this.invoiceService.downloadPDF(this.invoice.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `invoice-${this.invoice!.invoiceNumber}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.notificationService.success(
          'Success',
          'PDF downloaded successfully'
        );
      },
      error: (error) => {
        console.error('Error downloading PDF:', error);
      },
    });
  }
}
