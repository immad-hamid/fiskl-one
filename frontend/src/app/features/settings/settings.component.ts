import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';

import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzTagModule } from 'ng-zorro-antd/tag';

import { NotificationService } from '../../core/services/notification.service';

interface CompanySettings {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  taxNumber: string;
  logo: string;
}

interface ApiSettings {
  thirdPartyApiUrl: string;
  thirdPartyApiKey: string;
  timeout: number;
  retryAttempts: number;
}

interface AppSettings {
  defaultInvoiceType: string;
  defaultCurrency: string;
  dateFormat: string;
  autoSaveInterval: number;
  enableNotifications: boolean;
  theme: string;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzCardModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule,
    NzUploadModule,
    NzSwitchModule,
    NzSelectModule,
    NzDividerModule,
    NzTabsModule,
    NzGridModule,
    NzInputNumberModule,
    NzTagModule,
  ],
  template: `
    <div class="settings-container">
      <div class="page-header">
        <h1>Settings</h1>
      </div>

      <nz-tabset nzType="card" class="settings-tabs">
        <!-- Company Settings -->
        <nz-tab nzTitle="Company Information">
          <nz-card class="settings-card">
            <form
              nz-form
              [formGroup]="companyForm"
              (ngSubmit)="saveCompanySettings()"
            >
              <div nz-row [nzGutter]="16">
                <div nz-col nzXs="24" nzMd="12">
                  <nz-form-item>
                    <nz-form-label nzRequired>Company Name</nz-form-label>
                    <nz-form-control nzErrorTip="Please enter company name">
                      <input
                        nz-input
                        formControlName="companyName"
                        placeholder="Enter company name"
                      />
                    </nz-form-control>
                  </nz-form-item>
                </div>

                <div nz-col nzXs="24" nzMd="12">
                  <nz-form-item>
                    <nz-form-label>Company Email</nz-form-label>
                    <nz-form-control nzErrorTip="Please enter valid email">
                      <input
                        nz-input
                        formControlName="companyEmail"
                        placeholder="Enter company email"
                      />
                    </nz-form-control>
                  </nz-form-item>
                </div>

                <div nz-col nzXs="24" nzMd="12">
                  <nz-form-item>
                    <nz-form-label>Company Phone</nz-form-label>
                    <nz-form-control>
                      <input
                        nz-input
                        formControlName="companyPhone"
                        placeholder="Enter phone number"
                      />
                    </nz-form-control>
                  </nz-form-item>
                </div>

                <div nz-col nzXs="24" nzMd="12">
                  <nz-form-item>
                    <nz-form-label>Tax Number</nz-form-label>
                    <nz-form-control>
                      <input
                        nz-input
                        formControlName="taxNumber"
                        placeholder="Enter tax number"
                      />
                    </nz-form-control>
                  </nz-form-item>
                </div>

                <div nz-col nzSpan="24">
                  <nz-form-item>
                    <nz-form-label nzRequired>Company Address</nz-form-label>
                    <nz-form-control nzErrorTip="Please enter company address">
                      <textarea
                        nz-input
                        formControlName="companyAddress"
                        placeholder="Enter complete address"
                      >
                      </textarea>
                    </nz-form-control>
                  </nz-form-item>
                </div>

                <div nz-col nzSpan="24">
                  <nz-form-item>
                    <nz-form-label>Company Logo</nz-form-label>
                    <nz-form-control>
                      <nz-upload
                        nzName="logo"
                        nzListType="picture-card"
                        [nzShowUploadList]="false"
                        [nzBeforeUpload]="beforeUpload"
                        (nzChange)="handleLogoChange($event)"
                      >
                        <div class="upload-content">
                          @if (logoUrl) {
                            <img
                              [src]="logoUrl"
                              alt="Company Logo"
                              class="uploaded-logo"
                            />
                          }
                          @if (!logoUrl) {
                            <div class="upload-placeholder">
                              <span
                                nz-icon
                                nzType="plus"
                                class="upload-icon"
                              ></span>
                              <div class="upload-text">Upload Logo</div>
                            </div>
                          }
                        </div>
                      </nz-upload>
                      <div class="upload-hint">
                        <small
                          >Recommended size: 300x100px, Max size: 2MB</small
                        >
                      </div>
                    </nz-form-control>
                  </nz-form-item>
                </div>
              </div>

              <div class="form-actions">
                <button nz-button nzType="primary" [nzLoading]="saving">
                  <span nz-icon nzType="save"></span>
                  Save Company Settings
                </button>
              </div>
            </form>
          </nz-card>
        </nz-tab>

        <!-- API Settings -->
        <nz-tab nzTitle="API Configuration">
          <nz-card class="settings-card">
            <form nz-form [formGroup]="apiForm" (ngSubmit)="saveApiSettings()">
              <div nz-row [nzGutter]="16">
                <div nz-col nzXs="24" nzMd="12">
                  <nz-form-item>
                    <nz-form-label>Third-party API URL</nz-form-label>
                    <nz-form-control nzErrorTip="Please enter valid URL">
                      <input
                        nz-input
                        formControlName="thirdPartyApiUrl"
                        placeholder="https://api.example.com/webhook"
                      />
                    </nz-form-control>
                  </nz-form-item>
                </div>

                <div nz-col nzXs="24" nzMd="12">
                  <nz-form-item>
                    <nz-form-label>API Key</nz-form-label>
                    <nz-form-control>
                      <nz-input-group nzSuffix>
                        <input
                          nz-input
                          [type]="showApiKey ? 'text' : 'password'"
                          formControlName="thirdPartyApiKey"
                          placeholder="Enter your API key"
                        />
                        <ng-template #nzSuffix>
                          <button
                            nz-button
                            nzType="text"
                            nzSize="small"
                            (click)="showApiKey = !showApiKey"
                          >
                            <span
                              nz-icon
                              [nzType]="showApiKey ? 'eye-invisible' : 'eye'"
                            ></span>
                          </button>
                        </ng-template>
                      </nz-input-group>
                    </nz-form-control>
                  </nz-form-item>
                </div>

                <div nz-col nzXs="24" nzMd="12">
                  <nz-form-item>
                    <nz-form-label>Timeout (seconds)</nz-form-label>
                    <nz-form-control>
                      <nz-input-number
                        formControlName="timeout"
                        [nzMin]="5"
                        [nzMax]="60"
                        nzPlaceHolder="30"
                        style="width: 100%"
                      >
                      </nz-input-number>
                    </nz-form-control>
                  </nz-form-item>
                </div>

                <div nz-col nzXs="24" nzMd="12">
                  <nz-form-item>
                    <nz-form-label>Retry Attempts</nz-form-label>
                    <nz-form-control>
                      <nz-input-number
                        formControlName="retryAttempts"
                        [nzMin]="0"
                        [nzMax]="5"
                        nzPlaceHolder="3"
                        style="width: 100%"
                      >
                      </nz-input-number>
                    </nz-form-control>
                  </nz-form-item>
                </div>
              </div>

              <nz-divider></nz-divider>

              <div class="test-section">
                <h3>Test API Connection</h3>
                <p>
                  Test your API configuration to ensure it's working correctly.
                </p>
                <button
                  nz-button
                  nzType="dashed"
                  (click)="testApiConnection()"
                  [nzLoading]="testing"
                >
                  <span nz-icon nzType="experiment"></span>
                  Test Connection
                </button>
              </div>

              <div class="form-actions">
                <button nz-button nzType="primary" [nzLoading]="saving">
                  <span nz-icon nzType="save"></span>
                  Save API Settings
                </button>
              </div>
            </form>
          </nz-card>
        </nz-tab>

        <!-- Application Settings -->
        <nz-tab nzTitle="Application Preferences">
          <nz-card class="settings-card">
            <form nz-form [formGroup]="appForm" (ngSubmit)="saveAppSettings()">
              <div nz-row [nzGutter]="16">
                <div nz-col nzXs="24" nzMd="12">
                  <nz-form-item>
                    <nz-form-label>Default Invoice Type</nz-form-label>
                    <nz-form-control>
                      <nz-select
                        formControlName="defaultInvoiceType"
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

                <div nz-col nzXs="24" nzMd="12">
                  <nz-form-item>
                    <nz-form-label>Default Currency</nz-form-label>
                    <nz-form-control>
                      <nz-select
                        formControlName="defaultCurrency"
                        style="width: 100%"
                      >
                        <nz-option
                          nzValue="PKR"
                          nzLabel="Pakistani Rupee (PKR)"
                        ></nz-option>
                        <nz-option
                          nzValue="USD"
                          nzLabel="US Dollar (USD)"
                        ></nz-option>
                        <nz-option
                          nzValue="EUR"
                          nzLabel="Euro (EUR)"
                        ></nz-option>
                      </nz-select>
                    </nz-form-control>
                  </nz-form-item>
                </div>

                <div nz-col nzXs="24" nzMd="12">
                  <nz-form-item>
                    <nz-form-label>Date Format</nz-form-label>
                    <nz-form-control>
                      <nz-select
                        formControlName="dateFormat"
                        style="width: 100%"
                      >
                        <nz-option
                          nzValue="dd/MM/yyyy"
                          nzLabel="DD/MM/YYYY"
                        ></nz-option>
                        <nz-option
                          nzValue="MM/dd/yyyy"
                          nzLabel="MM/DD/YYYY"
                        ></nz-option>
                        <nz-option
                          nzValue="yyyy-MM-dd"
                          nzLabel="YYYY-MM-DD"
                        ></nz-option>
                      </nz-select>
                    </nz-form-control>
                  </nz-form-item>
                </div>

                <div nz-col nzXs="24" nzMd="12">
                  <nz-form-item>
                    <nz-form-label>Theme</nz-form-label>
                    <nz-form-control>
                      <nz-select formControlName="theme" style="width: 100%">
                        <nz-option nzValue="light" nzLabel="Light"></nz-option>
                        <nz-option nzValue="dark" nzLabel="Dark"></nz-option>
                        <nz-option nzValue="auto" nzLabel="Auto"></nz-option>
                      </nz-select>
                    </nz-form-control>
                  </nz-form-item>
                </div>

                <div nz-col nzXs="24" nzMd="12">
                  <nz-form-item>
                    <nz-form-label>Auto-save Interval (minutes)</nz-form-label>
                    <nz-form-control>
                      <nz-input-number
                        formControlName="autoSaveInterval"
                        [nzMin]="1"
                        [nzMax]="30"
                        nzPlaceHolder="5"
                        style="width: 100%"
                      >
                      </nz-input-number>
                    </nz-form-control>
                  </nz-form-item>
                </div>

                <div nz-col nzXs="24" nzMd="12">
                  <nz-form-item>
                    <nz-form-label>Enable Notifications</nz-form-label>
                    <nz-form-control>
                      <nz-switch
                        formControlName="enableNotifications"
                      ></nz-switch>
                    </nz-form-control>
                  </nz-form-item>
                </div>
              </div>

              <div class="form-actions">
                <button nz-button nzType="primary" [nzLoading]="saving">
                  <span nz-icon nzType="save"></span>
                  Save App Settings
                </button>
              </div>
            </form>
          </nz-card>
        </nz-tab>

        <!-- System Information -->
        <nz-tab nzTitle="System Information">
          <nz-card class="settings-card">
            <div class="system-info">
              <div class="info-section">
                <h3>Application Information</h3>
                <div class="info-item">
                  <span class="info-label">Version:</span>
                  <span class="info-value">1.0.0</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Build Date:</span>
                  <span class="info-value">{{ getBuildDate() }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Environment:</span>
                  <span class="info-value">{{ getEnvironment() }}</span>
                </div>
              </div>

              <nz-divider></nz-divider>

              <div class="info-section">
                <h3>System Health</h3>
                <div class="health-checks">
                  <div class="health-item">
                    <span
                      nz-icon
                      nzType="check-circle"
                      class="health-icon success"
                    ></span>
                    <span>Database Connection</span>
                    <nz-tag nzColor="green">OK</nz-tag>
                  </div>
                  <div class="health-item">
                    <span
                      nz-icon
                      nzType="check-circle"
                      class="health-icon success"
                    ></span>
                    <span>API Server</span>
                    <nz-tag nzColor="green">OK</nz-tag>
                  </div>
                  <div class="health-item">
                    <span
                      nz-icon
                      nzType="exclamation-circle"
                      class="health-icon warning"
                    ></span>
                    <span>Third-party API</span>
                    <nz-tag nzColor="orange">Not Configured</nz-tag>
                  </div>
                </div>
              </div>

              <nz-divider></nz-divider>

              <div class="info-section">
                <h3>Actions</h3>
                <div class="action-buttons">
                  <button nz-button nzType="default" (click)="clearCache()">
                    <span nz-icon nzType="clear"></span>
                    Clear Cache
                  </button>
                  <button nz-button nzType="default" (click)="exportSettings()">
                    <span nz-icon nzType="export"></span>
                    Export Settings
                  </button>
                  <button nz-button nzType="default" (click)="importSettings()">
                    <span nz-icon nzType="import"></span>
                    Import Settings
                  </button>
                </div>
              </div>
            </div>
          </nz-card>
        </nz-tab>
      </nz-tabset>
    </div>
  `,
  styles: [
    `
      .settings-container {
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

      .settings-tabs {
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .settings-card {
        border: none;
        box-shadow: none;
      }

      .form-actions {
        margin-top: 24px;
        padding-top: 24px;
        border-top: 1px solid #f0f0f0;
        display: flex;
        justify-content: flex-end;
      }

      .upload-content {
        width: 120px;
        height: 120px;
        border: 1px dashed #d9d9d9;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: border-color 0.3s;
      }

      .upload-content:hover {
        border-color: #1890ff;
      }

      .uploaded-logo {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      }

      .upload-placeholder {
        text-align: center;
      }

      .upload-icon {
        font-size: 24px;
        color: #999;
        margin-bottom: 8px;
      }

      .upload-text {
        color: #666;
        font-size: 12px;
      }

      .upload-hint {
        margin-top: 8px;
        color: #8c8c8c;
      }

      .test-section {
        background: #fafafa;
        padding: 16px;
        border-radius: 6px;
        margin: 16px 0;
      }

      .test-section h3 {
        margin: 0 0 8px 0;
        font-size: 16px;
      }

      .test-section p {
        margin: 0 0 16px 0;
        color: #666;
      }

      .system-info {
        padding: 16px 0;
      }

      .info-section h3 {
        margin: 0 0 16px 0;
        font-size: 16px;
        font-weight: 600;
      }

      .info-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 12px;
        padding: 8px 0;
      }

      .info-label {
        font-weight: 500;
        color: #666;
      }

      .info-value {
        color: #262626;
      }

      .health-checks {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .health-item {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .health-icon {
        font-size: 16px;
      }

      .health-icon.success {
        color: #52c41a;
      }

      .health-icon.warning {
        color: #faad14;
      }

      .health-icon.error {
        color: #ff4d4f;
      }

      .action-buttons {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
      }

      :host ::ng-deep .ant-tabs-card .ant-tabs-content {
        margin-top: 0;
      }

      :host ::ng-deep .ant-tabs-card .ant-tabs-tabpane {
        background: white;
        padding: 0;
      }

      :host ::ng-deep .ant-input-number {
        width: 100%;
      }
    `,
  ],
})
export class SettingsComponent implements OnInit {
  companyForm: FormGroup;
  apiForm: FormGroup;
  appForm: FormGroup;

