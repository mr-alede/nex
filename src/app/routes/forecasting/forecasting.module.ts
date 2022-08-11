import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ForecastingComponent } from './forecasting/forecasting.component';

import { ForecastingRoutingModule } from './forecasting-routing.module';

@NgModule({
  imports: [
    CommonModule,

    ForecastingRoutingModule
  ],
  declarations: [
    ForecastingComponent
  ]
})
export class ForecastingModule { }
