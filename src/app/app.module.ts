import { APP_INITIALIZER, Injector, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LOCATION_INITIALIZED } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { NgSelectModule } from '@ng-select/ng-select';

import { MAPBOX_API_KEY } from 'ngx-mapbox-gl';
import { ToastrModule } from 'ngx-toastr';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { IPublicClientApplication, PublicClientApplication, InteractionType, BrowserCacheLocation, LogLevel } from '@azure/msal-browser';
import { MsalGuard, MsalInterceptor, MsalBroadcastService, MsalInterceptorConfiguration, MsalModule, MsalService, MSAL_GUARD_CONFIG, MSAL_INSTANCE, MSAL_INTERCEPTOR_CONFIG, MsalGuardConfiguration, MsalRedirectComponent } from '@azure/msal-angular';

import { AppConfigurationService } from './services';
import { ServicesModule } from './services';
import { SystemModule } from './system';
import { SharedModule } from './shared';
import { AppRoutingModule } from './app-routing.module';


import { AppComponent } from './app.component';
import { NavbarComponent } from './navigation/navbar/navbar.component';
import { HomeComponent } from './routes/home/home.component';
import { NavSidebarComponent } from './navigation/nav-sidebar/nav-sidebar.component';

export function loadConfig(injector: Injector, config: AppConfigurationService) {
  return () => new Promise(resolve => {
    const locationInitialized = injector.get(LOCATION_INITIALIZED, Promise.resolve(null));

    locationInitialized.then(() => {
      config.load().then(res => resolve(res));
    });
  });
}

export function loadMapboxToken(config: AppConfigurationService) {
  return config.data.map.mapbox_api_token;
}

const isIE = window.navigator.userAgent.indexOf("MSIE ") > -1 || window.navigator.userAgent.indexOf("Trident/") > -1;

export function loggerCallback(logLevel: LogLevel, message: string) {
  console.log(message);
}

export function MSALInstanceFactory(config: AppConfigurationService): IPublicClientApplication {
  return new PublicClientApplication({
    auth: {
      clientId: config.data.auth.aadClientId,
      authority: config.data.auth.aadAuthority,
      redirectUri: '/',
      postLogoutRedirectUri: '/'
    },
    cache: {
      cacheLocation: BrowserCacheLocation.LocalStorage,
      storeAuthStateInCookie: isIE, // set to true for IE 11. Remove this line to use Angular Universal
    },
    system: {
      loggerOptions: {
        loggerCallback,
        logLevel: LogLevel.Info,
        piiLoggingEnabled: false
      }
    }
  });
}

export function MSALInterceptorConfigFactory(config: AppConfigurationService): MsalInterceptorConfiguration {
  const protectedResourceMap = new Map<string, Array<string> | null>();

  protectedResourceMap.set('*', [`api://${config.data.auth.aadClientId}/Default`]);
  protectedResourceMap.set('*/*', [`api://${config.data.auth.aadClientId}/Default`]);

  return {
    interactionType: InteractionType.Popup,
    protectedResourceMap
  };
}

export function MSALGuardConfigFactory(): MsalGuardConfiguration {
  return {
    interactionType: InteractionType.Popup,
    authRequest: {
      scopes: ['openid', 'profile'],
      prompt: 'select_account'
    },
    loginFailedRoute: '/login-failed'
  };
}

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    HomeComponent,
    NavSidebarComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,

    NgSelectModule,
    MsalModule,
    BsDropdownModule,

    ServicesModule.forRoot(),
    SystemModule.forRoot(),
    SharedModule,

    ToastrModule.forRoot({
      timeOut: 2000,
      positionClass: 'toast-bottom-right',
      newestOnTop: false
    }),
    BsDatepickerModule.forRoot(),

    AppRoutingModule
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: loadConfig,
      deps: [Injector, AppConfigurationService],
      multi: true
    },
    {
      provide: MAPBOX_API_KEY,
      useFactory: loadMapboxToken,
      deps: [AppConfigurationService]
    },

    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true
    },
    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory,
      deps: [AppConfigurationService]
    },
    {
      provide: MSAL_GUARD_CONFIG,
      useFactory: MSALGuardConfigFactory
    },
    {
      provide: MSAL_INTERCEPTOR_CONFIG,
      useFactory: MSALInterceptorConfigFactory,
      deps: [AppConfigurationService]
    },
    MsalService,
    MsalGuard,
    MsalBroadcastService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
