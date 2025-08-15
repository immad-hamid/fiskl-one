import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { HeaderComponent } from './layout/header/header.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NzLayoutModule,
    NzMenuModule,
    NzIconModule,
    NzBreadCrumbModule,
    NzDropDownModule,
    NzAvatarModule,
    NzToolTipModule,
    HeaderComponent,
    SidebarComponent
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class App implements OnInit, OnDestroy {
  isCollapsed = false;
  currentRoute = '';
  isMobile = false;

  constructor(private router: Router) {
    this.checkIsMobile();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkIsMobile();
  }

  ngOnInit() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.urlAfterRedirects;
      });
  }

  ngOnDestroy() {
    // Add any cleanup if needed
  }

  private checkIsMobile() {
    this.isMobile = window.innerWidth <= 768;
    // On mobile, start with collapsed sidebar
    if (this.isMobile) {
      this.isCollapsed = true;
    }
  }

  toggleCollapsed(): void {
    this.isCollapsed = !this.isCollapsed;
  }
}