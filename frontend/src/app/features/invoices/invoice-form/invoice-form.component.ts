import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
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
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

import { NgSelectModule } from '@ng-select/ng-select';

import { Invoice } from '../../../core/models/invoice';
import { InvoiceService } from '../../../core/services/invoice.service';
import { NotificationService } from '../../../core/services/notification.service';
import { FbrLookupService } from '../../../core/services/fbr-lookup.service';
import { Subscription, combineLatest } from 'rxjs';
import { scenarioTypes } from '../../../constants/constants';

@Component({
  selector: 'app-invoice-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzCardModule,
    NzFormModule,
    NzInputModule,
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
    NgSelectModule,
  ],
  templateUrl: './invoice-form.component.html',
  styleUrls: ['./invoice-form.component.scss'],
})
export class InvoiceFormComponent implements OnInit, OnDestroy {
  invoiceForm: FormGroup;
  loading = false;
  saving = false;
  isEditMode = false;
  invoiceId: number | null = null;

  // dropdown data
  provinceOptions: { code: number; description: string }[] = [];
  hsCodeOptions: { hsCode: string; description: string }[] = [];
  uomOptions: { id: number; name: string }[] = [];
  saleTypeOptions: { id: number; description: string }[] = [];

  private subs = new Subscription();
  scenarioTypes: {
    id: string;
    desc: string;
    saleType: string;
    active: boolean;
  }[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private invoiceService: InvoiceService,
    private notificationService: NotificationService,
    private fbr: FbrLookupService
  ) {
    this.invoiceForm = this.createForm();
  }

