import { ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { ApiInterceptor } from './interceptors/api.interceptor';
import { ErrorInterceptor } from './interceptors/error.interceptor';

import { AppConfigurationService } from './services/app-config.service';
import { AppStateService } from './services/app-state.service';
import { AuthService } from './services/auth.service';

import { CamerasService } from './services/cameras.service';
import { ParkingMetersService } from './services/parking-meters.service';
import { ParkingSpotsService } from './services/parking-spots.service';
import { RevenueTransactionsService } from './services/revenue-transactions.service';

// frontend API
import { CitiesService } from './services/frontend-api/cities.service';
import { MetersService } from './services/frontend-api/meters.service';
import { FrontendApiCamerasService } from './services/frontend-api/cameras.service';
import { TransactionsService } from './services/frontend-api/transactions.service';
import { SignsService } from './services/frontend-api/signs.service';
import { GeoIndexesService } from './services/frontend-api/geo-indexes.service';
import { AreasService } from './services/frontend-api/areas.service';
import { OffstreetZonesService } from './services/frontend-api/offstreet-zones.service';

import { OnlyAnonymousGuard } from './guards';
import { OnlyLouisvilleGuard } from './guards';
import { TenantGuard } from './guards';
import { RevenueService } from "./services/frontend-api/revenue.service";
import { FullScreenModalService } from "../shared/services/full-screen-modal.service";

@NgModule({
  declarations: [],
  imports: [
    HttpClientModule
  ]
})
export class ServicesModule {
  static forRoot(): ModuleWithProviders<ServicesModule> {
    return {
      ngModule: ServicesModule,
      providers: [
        {
          provide: HTTP_INTERCEPTORS,
          useClass: ApiInterceptor,
          multi: true,
        },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: ErrorInterceptor,
          multi: true,
        },

        AppConfigurationService, AppStateService, AuthService,
        OnlyAnonymousGuard, TenantGuard, OnlyLouisvilleGuard,
        CamerasService, ParkingMetersService, ParkingSpotsService, RevenueTransactionsService,
        CitiesService, MetersService, FrontendApiCamerasService, TransactionsService,
        SignsService, GeoIndexesService,
        AreasService,
        RevenueService,
        OffstreetZonesService,
        FullScreenModalService
      ]
    };
  }

  constructor(@Optional() @SkipSelf() parentModule: ServicesModule) {
  }
}
