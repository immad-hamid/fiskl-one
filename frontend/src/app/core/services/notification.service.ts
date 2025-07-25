import { Injectable } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(private notification: NzNotificationService) {}

  success(title: string, content?: string): void {
    this.notification.success(title, content || '', {
      nzDuration: 3000,
      nzPlacement: 'topRight'
    });
  }

  error(title: string, content?: string): void {
    this.notification.error(title, content || '', {
      nzDuration: 5000,
      nzPlacement: 'topRight'
    });
  }

  info(title: string, content?: string): void {
    this.notification.info(title, content || '', {
      nzDuration: 4000,
      nzPlacement: 'topRight'
    });
  }

  warning(title: string, content?: string): void {
    this.notification.warning(title, content || '', {
      nzDuration: 4000,
      nzPlacement: 'topRight'
    });
  }
}