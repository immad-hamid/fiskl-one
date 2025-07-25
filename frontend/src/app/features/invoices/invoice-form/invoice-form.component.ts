import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
    FormArray,
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

import { Invoice } from '../../../core/models/invoice';
import { InvoiceService } from '../../../core/services/invoice.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-invoice-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzCardModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzDatePickerModule,
    NzButtonModule,
    NzIconModule,
    NzGridModule,
    NzTableModule,
    NzInputNumberModule,
    NzSpinModule,
    NzDividerModule,
    NzPopconfirmModule,
    NzToolTipModule,
  ],
  template: `
    <div class="invoice-form-container">
      <div class="page-header">
        <h1>{{ isEditMode ? 'Edit Invoice' : 'Create Invoice' }}</h1>
        <div class="header-actions">
          <button nz-button (click)="goBack()">
            <span nz-icon nzType="arrow-left"></span>
            Back
          </button>
        </div>
      </div>

      <nz-spin [nzSpinning]="loading">
        <form nz-form [formGroup]="invoiceForm" (ngSubmit)="onSubmit()">
          <!-- Invoice Details -->
          <nz-card nzTitle="Invoice Details" class="form-card">
            <div nz-row [nzGutter]="16">
              <div nz-col nzXs="24" nzSm="12" nzMd="8">
                <nz-form-item>
                  <nz-form-label nzRequired>Invoice Type</nz-form-label>
                  <nz-form-control nzErrorTip="Please select invoice type">
                    <nz-select
                      formControlName="invoiceType"
                      nzPlaceHolder="Select invoice type"
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

              <div nz-col nzXs="24" nzSm="12" nzMd="8">
                <nz-form-item>
                  <nz-form-label nzRequired>Invoice Date</nz-form-label>
                  <nz-form-control nzErrorTip="Please select invoice date">
                    <nz-date-picker
                      formControlName="invoiceDate"
                      nzPlaceHolder="Select date"
                      nzFormat="yyyy-MM-dd"
                      style="width: 100%"
                    >
                    </nz-date-picker>
                  </nz-form-control>
                </nz-form-item>
              </div>

              <div nz-col nzXs="24" nzSm="12" nzMd="8">
                <nz-form-item>
                  <nz-form-label>Invoice Reference</nz-form-label>
                  <nz-form-control>
                    <input
                      nz-input
                      formControlName="invoiceRefNo"
                      placeholder="Enter reference number"
                    />
                  </nz-form-control>
                </nz-form-item>
              </div>

              <div nz-col nzXs="24" nzSm="12" nzMd="8">
                <nz-form-item>
                  <nz-form-label nzRequired>Scenario ID</nz-form-label>
                  <nz-form-control nzErrorTip="Please enter scenario ID">
                    <input
                      nz-input
                      formControlName="scenarioId"
                      placeholder="e.g., SN000"
                    />
                  </nz-form-control>
                </nz-form-item>
              </div>
            </div>
          </nz-card>

          <!-- Seller Information -->
          <nz-card nzTitle="Seller Information" class="form-card">
            <div nz-row [nzGutter]="16">
              <div nz-col nzXs="24" nzSm="12" nzMd="8">
                <nz-form-item>
                  <nz-form-label nzRequired>NTN/CNIC</nz-form-label>
                  <nz-form-control nzErrorTip="Please enter seller NTN/CNIC">
                    <input
                      nz-input
                      formControlName="sellerNTNCNIC"
                      placeholder="Enter NTN/CNIC"
                    />
                  </nz-form-control>
                </nz-form-item>
              </div>

              <div nz-col nzXs="24" nzSm="12" nzMd="8">
                <nz-form-item>
                  <nz-form-label nzRequired>Business Name</nz-form-label>
                  <nz-form-control
                    nzErrorTip="Please enter seller business name"
                  >
                    <input
                      nz-input
                      formControlName="sellerBusinessName"
                      placeholder="Enter business name"
                    />
                  </nz-form-control>
                </nz-form-item>
              </div>

              <div nz-col nzXs="24" nzSm="12" nzMd="8">
                <nz-form-item>
                  <nz-form-label nzRequired>Province</nz-form-label>
                  <nz-form-control nzErrorTip="Please select seller province">
                    <nz-select
                      formControlName="sellerProvince"
                      nzPlaceHolder="Select province"
                    >
                      <nz-option nzValue="Punjab" nzLabel="Punjab"></nz-option>
                      <nz-option nzValue="Sindh" nzLabel="Sindh"></nz-option>
                      <nz-option
                        nzValue="KPK"
                        nzLabel="Khyber Pakhtunkhwa"
                      ></nz-option>
                      <nz-option
                        nzValue="Balochistan"
                        nzLabel="Balochistan"
                      ></nz-option>
                      <nz-option
                        nzValue="Islamabad"
                        nzLabel="Islamabad"
                      ></nz-option>
                    </nz-select>
                  </nz-form-control>
                </nz-form-item>
              </div>

              <div nz-col nzSpan="24">
                <nz-form-item>
                  <nz-form-label nzRequired>Address</nz-form-label>
                  <nz-form-control nzErrorTip="Please enter seller address">
                    <textarea
                      nz-input
                      formControlName="sellerAddress"
                      placeholder="Enter complete address"
                    >
                    </textarea>
                  </nz-form-control>
                </nz-form-item>
              </div>
            </div>
          </nz-card>

          <!-- Buyer Information -->
          <nz-card nzTitle="Buyer Information" class="form-card">
            <div nz-row [nzGutter]="16">
              <div nz-col nzXs="24" nzSm="12" nzMd="8">
                <nz-form-item>
                  <nz-form-label nzRequired>NTN/CNIC</nz-form-label>
                  <nz-form-control nzErrorTip="Please enter buyer NTN/CNIC">
                    <input
                      nz-input
                      formControlName="buyerNTNCNIC"
                      placeholder="Enter NTN/CNIC"
                    />
                  </nz-form-control>
                </nz-form-item>
              </div>

              <div nz-col nzXs="24" nzSm="12" nzMd="8">
                <nz-form-item>
                  <nz-form-label nzRequired>Business Name</nz-form-label>
                  <nz-form-control
                    nzErrorTip="Please enter buyer business name"
                  >
                    <input
                      nz-input
                      formControlName="buyerBusinessName"
                      placeholder="Enter business name"
                    />
                  </nz-form-control>
                </nz-form-item>
              </div>

              <div nz-col nzXs="24" nzSm="12" nzMd="8">
                <nz-form-item>
                  <nz-form-label nzRequired>Province</nz-form-label>
                  <nz-form-control nzErrorTip="Please select buyer province">
                    <nz-select
                      formControlName="buyerProvince"
                      nzPlaceHolder="Select province"
                    >
                      <nz-option nzValue="Punjab" nzLabel="Punjab"></nz-option>
                      <nz-option nzValue="Sindh" nzLabel="Sindh"></nz-option>
                      <nz-option
                        nzValue="KPK"
                        nzLabel="Khyber Pakhtunkhwa"
                      ></nz-option>
                      <nz-option
                        nzValue="Balochistan"
                        nzLabel="Balochistan"
                      ></nz-option>
                      <nz-option
                        nzValue="Islamabad"
                        nzLabel="Islamabad"
                      ></nz-option>
                    </nz-select>
                  </nz-form-control>
                </nz-form-item>
              </div>

              <div nz-col nzXs="24" nzSm="12" nzMd="8">
                <nz-form-item>
                  <nz-form-label nzRequired>Registration Type</nz-form-label>
                  <nz-form-control nzErrorTip="Please select registration type">
                    <nz-select
                      formControlName="buyerRegistrationType"
                      nzPlaceHolder="Select type"
                    >
                      <nz-option
                        nzValue="Registered"
                        nzLabel="Registered"
                      ></nz-option>
                      <nz-option
                        nzValue="Unregistered"
                        nzLabel="Unregistered"
                      ></nz-option>
                    </nz-select>
                  </nz-form-control>
                </nz-form-item>
              </div>

              <div nz-col nzSpan="24">
                <nz-form-item>
                  <nz-form-label nzRequired>Address</nz-form-label>
                  <nz-form-control nzErrorTip="Please enter buyer address">
                    <textarea
                      nz-input
                      formControlName="buyerAddress"
                      placeholder="Enter complete address"
                    >
                    </textarea>
                  </nz-form-control>
                </nz-form-item>
              </div>
            </div>
          </nz-card>

          <!-- Invoice Items -->
          <nz-card class="form-card">
            <div class="card-header" nz-card-head>
              <div class="card-title">Invoice Items</div>
              <div class="card-extra">
                <button
                  nz-button
                  nzType="dashed"
                  (click)="addItem()"
                  nz-tooltip
                  nzTooltipTitle="Add new item"
                >
                  <span nz-icon nzType="plus"></span>
                  Add Item
                </button>
              </div>
            </div>

            <div formArrayName="items">
              <nz-table
                [nzData]="itemsFormArray.controls"
                [nzShowPagination]="false"
                nzSize="small"
              >
                <thead>
                  <tr>
                    <th nzWidth="120px">HS Code *</th>
                    <th>Description *</th>
                    <th nzWidth="80px">Rate *</th>
                    <th nzWidth="80px">UoM *</th>
                    <th nzWidth="80px">Qty *</th>
                    <th nzWidth="120px">Unit Price *</th>
                    <th nzWidth="120px">Sales Tax *</th>
                    <th nzWidth="100px">Discount</th>
                    <th nzWidth="120px">Total Value</th>
                    <th nzWidth="60px">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    *ngFor="let item of itemsFormArray.controls; let i = index"
                    [formGroupName]="i"
                  >
                    <td>
                      <input
                        nz-input
                        formControlName="hsCode"
                        placeholder="0000.0000"
                        (blur)="calculateItemTotal(i)"
                      />
                    </td>
                    <td>
                      <input
                        nz-input
                        formControlName="productDescription"
                        placeholder="Product description"
                      />
                    </td>
                    <td>
                      <input
                        nz-input
                        formControlName="rate"
                        placeholder="17%"
                      />
                    </td>
                    <td>
                      <input nz-input formControlName="uoM" placeholder="PCS" />
                    </td>
                    <td>
                      <nz-input-number
                        formControlName="quantity"
                        [nzMin]="0"
                        [nzStep]="1"
                        [nzPrecision]="2"
                        nzPlaceHolder="0"
                        (ngModelChange)="calculateItemTotal(i)"
                        style="width: 100%"
                      >
                      </nz-input-number>
                    </td>
                    <td>
                      <nz-input-number
                        formControlName="valueSalesExcludingST"
                        [nzMin]="0"
                        [nzStep]="0.01"
                        [nzPrecision]="2"
                        nzPlaceHolder="0.00"
                        (ngModelChange)="calculateItemTotal(i)"
                        style="width: 100%"
                      >
                      </nz-input-number>
                    </td>
                    <td>
                      <nz-input-number
                        formControlName="salesTaxApplicable"
                        [nzMin]="0"
                        [nzStep]="0.01"
                        [nzPrecision]="2"
                        nzPlaceHolder="0.00"
                        (ngModelChange)="calculateItemTotal(i)"
                        style="width: 100%"
                      >
                      </nz-input-number>
                    </td>
                    <td>
                      <nz-input-number
                        formControlName="discount"
                        [nzMin]="0"
                        [nzStep]="0.01"
                        [nzPrecision]="2"
                        nzPlaceHolder="0.00"
                        (ngModelChange)="calculateItemTotal(i)"
                        style="width: 100%"
                      >
                      </nz-input-number>
                    </td>
                    <td>
                      <div class="total-display">
                        {{ getItemTotal(i) | number : '1.2-2' }}
                      </div>
                    </td>
                    <td>
                      <button
                        nz-button
                        nzType="text"
                        nzDanger
                        nzSize="small"
                        nz-popconfirm
                        nzPopconfirmTitle="Remove this item?"
                        (nzOnConfirm)="removeItem(i)"
                        [disabled]="itemsFormArray.length === 1"
                      >
                        <span nz-icon nzType="delete"></span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </nz-table>

              <div class="items-summary">
                <div class="summary-row">
                  <strong>Total Items: {{ itemsFormArray.length }}</strong>
                </div>
                <div class="summary-row">
                  <strong
                    >Grand Total: PKR
                    {{ getGrandTotal() | number : '1.2-2' }}</strong
                  >
                </div>
              </div>
            </div>
          </nz-card>

          <!-- Form Actions -->
          <div class="form-actions">
            <button nz-button nzSize="large" (click)="goBack()">Cancel</button>
            <button
              nz-button
              nzType="default"
              nzSize="large"
              (click)="saveDraft()"
              [nzLoading]="saving"
            >
              Save as Draft
            </button>
            <button
              nz-button
              nzType="primary"
              nzSize="large"
              [nzLoading]="saving"
              [disabled]="!invoiceForm.valid"
            >
              {{ isEditMode ? 'Update Invoice' : 'Create Invoice' }}
            </button>
          </div>
        </form>
      </nz-spin>
    </div>
  `,
  styles: [
    `
      .invoice-form-container {
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

      .header-actions {
        display: flex;
        gap: 8px;
      }

      .form-card {
        margin-bottom: 16px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 24px;
        border-bottom: 1px solid #f0f0f0;
      }

      .card-title {
        font-size: 16px;
        font-weight: 500;
      }

      .total-display {
        font-weight: 500;
        color: #1890ff;
      }

      .items-summary {
        margin-top: 16px;
        padding: 16px;
        background-color: #fafafa;
        border-radius: 6px;
      }

      .summary-row {
        display: flex;
        justify-content: flex-end;
        margin-bottom: 8px;
      }

      .summary-row:last-child {
        margin-bottom: 0;
        font-size: 16px;
        color: #1890ff;
      }

      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 16px;
        margin-top: 24px;
        padding: 24px;
        background-color: #fafafa;
        border-radius: 8px;
      }

      :host ::ng-deep .ant-table-tbody > tr > td {
        padding: 8px !important;
      }

      :host ::ng-deep .ant-input-number {
        width: 100%;
      }

      :host ::ng-deep .ant-form-item {
        margin-bottom: 16px;
      }

      :host ::ng-deep .ant-form-item-label > label {
        font-weight: 500;
      }
    `,
  ],
})
export class InvoiceFormComponent implements OnInit {
  invoiceForm: FormGroup;
  loading = false;
  saving = false;
  isEditMode = false;
  invoiceId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private invoiceService: InvoiceService,
    private notificationService: NotificationService
  ) {
    this.invoiceForm = this.createForm();
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.isEditMode = true;
        this.invoiceId = +params['id'];
        this.loadInvoice();
      } else {
        this.addItem(); // Add first item for new invoice
      }
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      invoiceType: ['', Validators.required],
      invoiceDate: [new Date(), Validators.required],
      sellerNTNCNIC: ['', Validators.required],
      sellerBusinessName: ['', Validators.required],
      sellerProvince: ['', Validators.required],
      sellerAddress: ['', Validators.required],
      buyerNTNCNIC: ['', Validators.required],
      buyerBusinessName: ['', Validators.required],
      buyerProvince: ['', Validators.required],
      buyerAddress: ['', Validators.required],
      buyerRegistrationType: ['', Validators.required],
      invoiceRefNo: [''],
      scenarioId: ['', Validators.required],
      items: this.fb.array([]),
    });
  }

  get itemsFormArray(): FormArray {
    return this.invoiceForm.get('items') as FormArray;
  }

  createItemForm(): FormGroup {
    return this.fb.group({
      hsCode: ['', Validators.required],
      productDescription: ['', Validators.required],
      rate: ['', Validators.required],
      uoM: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(0.01)]],
      totalValues: [0],
      valueSalesExcludingST: [0, [Validators.required, Validators.min(0)]],
      fixedNotifiedValueOrRetailPrice: [0],
      salesTaxApplicable: [0, [Validators.required, Validators.min(0)]],
      salesTaxWithheldAtSource: [0],
      extraTax: [''],
      furtherTax: [0],
      sroScheduleNo: [''],
      fedPayable: [0],
      discount: [0, [Validators.min(0)]],
      saleType: [''],
      sroItemSerialNo: [''],
    });
  }

  addItem(): void {
    this.itemsFormArray.push(this.createItemForm());
  }

  removeItem(index: number): void {
    if (this.itemsFormArray.length > 1) {
      this.itemsFormArray.removeAt(index);
    }
  }

  calculateItemTotal(index: number): void {
    const item = this.itemsFormArray.at(index);
    const quantity = item.get('quantity')?.value || 0;
    const unitPrice = item.get('valueSalesExcludingST')?.value || 0;
    const salesTax = item.get('salesTaxApplicable')?.value || 0;
    const discount = item.get('discount')?.value || 0;
    const furtherTax = item.get('furtherTax')?.value || 0;
    const fedPayable = item.get('fedPayable')?.value || 0;

    const totalValue =
      quantity * unitPrice + salesTax + furtherTax + fedPayable - discount;

    item.patchValue({
      totalValues: totalValue,
      fixedNotifiedValueOrRetailPrice: unitPrice,
    });
  }

  getItemTotal(index: number): number {
    const item = this.itemsFormArray.at(index);
    return item.get('totalValues')?.value || 0;
  }

  getGrandTotal(): number {
    return this.itemsFormArray.controls.reduce((total, item) => {
      return total + (item.get('totalValues')?.value || 0);
    }, 0);
  }

  loadInvoice(): void {
    if (!this.invoiceId) return;

    this.loading = true;
    this.invoiceService.getInvoiceById(this.invoiceId).subscribe({
      next: (response) => {
        const invoice = response.data;
        this.populateForm(invoice);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading invoice:', error);
        this.notificationService.error('Error', 'Failed to load invoice');
        this.loading = false;
      },
    });
  }

  populateForm(invoice: Invoice): void {
    // Clear existing items
    while (this.itemsFormArray.length !== 0) {
      this.itemsFormArray.removeAt(0);
    }

    // Populate basic form data
    this.invoiceForm.patchValue({
      invoiceType: invoice.invoiceType,
      invoiceDate: invoice.invoiceDate ? new Date(invoice.invoiceDate) : null,
      sellerNTNCNIC: invoice.sellerNTNCNIC,
      sellerBusinessName: invoice.sellerBusinessName,
      sellerProvince: invoice.sellerProvince,
      sellerAddress: invoice.sellerAddress,
      buyerNTNCNIC: invoice.buyerNTNCNIC,
      buyerBusinessName: invoice.buyerBusinessName,
      buyerProvince: invoice.buyerProvince,
      buyerAddress: invoice.buyerAddress,
      buyerRegistrationType: invoice.buyerRegistrationType,
      invoiceRefNo: invoice.invoiceRefNo,
      scenarioId: invoice.scenarioId,
    });

    // Add items
    invoice.items.forEach((item) => {
      const itemForm = this.createItemForm();
      itemForm.patchValue(item);
      this.itemsFormArray.push(itemForm);
    });
  }

  onSubmit(): void {
    if (this.invoiceForm.valid) {
      this.saveInvoice('completed');
    } else {
      this.markFormGroupTouched(this.invoiceForm);
      this.notificationService.error(
        'Validation Error',
        'Please fill all required fields'
      );
    }
  }

  saveDraft(): void {
    this.saveInvoice('draft');
  }

  saveInvoice(status: string = 'completed'): void {
    this.saving = true;
    const formValue = this.invoiceForm.value;

    // Format the invoice data
    const invoiceData: Invoice = {
      ...formValue,
      invoiceDate: formValue.invoiceDate.toISOString().split('T')[0],
      items: formValue.items.map((item: any) => ({
        ...item,
        quantity: Number(item.quantity),
        totalValues: Number(item.totalValues),
        valueSalesExcludingST: Number(item.valueSalesExcludingST),
        fixedNotifiedValueOrRetailPrice: Number(
          item.fixedNotifiedValueOrRetailPrice
        ),
        salesTaxApplicable: Number(item.salesTaxApplicable),
        salesTaxWithheldAtSource: Number(item.salesTaxWithheldAtSource),
        furtherTax: Number(item.furtherTax),
        fedPayable: Number(item.fedPayable),
        discount: Number(item.discount),
      })),
    };

    const operation = this.isEditMode
      ? this.invoiceService.updateInvoice(this.invoiceId!, invoiceData)
      : this.invoiceService.createInvoice(invoiceData);

    operation.subscribe({
      next: (response) => {
        this.saving = false;
        const message = this.isEditMode
          ? 'Invoice updated successfully'
          : 'Invoice created successfully';
        this.notificationService.success('Success', message);
        this.router.navigate(['/invoices/list']);
      },
      error: (error) => {
        console.error('Error saving invoice:', error);
        this.saving = false;
      },
    });
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach((arrayControl) => {
          if (arrayControl instanceof FormGroup) {
            this.markFormGroupTouched(arrayControl);
          }
        });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/invoices/list']);
  }
}
