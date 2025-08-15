import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

import { environment } from '../../../environments/environment';

interface MenuItem {
  title: string;
  icon: string;
  route: string;
  children?: MenuItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzMenuModule,
    NzIconModule,
    NzToolTipModule
  ],
  template: `
    <div class="sidebar-header">
      <div class="logo" [class.collapsed]="isCollapsed">
        <span nz-icon nzType="file-text" class="logo-icon"></span>
        @if (!isCollapsed) {
          <span class="logo-text">{{ companyName }}</span>
        }
      </div>
    </div>

    <ul nz-menu 
        nzMode="inline" 
        [nzInlineCollapsed]="isCollapsed"
        class="sidebar-menu">
      
      @for (item of menuItems; track item.route) {
        @if (!item.children) {
          <li nz-menu-item 
              [routerLink]="item.route"
              routerLinkActive="ant-menu-item-selected"
              [nz-tooltip]="isCollapsed ? item.title : null"
              nzTooltipPlacement="right">
            <span nz-icon [nzType]="item.icon"></span>
            <span class="menu-text">{{ item.title }}</span>
          </li>
        }

        @if (item.children) {
          <li nz-submenu 
              [nzTitle]="item.title"
              [nzIcon]="item.icon">
            <ul>
              @for (child of item.children; track child.route) {
                <li nz-menu-item 
                    [routerLink]="child.route"
                    routerLinkActive="ant-menu-item-selected">
                  <span nz-icon [nzType]="child.icon"></span>
                  <span>{{ child.title }}</span>
                </li>
              }
            </ul>
          </li>
        }
      }
    </ul>

    @if (!isCollapsed) {
      <div class="sidebar-footer">
        <div class="version-info">
          <small>Version {{ version }}</small>
        </div>
      </div>
    }
  `,
  styles: [`
    .sidebar-header {
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #001529;
      border-bottom: 1px solid #001529;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #fff;
      font-size: 16px;
      font-weight: 600;
      transition: all 0.3s;
    }

    .logo.collapsed {
      justify-content: center;
    }

    .logo-icon {
      font-size: 24px;
      color: #1890ff;
    }

    .logo-text {
      white-space: nowrap;
      overflow: hidden;
    }

    .sidebar-menu {
      height: calc(100vh - 64px - 60px);
      border-right: 0;
      overflow-y: auto;
      overflow-x: hidden;
    }

    .sidebar-menu::-webkit-scrollbar {
      width: 4px;
    }

    .sidebar-menu::-webkit-scrollbar-track {
      background: #001529;
    }

    .sidebar-menu::-webkit-scrollbar-thumb {
      background: #1890ff;
      border-radius: 2px;
    }

    .menu-text {
      margin-left: 12px;
    }

    .sidebar-footer {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #001529;
      border-top: 1px solid #262626;
    }

    .version-info {
      color: #8c8c8c;
      text-align: center;
    }

    :host ::ng-deep .ant-menu-inline-collapsed .ant-menu-item {
      padding-left: 24px !important;
    }

    :host ::ng-deep .ant-menu-item-selected {
      color: rgba(0, 0, 0, 0.85);
    }
  `]
})
export class SidebarComponent {
  @Input() isCollapsed = false;

  companyName = environment.companyName;
  version = environment.version;

  menuItems: MenuItem[] = [
    {
      title: 'Dashboard',
      icon: 'dashboard',
      route: '/dashboard'
    },
    {
      title: 'Invoices',
      icon: 'file-text',
      route: '/invoices',
      children: [
        {
          title: 'All Invoices',
          icon: 'unordered-list',
          route: '/invoices/list'
        },
        {
          title: 'Create Invoice',
          icon: 'plus',
          route: '/invoices/create'
        }
      ]
    },
    {
      title: 'Reports',
      icon: 'bar-chart',
      route: '/reports'
    },
    {
      title: 'Settings',
      icon: 'setting',
      route: '/settings'
    }
  ];

  constructor(private router: Router) {}
}