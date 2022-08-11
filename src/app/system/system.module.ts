import { ApplicationRef, ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ToastrModule, ToastrService } from 'ngx-toastr';
import { AppNotificationsService, appNotificationsServiceFactory } from './services/app-notifications.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ToastrModule
  ]
})
export class SystemModule {
  static forRoot(): ModuleWithProviders<SystemModule> {
    return {
      ngModule: SystemModule,
      providers: [
        {
          provide: AppNotificationsService,
          deps: [ApplicationRef, ToastrService],
          useFactory: appNotificationsServiceFactory
        }
      ]
    };
  }
}