  saving = false;
  testing = false;
  showApiKey = false;
  logoUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    private notificationService: NotificationService,
    private message: NzMessageService
  ) {
    this.companyForm = this.createCompanyForm();
    this.apiForm = this.createApiForm();
    this.appForm = this.createAppForm();
  }

  ngOnInit(): void {
    this.loadSettings();
  }

  createCompanyForm(): FormGroup {
    return this.fb.group({
      companyName: ['Your Company Name', Validators.required],
      companyAddress: [
        '123 Your Street, City, State 12345',
        Validators.required,
      ],
      companyPhone: ['+92-300-1234567'],
      companyEmail: ['info@yourcompany.com', [Validators.email]],
      taxNumber: ['1234567890123'],
    });
  }

  createApiForm(): FormGroup {
    return this.fb.group({
      thirdPartyApiUrl: [''],
      thirdPartyApiKey: [''],
      timeout: [30, [Validators.min(5), Validators.max(60)]],
      retryAttempts: [3, [Validators.min(0), Validators.max(5)]],
    });
  }

  createAppForm(): FormGroup {
    return this.fb.group({
      defaultInvoiceType: ['Sale Invoice'],
      defaultCurrency: ['PKR'],
      dateFormat: ['dd/MM/yyyy'],
      autoSaveInterval: [5, [Validators.min(1), Validators.max(30)]],
      enableNotifications: [true],
      theme: ['light'],
    });
  }

  loadSettings(): void {
    // Load settings from localStorage or API
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);

      if (settings.company) {
        this.companyForm.patchValue(settings.company);
      }
      if (settings.api) {
        this.apiForm.patchValue(settings.api);
      }
      if (settings.app) {
        this.appForm.patchValue(settings.app);
      }
      if (settings.logoUrl) {
        this.logoUrl = settings.logoUrl;
      }
    }
  }

  saveCompanySettings(): void {
    if (this.companyForm.valid) {
      this.saving = true;

      // Simulate API call
      setTimeout(() => {
        const settings = this.getStoredSettings();
        settings.company = this.companyForm.value;
        localStorage.setItem('appSettings', JSON.stringify(settings));

        this.saving = false;
        this.notificationService.success(
          'Success',
          'Company settings saved successfully'
        );
      }, 1000);
    } else {
      this.markFormGroupTouched(this.companyForm);
    }
  }

  saveApiSettings(): void {
    if (this.apiForm.valid) {
      this.saving = true;

      // Simulate API call
      setTimeout(() => {
        const settings = this.getStoredSettings();
        settings.api = this.apiForm.value;
        localStorage.setItem('appSettings', JSON.stringify(settings));

        this.saving = false;
        this.notificationService.success(
          'Success',
          'API settings saved successfully'
        );
      }, 1000);
    } else {
      this.markFormGroupTouched(this.apiForm);
    }
  }

  saveAppSettings(): void {
    if (this.appForm.valid) {
      this.saving = true;

      // Simulate API call
      setTimeout(() => {
        const settings = this.getStoredSettings();
        settings.app = this.appForm.value;
        localStorage.setItem('appSettings', JSON.stringify(settings));

        this.saving = false;
        this.notificationService.success(
          'Success',
          'Application settings saved successfully'
        );
      }, 1000);
    } else {
      this.markFormGroupTouched(this.appForm);
    }
  }

  testApiConnection(): void {
    const apiUrl = this.apiForm.get('thirdPartyApiUrl')?.value;
    const apiKey = this.apiForm.get('thirdPartyApiKey')?.value;

    if (!apiUrl || !apiKey) {
      this.notificationService.warning(
        'Warning',
        'Please enter API URL and API Key first'
      );
      return;
    }

    this.testing = true;

    // Simulate API test
    setTimeout(() => {
      this.testing = false;
      // Simulate random success/failure
      if (Math.random() > 0.3) {
        this.notificationService.success(
          'Success',
          'API connection test successful'
        );
      } else {
        this.notificationService.error(
          'Error',
          'API connection test failed. Please check your settings.'
        );
      }
    }, 2000);
  }

  beforeUpload = (file: any): boolean => {
    debugger;
    const isImage = file.type.indexOf('image/') === 0;
    if (!isImage) {
      this.message.error('You can only upload image files!');
      return false;
    }

    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      this.message.error('Image must be smaller than 2MB!');
      return false;
    }

    return true; // Prevent automatic upload
  };

  handleLogoChange(info: any): void {
    if (info.file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.logoUrl = reader.result as string;
        debugger;
        const settings = this.getStoredSettings();
        settings.logoUrl = this.logoUrl;
        localStorage.setItem('appSettings', JSON.stringify(settings));
        this.notificationService.success(
          'Success',
          'Logo uploaded successfully'
        );
      };
      reader.readAsDataURL(info.file);
    }
  }

  getBuildDate(): string {
    return new Date().toLocaleDateString();
  }

  getEnvironment(): string {
    return 'Development';
  }

  clearCache(): void {
    localStorage.removeItem('appSettings');
    this.notificationService.success('Success', 'Cache cleared successfully');
  }

  exportSettings(): void {
    const settings = this.getStoredSettings();
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'invoice-app-settings.json';
    link.click();
    URL.revokeObjectURL(url);
    this.notificationService.success(
      'Success',
      'Settings exported successfully'
    );
  }

  importSettings(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const settings = JSON.parse(reader.result as string);
            localStorage.setItem('appSettings', JSON.stringify(settings));
            this.loadSettings();
            this.notificationService.success(
              'Success',
              'Settings imported successfully'
            );
          } catch (error) {
            this.notificationService.error('Error', 'Invalid settings file');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }

  private getStoredSettings(): any {
    const stored = localStorage.getItem('appSettings');
    return stored ? JSON.parse(stored) : {};
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
}
