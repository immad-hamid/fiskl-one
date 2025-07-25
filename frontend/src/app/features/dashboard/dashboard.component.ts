import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';

import { Invoice, InvoiceStats } from '../../core/models/invoice';
import { InvoiceService } from '../../core/services/invoice.service';
import { NotificationService } from '../../core/services/notification.service';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzStatisticModule,
    NzButtonModule,
    NzIconModule,
    NzGridModule,
    NzTableModule,
    NzTagModule,
    NzSpinModule,
    NzEmptyModule
  ],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1>Dashboard</h1>
        <button nz-button nzType="primary" (click)="createInvoice()">
          <span nz-icon nzType="plus"></span>
          Create Invoice
        </button>
      </div>

      <!-- Statistics Cards -->
      <div nz-row [nzGutter]="16" class="stats-row">
        <div nz-col nzXs="24" nzSm="12" nzMd="6">
          <nz-card class="stat-card">
            <nz-statistic
              nzTitle="Total Invoices"
              [nzValue]="stats?.totalInvoices || 0"
              nzPrefix="📄"
              [nzValueStyle]="{ color: '#1890ff' }">
            </nz-statistic>
          </nz-card>
        </div>

        <div nz-col nzXs="24" nzSm="12" nzMd="6">
          <nz-card class="stat-card">
            <nz-statistic
              nzTitle="Pending Invoices"
              [nzValue]="stats?.pendingInvoices || 0"
              nzPrefix="⏳"
              [nzValueStyle]="{ color: '#faad14' }">
            </nz-statistic>
          </nz-card>
        </div>

        <div nz-col nzXs="24" nzSm="12" nzMd="6">
          <nz-card class="stat-card">
            <nz-statistic
              nzTitle="Completed Invoices"
              [nzValue]="stats?.completedInvoices || 0"
              nzPrefix="✅"
              [nzValueStyle]="{ color: '#52c41a' }">
            </nz-statistic>
          </nz-card>
        </div>

        <div nz-col nzXs="24" nzSm="12" nzMd="6">
          <nz-card class="stat-card">
            <nz-statistic
              nzTitle="Total Amount"
              [nzValue]="stats?.totalAmount || 0"
              nzPrefix="PKR "
              [nzValueStyle]="{ color: '#722ed1' }">
            </nz-statistic>
          </nz-card>
        </div>
      </div>

      <!-- Recent Invoices -->
      <nz-card nzTitle="Recent Invoices" class="recent-invoices-card">
        <div class="card-extra" nz-card-extra>
          <button nz-button nzType="link" (click)="viewAllInvoices()">
            View All
          </button>
        </div>

        <nz-spin [nzSpinning]="loadingInvoices">
          <nz-table 
            #basicTable 
            [nzData]="recentInvoices" 
            [nzShowPagination]="false"
            [nzSize]="'middle'">
            <thead>
              <tr>
                <th>Invoice Number</th>
                <th>Type</th>
                <th>Buyer</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let invoice of basicTable.data">
                <td>
                  <strong>{{ invoice.invoiceNumber }}</strong>
                </td>
                <td>{{ invoice.invoiceType }}</td>
                <td>{{ invoice.buyerBusinessName }}</td>
                <td>{{ invoice.invoiceDate | date:'dd/MM/yyyy' }}</td>
                <td>PKR {{ invoice.totalAmount | number:'1.2-2' }}</td>
                <td>
                  <nz-tag 
                    [nzColor]="getStatusColor(invoice.status!)">
                    {{ invoice.status | titlecase }}
                  </nz-tag>
                </td>
                <td>
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
                      (click)="downloadPDF(invoice.id!)"
                      nz-tooltip
                      nzTooltipTitle="Download PDF">
                      <span nz-icon nzType="download"></span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </nz-table>

          <nz-empty 
            *ngIf="recentInvoices.length === 0 && !loadingInvoices"
            nzNotFoundContent="No invoices found">
          </nz-empty>
        </nz-spin>
      </nz-card>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 0;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .dashboard-header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: #262626;
    }

    .stats-row {
      margin-bottom: 24px;
    }

    .stat-card {
      text-align: center;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: all 0.3s;
    }

    .stat-card:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transform: translateY(-2px);
    }

    .recent-invoices-card {
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .action-buttons {
      display: flex;
      gap: 8px;
    }

    :host ::ng-deep .ant-statistic-title {
      font-size: 14px;
      color: #8c8c8c;
      margin-bottom: 8px;
    }

    :host ::ng-deep .ant-statistic-content {
      font-size: 24px;
      font-weight: 600;
    }

    :host ::ng-deep .ant-table-tbody > tr:hover > td {
      background: #f5f5f5;
    }
  `]
})
export class DashboardComponent implements OnInit {
  stats: InvoiceStats | null = null;
  recentInvoices: Invoice[] = [];
  loadingStats = false;
  loadingInvoices = false;

  constructor(
    private invoiceService: InvoiceService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loadStats();
    this.loadRecentInvoices();
  }

  loadStats(): void {
    this.loadingStats = true;
    this.invoiceService.getInvoiceStats().subscribe({
      next: (response) => {
        this.stats = response.data;
        this.loadingStats = false;
      },
      error: (error) => {
        console.error('Error loading stats:', error);
        this.loadingStats = false;
      }
    });
  }

  loadRecentInvoices(): void {
    this.loadingInvoices = true;
    this.invoiceService.getInvoices({ page: 1, limit: 5 }).subscribe({
      next: (response) => {
        this.recentInvoices = response.data.invoices;
        this.loadingInvoices = false;
      },
      error: (error) => {
        console.error('Error loading recent invoices:', error);
        this.loadingInvoices = false;
      }
    });
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

  viewAllInvoices(): void {
    this.router.navigate(['/invoices/list']);
  }

  viewInvoice(id: number): void {
    this.router.navigate(['/invoices/detail', id]);
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
        this.notificationService.error('Error', 'Failed to download PDF');
      }
    });
  }
}