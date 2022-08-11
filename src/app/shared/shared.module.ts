import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CollapseModule } from 'ngx-bootstrap/collapse';

import { WaitIndicatorComponent } from './wait-indicator/wait-indicator.component';
import { PanelCollapseComponent } from './panel-collapse/panel-collapse.component';
import { LoaderComponent } from "./loader/loader.component";
import { PictureComponent } from "./picture/picture.component";
import { GeoCoordinatesComponent } from "./geo-coordinates/geo-coordinates.component";

import { DiffMinutesPipe } from "./pipes/diff-minutes.pipe";
import { AddAuthTokenPipe } from "./pipes/add-auth-token.pipe";
import { SafeUrlPipe } from "./pipes/safe-url.pipe";
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { BreadcrumbService } from './services/breadcrumb.service';
import { FullScreenModalComponent } from "./full-screen-modal/full-screen-modal.component";

@NgModule({
  declarations: [
    WaitIndicatorComponent,
    PanelCollapseComponent,
    LoaderComponent,
    PictureComponent,
    GeoCoordinatesComponent,
    DiffMinutesPipe,
    AddAuthTokenPipe,
    SafeUrlPipe,
    BreadcrumbComponent,
    FullScreenModalComponent
  ],
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    CollapseModule.forRoot()
  ],
  exports: [
    WaitIndicatorComponent, PanelCollapseComponent, LoaderComponent, PictureComponent,
    GeoCoordinatesComponent,
    DiffMinutesPipe,
    AddAuthTokenPipe,
    SafeUrlPipe,
    BreadcrumbComponent,
    FullScreenModalComponent
  ],
  providers: [
    BreadcrumbService,
  ]
})
export class SharedModule { }
