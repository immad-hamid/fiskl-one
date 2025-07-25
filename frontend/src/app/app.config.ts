import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
  importProvidersFrom,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { en_US, provideNzI18n, NZ_I18N } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import { FormsModule } from '@angular/forms';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';

import { withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { IconDefinition } from '@ant-design/icons-angular';
import { NzIconModule } from 'ng-zorro-antd/icon';

// Import icons
import {
  MenuFoldOutline,
  MenuUnfoldOutline,
  DashboardOutline,
  FileTextOutline,
  SettingOutline,
  BarChartOutline,
  PlusOutline,
  EditOutline,
  DeleteOutline,
  DownloadOutline,
  EyeOutline,
  SearchOutline,
  FilterOutline,
  ReloadOutline,
} from '@ant-design/icons-angular/icons';

import { HttpErrorInterceptor } from './core/interceptors/http-error.interceptor';

registerLocaleData(en);

const icons: IconDefinition[] = [
  MenuFoldOutline,
  MenuUnfoldOutline,
  DashboardOutline,
  FileTextOutline,
  SettingOutline,
  BarChartOutline,
  PlusOutline,
  EditOutline,
  DeleteOutline,
  DownloadOutline,
  EyeOutline,
  SearchOutline,
  FilterOutline,
  ReloadOutline,
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideNzI18n(en_US),
    importProvidersFrom(FormsModule),
    provideAnimationsAsync(),
    provideHttpClient(),
    provideRouter(routes),
    provideHttpClient(),
    provideAnimations(),
    { provide: NZ_I18N, useValue: en_US },
    { provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true },
    importProvidersFrom(NzIconModule.forRoot(icons)),
  ],
};
