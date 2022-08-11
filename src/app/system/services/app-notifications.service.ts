import {
    Injectable,
    ApplicationRef,
    ViewContainerRef
  } from '@angular/core';
  
  import { ActiveToast } from 'ngx-toastr';
  import { ToastrService } from 'ngx-toastr';
  
  @Injectable({ providedIn: 'root' })
  export class AppNotificationsService {
    initialized = false;
  
    get toastsManager(): ToastrService {
      return this.toastr;
    }
  
    constructor(private appRef: ApplicationRef, private toastr: ToastrService) {
    }
  
    private getRootViewContainerRef(): ViewContainerRef {
      const appInstance = this.appRef.components[0].instance;
  
      if (!appInstance.viewContainerRef) {
        const appName = this.appRef.componentTypes[0].name;
        throw new Error(`Missing 'viewContainerRef' declaration in ${appName} constructor`);
      }
  
      return appInstance.viewContainerRef;
    }
  
    success(message: string) {
      this.toastr.success(message);
    }
  
    error(message: string) {
      this.toastr.error(message);
    }
  
    warning(message: string) {
      this.toastr.warning(message);
    }
  
    info(message: string, title?: string, options?: any): ActiveToast<any> {
      return this.toastr.info(message);
    }
  
    custom(message: string, title?: string, options?: any): ActiveToast<any> {
      return this.toastr.show(message, title, options);
    }
  
    checkResponse(response: any) {
      if (!response.Success && response.Message) {
        this.error(response.Message);
      }
    }
  }
  
  export function appNotificationsServiceFactory(appRef: ApplicationRef, toastr: ToastrService) {
    return new AppNotificationsService(appRef, toastr);
  }
  
  