  ngOnInit(): void {
    this.scenarioTypes = scenarioTypes;
    // load lookup data
    const s1 = this.fbr
      .getProvinces()
      .subscribe((v) => (this.provinceOptions = v));
    const s2 = this.fbr.getHsCodes().subscribe((v) => (this.hsCodeOptions = v));
    const s3 = this.fbr.getUoms().subscribe((v) => (this.uomOptions = v));
    const s4 = this.fbr
      .getTransactionTypes()
      .subscribe((v) => (this.saleTypeOptions = v));
    this.subs.add(s1);
    this.subs.add(s2);
    this.subs.add(s3);
    this.subs.add(s4);

    // track province code (for origination supplier) when province text changes
    this.subs.add(
      combineLatest([
        this.invoiceForm.get('sellerProvince')!.valueChanges,
        this.invoiceForm.get('buyerProvince')!.valueChanges,
      ]).subscribe(() => {
        this.syncProvinceCodes();
      })
    );

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

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  private syncProvinceCodes(): void {
    const seller = this.invoiceForm.get('sellerProvince')!.value;
    const buyer = this.invoiceForm.get('buyerProvince')!.value;
    const sellerMatch = this.provinceOptions.find(
      (p) => p.description === seller
    );
    const buyerMatch = this.provinceOptions.find(
      (p) => p.description === buyer
    );

    this.invoiceForm.patchValue(
      {
        sellerProvinceCode: sellerMatch?.code ?? null,
        buyerProvinceCode: buyerMatch?.code ?? null,
      },
      { emitEvent: false }
    );
  }

  createForm(): FormGroup {
    return this.fb.group({
      invoiceType: ['', Validators.required],
      invoiceDate: [new Date(), Validators.required],
      sellerNTNCNIC: ['', Validators.required],
      sellerBusinessName: ['', Validators.required],
      sellerProvince: ['', Validators.required],
      sellerProvinceCode: [null], // hidden helper for originationSupplier
      sellerAddress: ['', Validators.required],
      buyerNTNCNIC: ['', Validators.required],
      buyerBusinessName: ['', Validators.required],
      buyerProvince: ['', Validators.required],
      buyerProvinceCode: [null], // hidden helper
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
    const grp = this.fb.group({
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

      // helper hidden fields for cascading
      transTypeId: [null as number | null],
      rateId: [null],
      sroId: [null],
    });

    // cascade: saleType -> transTypeId -> rate -> schedule -> item
    this.subs.add(
      grp.get('saleType')!.valueChanges.subscribe((desc: string | null) => {
        if (desc !== null) {
          const tt = this.saleTypeOptions.find((x) => x.description === desc);
          grp.patchValue({ transTypeId: tt?.id ?? null }, { emitEvent: false });
          // when sale type changes, recompute the chain
          this.fetchRateForItem(grp);
        }
      })
    );

    // recompute chain when sellerProvinceCode changes (origination supplier)
    this.subs.add(
      this.invoiceForm.get('sellerProvinceCode')!.valueChanges.subscribe(() => {
        this.fetchRateForItem(grp);
      })
    );

    return grp;
  }

  private fetchRateForItem(itemGroup: FormGroup): void {
    const transTypeId: number | null = itemGroup.get('transTypeId')!.value;
    const origSupplier: number | null =
      this.invoiceForm.get('sellerProvinceCode')!.value;

    if (!transTypeId || !origSupplier) return;

    this.fbr.getSaleTypeToRate(transTypeId, origSupplier).subscribe({
      next: (rates) => {
        if (!rates?.length) return;
        // choose first (or present a selection UI if multiple)
        const r = rates[0];
        itemGroup.patchValue(
          {
            rate: r.ratE_DESC, // set the human-readable rate in your form
            rateId: r.ratE_ID,
          },
          { emitEvent: false }
        );

        // Next: SRO schedule
        this.fetchSroScheduleForItem(itemGroup);
      },
      error: () => {},
    });
  }

  private fetchSroScheduleForItem(itemGroup: FormGroup): void {
    const rateId: number | null = itemGroup.get('rateId')!.value;
    const origSupplierCsv: number | null =
      this.invoiceForm.get('sellerProvinceCode')!.value;
    if (!rateId || !origSupplierCsv) return;

    this.fbr.getSroSchedule(rateId, origSupplierCsv).subscribe({
      next: (schedules) => {
        if (!schedules?.length) return;
        const s = schedules[0];
        itemGroup.patchValue(
          {
            sroScheduleNo: s.srO_DESC,
            sroId: s.srO_ID,
          },
          { emitEvent: false }
        );

        // Next: SRO items (serial)
        this.fetchSroItemsForItem(itemGroup);
      },
      error: () => {
        itemGroup.patchValue(
          {
            sroScheduleNo: null,
            sroId: null,
          },
          { emitEvent: false }
        );
      },
    });
  }

  private fetchSroItemsForItem(itemGroup: FormGroup): void {
    const sroId: number | null = itemGroup.get('sroId')!.value;
    if (!sroId) return;

    this.fbr.getSroItems(sroId).subscribe({
      next: (items) => {
        if (!items?.length) return;
        // choose first by default; if you want a dropdown, wire one here
        const it = items[0];
        itemGroup.patchValue(
          { sroItemSerialNo: it.srO_ITEM_DESC },
          { emitEvent: false }
        );
      },
      error: () => {},
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

    item.patchValue(
      {
        totalValues: totalValue,
        fixedNotifiedValueOrRetailPrice: unitPrice,
      },
      { emitEvent: false }
    );
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

    // ensure province codes sync after setting values
    this.syncProvinceCodes();

    // Add items
    invoice.items.forEach((itm) => {
      const itemForm = this.createItemForm();
      itemForm.patchValue(itm);
      this.itemsFormArray.push(itemForm);
      // kick off cascades for existing data (if needed)
      this.fetchRateForItem(itemForm);
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

    const invoiceData: Invoice = {
      ...formValue,
      status: status, // Set the status from parameter
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
        // helper fields (transTypeId, rateId, sroId) are included in payload;
        // if DB schema doesn't need them, strip them here
      })),
    };

    const operation = this.isEditMode
      ? this.invoiceService.updateInvoice(this.invoiceId!, invoiceData)
      : this.invoiceService.createInvoice(invoiceData);

    operation.subscribe({
      next: () => {
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
