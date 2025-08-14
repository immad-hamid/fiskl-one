import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';

import { Invoice } from '../../core/models/invoice';
import { InvoiceService } from '../../core/services/invoice.service';

interface ReportData {
  totalInvoices: number;
  totalAmount: number;
  averageAmount: number;
  byStatus: { [key: string]: number };
  byType: { [key: string]: number };
  monthlyData: { month: string; amount: number; count: number }[];
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule,
    NzDatePickerModule,
    NzSelectModule,
    NzFormModule,
    NzGridModule,
    NzStatisticModule,
    NzTableModule,
    NzTagModule,
    NzSpinModule,
    NzEmptyModule,
  ],
  template: `
    <div class="reports-container">
      <div class="page-header">
        <h1>Reports & Analytics</h1>
      </div>

      <!-- Report Filters -->
      <nz-card
        nzTitle="Report Filters"
        class="filter-card"
        [nzBodyStyle]="{ padding: '16px' }"
      >
        <form nz-form [formGroup]="filterForm" (ngSubmit)="generateReport()">
          <div nz-row [nzGutter]="16">
            <div nz-col nzXs="24" nzSm="12" nzMd="8">
              <nz-form-item>
                <nz-form-label>Date Range</nz-form-label>
                <nz-form-control>
                  <nz-range-picker
                    formControlName="dateRange"
                    nzFormat="yyyy-MM-dd"
                    style="width: 100%"
                  >
                  </nz-range-picker>
                </nz-form-control>
              </nz-form-item>
            </div>

            <div nz-col nzXs="24" nzSm="12" nzMd="8">
              <nz-form-item>
                <nz-form-label>Status</nz-form-label>
                <nz-form-control>
                  <nz-select
                    formControlName="status"
                    nzPlaceHolder="All Statuses"
                    nzAllowClear
                    style="width: 100%"
                  >
                    <nz-option nzValue="pending" nzLabel="Pending"></nz-option>
                    <nz-option
                      nzValue="completed"
                      nzLabel="Completed"
                    ></nz-option>
                    <nz-option
                      nzValue="cancelled"
                      nzLabel="Cancelled"
                    ></nz-option>
                    <nz-option nzValue="draft" nzLabel="Draft"></nz-option>
                  </nz-select>
                </nz-form-control>
              </nz-form-item>
            </div>

            <div nz-col nzXs="24" nzSm="12" nzMd="8">
              <nz-form-item>
                <nz-form-label>Invoice Type</nz-form-label>
                <nz-form-control>
                  <nz-select
                    formControlName="invoiceType"
                    nzPlaceHolder="All Types"
                    nzAllowClear
                    style="width: 100%"
                  >
                    <nz-option
                      nzValue="Sale Invoice"
                      nzLabel="Sale Invoice"
                    ></nz-option>
                    <nz-option
                      nzValue="Purchase Invoice"
                      nzLabel="Purchase Invoice"
                    ></nz-option>
                    <nz-option
                      nzValue="Credit Note"
                      nzLabel="Credit Note"
                    ></nz-option>
                    <nz-option
                      nzValue="Debit Note"
                      nzLabel="Debit Note"
                    ></nz-option>
                  </nz-select>
                </nz-form-control>
              </nz-form-item>
            </div>
          </div>

          <div class="filter-actions">
            <button
              nz-button
              nzType="primary"
              (click)="generateReport()"
              [nzLoading]="loading"
            >
              <span nz-icon nzType="bar-chart"></span>
              Generate Report
            </button>
            <button nz-button (click)="resetFilters()">
              <span nz-icon nzType="reload"></span>
              Reset
            </button>
          </div>
        </form>
      </nz-card>

      <!-- Report Summary -->
      <nz-spin [nzSpinning]="loading">
        <div *ngIf="reportData">
          <div nz-row [nzGutter]="16" class="stats-row">
            <div nz-col nzXs="24" nzSm="12" nzMd="6">
              <nz-card class="stat-card">
                <nz-statistic
                  nzTitle="Total Invoices"
                  [nzValue]="reportData.totalInvoices"
                  nzPrefix="📄"
                  [nzValueStyle]="{ color: '#1890ff' }"
                >
                </nz-statistic>
              </nz-card>
            </div>

            <div nz-col nzXs="24" nzSm="12" nzMd="6">
              <nz-card class="stat-card">
                <nz-statistic
                  nzTitle="Total Amount"
                  [nzValue]="reportData.totalAmount"
                  nzPrefix="PKR "
                  [nzValueStyle]="{ color: '#52c41a' }"
                >
                </nz-statistic>
              </nz-card>
            </div>

            <div nz-col nzXs="24" nzSm="12" nzMd="6">
              <nz-card class="stat-card">
                <nz-statistic
                  nzTitle="Average Amount"
                  [nzValue]="reportData.averageAmount"
                  nzPrefix="PKR "
                  [nzValueStyle]="{ color: '#722ed1' }"
                >
                </nz-statistic>
              </nz-card>
            </div>

            <div nz-col nzXs="24" nzSm="12" nzMd="6">
              <nz-card class="stat-card">
                <nz-statistic
                  nzTitle="Completed Rate"
                  [nzValue]="getCompletionRate()"
                  nzSuffix="%"
                  [nzValueStyle]="{ color: '#faad14' }"
                >
                </nz-statistic>
              </nz-card>
            </div>
          </div>

          <!-- Status & Type Breakdown -->
          <div nz-row [nzGutter]="16">
            <div nz-col nzXs="24" nzMd="12">
              <nz-card nzTitle="By Status" class="breakdown-card">
                <div
                  class="breakdown-item"
                  *ngFor="let item of getStatusBreakdown()"
                >
                  <div class="breakdown-label">
                    <nz-tag [nzColor]="getStatusColor(item.status)">{{
                      item.status | titlecase
                    }}</nz-tag>
                  </div>
                  <div class="breakdown-value">
                    <strong>{{ item.count }}</strong>
                    <small>({{ item.percentage.toFixed(1) }}%)</small>
                  </div>
                </div>
              </nz-card>
            </div>

            <div nz-col nzXs="24" nzMd="12">
              <nz-card nzTitle="By Type" class="breakdown-card">
                <div
                  class="breakdown-item"
                  *ngFor="let item of getTypeBreakdown()"
                >
                  <div class="breakdown-label">
                    <nz-tag nzColor="blue">{{ item.type }}</nz-tag>
                  </div>
                  <div class="breakdown-value">
                    <strong>{{ item.count }}</strong>
                    <small>({{ item.percentage.toFixed(1) }}%)</small>
                  </div>
                </div>
              </nz-card>
            </div>
          </div>

          <!-- Recent Invoices -->
          <nz-card nzTitle="Recent Invoices in Report" class="table-card">
            <nz-table
              [nzData]="recentInvoices"
              [nzShowPagination]="false"
              [nzPageSize]="10"
              nzSize="small"
            >
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Type</th>
                  <th>Buyer</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let invoice of recentInvoices">
                  <td>
                    <strong>{{ invoice.invoiceNumber || 'Not Assigned' }}</strong>
                  </td>
                  <td>
                    <nz-tag nzColor="blue">{{ invoice.invoiceType }}</nz-tag>
                  </td>
                  <td>{{ invoice.buyerBusinessName }}</td>
                  <td>{{ invoice.invoiceDate | date : 'dd/MM/yyyy' }}</td>
                  <td>PKR {{ invoice.totalAmount | number : '1.2-2' }}</td>
                  <td>
                    <nz-tag [nzColor]="getStatusColor(invoice.status!)">
                      {{ invoice.status | titlecase }}
                    </nz-tag>
                  </td>
                </tr>
              </tbody>
            </nz-table>
          </nz-card>
        </div>

        <nz-empty
          *ngIf="!reportData && !loading"
          nzNotFoundContent="No report data available"
        >
          <div nz-empty-footer>
            <button nz-button nzType="primary" (click)="generateReport()">
              Generate Report
            </button>
          </div>
        </nz-empty>
      </nz-spin>
    </div>
  `,
  styles: [
    `
      .reports-container {
        padding: 0;
      }

      .page-header {
        margin-bottom: 24px;
      }

      .page-header h1 {
        margin: 0;
        font-size: 24px;
        font-weight: 600;
        color: #262626;
      }

      .filter-card,
      .breakdown-card,
      .table-card {
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        margin-bottom: 16px;
      }

      .filter-actions {
        display: flex;
        gap: 8px;
        margin-top: 16px;
      }

      .stats-row {
        margin-bottom: 24px;
      }
      .stat-card {
        text-align: center;
        transition: all 0.3s;
      }

      .stat-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .breakdown-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid #f0f0f0;
      }

      .breakdown-item:last-child {
        border-bottom: none;
      }

      .breakdown-value small {
        color: #8c8c8c;
        margin-left: 8px;
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
    `,
  ],
})
export class ReportsComponent implements OnInit {
  filterForm: FormGroup;
  loading = false;
  reportData: ReportData | null = null;
  recentInvoices: Invoice[] = [];
  constructor(private fb: FormBuilder, private invoiceService: InvoiceService) {
    this.filterForm = this.fb.group({
      dateRange: [null],
      status: [null],
      invoiceType: [null],
    });
  }
  ngOnInit(): void {
    // Set default date range to current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    this.filterForm.patchValue({
      dateRange: [startOfMonth, endOfMonth],
    });

    this.generateReport();
  }
  generateReport(): void {
    this.loading = true;
    const filters = this.buildFilters();
    // Get all invoices for the report period
    this.invoiceService.getInvoices({ ...filters, limit: 1000 }).subscribe({
      next: (response) => {
        this.processReportData(response.data.invoices);
        this.recentInvoices = response.data.invoices.slice(0, 10);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error generating report:', error);
        this.loading = false;
      },
    });
  }
  buildFilters(): any {
    const formValue = this.filterForm.value;
    const filters: any = {};
    if (formValue.dateRange && formValue.dateRange.length === 2) {
      filters.dateFrom = formValue.dateRange[0].toISOString().split('T')[0];
      filters.dateTo = formValue.dateRange[1].toISOString().split('T')[0];
    }
    if (formValue.status) {
      filters.status = formValue.status;
    }
    if (formValue.invoiceType) {
      filters.invoiceType = formValue.invoiceType;
    }

    return filters;
  }
  processReportData(invoices: Invoice[]): void {
    const totalAmount = invoices.reduce(
      (sum, inv) => sum + (inv.totalAmount || 0),
      0
    );
    const averageAmount =
      invoices.length > 0 ? totalAmount / invoices.length : 0;
    // Group by status
    const byStatus: { [key: string]: number } = {};
    invoices.forEach((inv) => {
      const status = inv.status || 'unknown';
      byStatus[status] = (byStatus[status] || 0) + 1;
    });

    // Group by type
    const byType: { [key: string]: number } = {};
    invoices.forEach((inv) => {
      byType[inv.invoiceType] = (byType[inv.invoiceType] || 0) + 1;
    });

    // Monthly data (simplified for this example)
    const monthlyData = this.generateMonthlyData(invoices);

    this.reportData = {
      totalInvoices: invoices.length,
      totalAmount,
      averageAmount,
      byStatus,
      byType,
      monthlyData,
    };
  }
  generateMonthlyData(
    invoices: Invoice[]
  ): { month: string; amount: number; count: number }[] {
    const monthlyMap: { [key: string]: { amount: number; count: number } } = {};
    invoices.forEach((inv) => {
      if (!inv.invoiceDate) {
        return;
      }
      const month = new Date(inv.invoiceDate).toISOString().slice(0, 7); // YYYY-MM
      if (!monthlyMap[month]) {
        monthlyMap[month] = { amount: 0, count: 0 };
      }
      monthlyMap[month].amount += inv.totalAmount || 0;
      monthlyMap[month].count += 1;
    });

    return Object.entries(monthlyMap)
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }
  getCompletionRate(): number {
    if (!this.reportData || this.reportData.totalInvoices === 0) return 0;
    const completed = this.reportData.byStatus['completed'] || 0;
    return (completed / this.reportData.totalInvoices) * 100;
  }
  getStatusBreakdown(): {
    status: string;
    count: number;
    percentage: number;
  }[] {
    if (!this.reportData) return [];
    return Object.entries(this.reportData.byStatus).map(([status, count]) => ({
      status,
      count,
      percentage: (count / this.reportData!.totalInvoices) * 100,
    }));
  }
  getTypeBreakdown(): { type: string; count: number; percentage: number }[] {
    if (!this.reportData) return [];
    return Object.entries(this.reportData.byType).map(([type, count]) => ({
      type,
      count,
      percentage: (count / this.reportData!.totalInvoices) * 100,
    }));
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
  resetFilters(): void {
    this.filterForm.reset();
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    this.filterForm.patchValue({
      dateRange: [startOfMonth, endOfMonth],
    });

    this.generateReport();
  }
}
