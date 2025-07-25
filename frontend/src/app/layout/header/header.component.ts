import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';

import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    NzIconModule,
    NzButtonModule,
    NzDropDownModule,
    NzAvatarModule,
    NzMenuModule,
    NzToolTipModule,
    NzBadgeModule
  ],
  template: `
    <div class="header-container">
      <div class="header-left">
        <button 
          nz-button 
          nzType="text" 
          nzSize="large"
          (click)="toggleCollapsed.emit()"
          nz-tooltip
          [nzTooltipTitle]="isCollapsed ? 'Expand Menu' : 'Collapse Menu'">
          <span nz-icon [nzType]="isCollapsed ? 'menu-unfold' : 'menu-fold'"></span>
        </button>
        
        <div class="breadcrumb">
          <span class="route-title">{{ getRouteTitle() }}</span>
        </div>
      </div>

      <div class="header-right">
        <button 
          nz-button 
          nzType="text" 
          nzSize="large"
          nz-tooltip
          nzTooltipTitle="Refresh Page"
          (click)="refreshPage()">
          <span nz-icon nzType="reload"></span>
        </button>

        <nz-badge [nzCount]="3" nzSize="small">
          <button 
            nz-button 
            nzType="text" 
            nzSize="large"
            nz-tooltip
            nzTooltipTitle="Notifications">
            <span nz-icon nzType="bell"></span>
          </button>
        </nz-badge>

        <div class="user-menu" nz-dropdown [nzDropdownMenu]="menu" nzPlacement="bottomRight">
          <nz-avatar nzSize="small" nzIcon="user"></nz-avatar>
          <span class="username">Admin</span>
          <span nz-icon nzType="down"></span>
        </div>

        <nz-dropdown-menu #menu="nzDropdownMenu">
          <ul nz-menu>
            <li nz-menu-item (click)="navigateToSettings()">
              <span nz-icon nzType="setting"></span>
              Settings
            </li>
            <li nz-menu-divider></li>
            <li nz-menu-item (click)="logout()">
              <span nz-icon nzType="logout"></span>
              Logout
            </li>
          </ul>
        </nz-dropdown-menu>
      </div>
    </div>
  `,
  styles: [`
    .header-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 64px;
      padding: 0 24px;
      background: #fff;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .breadcrumb {
      font-size: 16px;
      font-weight: 500;
      color: #262626;
    }

    .route-title {
      text-transform: capitalize;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .user-menu {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-radius: 6px;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    .user-menu:hover {
      background-color: #f5f5f5;
    }

    .username {
      font-size: 14px;
      color: #595959;
    }
  `]
})
export class HeaderComponent {
  @Input() isCollapsed = false;
  @Output() toggleCollapsed = new EventEmitter<void>();

  constructor(private router: Router) {}

  getRouteTitle(): string {
    const route = this.router.url.split('/')[1] || 'dashboard';
    return route.replace('-', ' ');
  }

  refreshPage(): void {
    window.location.reload();
  }

  navigateToSettings(): void {
    this.router.navigate(['/settings']);
  }

  logout(): void {
    // Implement logout logic
    console.log('Logout clicked');
  }
}