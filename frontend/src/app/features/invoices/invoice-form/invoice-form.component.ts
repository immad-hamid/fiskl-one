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
  templateUrl: './invoice-form.component.html',
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

    const baseTotal = quantity * unitPrice;
    const totalValue =
      baseTotal * (1 + salesTax / 100 + furtherTax / 100) +
      fedPayable -
      discount;

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
      // invoiceDate: formValue.invoiceDate.toISOString().split('T')[0],
      invoiceDate: formValue.invoiceDate
        ? formValue.invoiceDate.toISOString()
        : null,
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
