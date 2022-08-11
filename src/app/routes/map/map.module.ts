import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { NgxMapboxGLModule } from 'ngx-mapbox-gl';
import { NgxFluentDesignIconModule, NgxFluentDesignInputModule, NgxFluentDesignCtaModule } from 'ngx-fluent-design';

import { NgSelectModule } from '@ng-select/ng-select';

import { MomentModule } from 'ngx-moment';

import { SharedModule } from '../../shared';
import { MapRoutingModule } from './map-routing.module';

import { CityMapComponent } from './map/city-map/city-map.component';
import { AreaTypeNamePipe } from './pipes'

import { MapControlComponent } from './map/controls/map-control.component';
import { MapNavigationControlComponent } from './map/controls/map-navigation-control.component';

import { MapComponent } from './map/map.component';
import { SpotsLayerComponent } from './map/layers/spots/spots-layer/spots-layer.component';
import { AreasLayerComponent } from './map/layers/areas/areas-layer/areas-layer.component';

import { MapStateService } from './services/map-state.service';
import { LayersVisibilityService } from './services/layers-visibility.service';
import { SelectedItemsService } from './services/selected-items.service';
import { GeoProcessorService } from './services/geo-processor.service';
import { AreasProcessorService } from './services/areas-processor.service';

import { MetersLayerComponent } from './map/layers/meters/meters-layer/meters-layer.component';
import { CamerasLayerComponent } from './map/layers/cameras/cameras-layer/cameras-layer.component';
import { RevenueLayerComponent } from './map/layers/revenue/revenue-layer/revenue-layer.component';
import { TrafficLayerComponent } from './map/layers/traffic/traffic-layer/traffic-layer.component';
import { ToggleLayersSidebarComponent } from './map/toggle-layers-sidebar/toggle-layers-sidebar.component';
import { SidebarAnimationContainerComponent } from './map/controls/sidebar-animation-container.component';

import { MeterPopupComponent } from './map/layers/meters/meter-popup/meter-popup.component';
import { MeterSidebarComponent } from './map/layers/meters/meter-sidebar/meter-sidebar.component';

import { SignsLayerComponent } from './map/layers/signs/signs-layer/signs-layer.component';
import { SignPopupComponent } from './map/layers/signs/sign-popup/sign-popup.component';
import { SignSidebarComponent } from './map/layers/signs/sign-sidebar/sign-sidebar.component';
import { SignStatusComponent } from './map/layers/signs/sign-status/sign-status.component';
import { ZonesLayerComponent } from "./map/layers/zone/zones-layer/zones-layer.component";
import { ZonePopupComponent } from "./map/layers/zone/zone-popup/zone-popup.component";
import { ZoneSidebarComponent } from "./map/layers/zone/zone-sidebar/zone-sidebar.component";
import { CameraPopupComponent } from './map/layers/cameras/camera-popup/camera-popup.component';
import { CameraSidebarComponent } from './map/layers/cameras/camera-sidebar/camera-sidebar.component';
import { CameraStatusComponent } from './map/layers/cameras/camera-status/camera-status.component';
import { SpotPopupComponent } from "./map/layers/spots/spot-popup/spot-popup.component";
import { SpotSidebarComponent } from "./map/layers/spots/spot-sidebar/spot-sidebar.component";
import { AreaPopupComponent } from "./map/layers/areas/area-popup/area-popup.component";
import { AreaSidebarComponent } from "./map/layers/areas/area-sidebar/area-sidebar.component";

import { OffstreetZonesLayerComponent } from './map/layers/offstreet-zones/offstreet-zones-layer/offstreet-zones-layer.component';
import { OffstreetZonesPopupComponent } from "./map/layers/offstreet-zones/offstreet-zones-popup/offstreet-zones-popup.component";
import { OffstreetZonesSidebarComponent } from "./map/layers/offstreet-zones/offstreet-zones-sidebar/offstreet-zones-sidebar.component";
import { RevenueTableComponent } from "./map/common/revenue/revenue-table/revenue-table.component";
import { SpotIconComponent } from './map/layers/spots/spot-icon/spot-icon.component';
import { SpotsComponent } from './map/common/spots/spots.component';
import { RevenueMoreInfoComponent } from './map/common/revenue-more-info/revenue-more-info.component';
import { SpotsStatesComponent } from "./map/common/spots-states/spots-states.component";
import { CameraVideoPlayerComponent } from "./map/common/camera-video-player/camera-video-player.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,

    BsDatepickerModule,
    SharedModule,

    MomentModule,
    NgSelectModule,

    NgxMapboxGLModule,
    NgxFluentDesignIconModule, NgxFluentDesignInputModule, NgxFluentDesignCtaModule,
    MapRoutingModule
  ],
  declarations: [
    CityMapComponent,
    AreaTypeNamePipe,
    MapComponent, MapControlComponent, MapNavigationControlComponent,
    SpotsLayerComponent, AreasLayerComponent, MetersLayerComponent, CamerasLayerComponent,
    RevenueLayerComponent, TrafficLayerComponent, ToggleLayersSidebarComponent,
    SidebarAnimationContainerComponent, MeterPopupComponent, MeterSidebarComponent,
    ZonesLayerComponent, ZonePopupComponent, ZoneSidebarComponent,
    SignsLayerComponent, SignPopupComponent, SignSidebarComponent, SignStatusComponent,
    CameraPopupComponent, CameraSidebarComponent, CameraStatusComponent,
    SpotPopupComponent, SpotSidebarComponent,
    AreaPopupComponent, AreaSidebarComponent,
    OffstreetZonesLayerComponent, OffstreetZonesPopupComponent, OffstreetZonesSidebarComponent,
    RevenueTableComponent,
    SpotIconComponent,
    SpotsComponent,
    SpotsStatesComponent,
    CameraVideoPlayerComponent,
    RevenueMoreInfoComponent
  ],
  providers: [
    MapStateService, LayersVisibilityService, SelectedItemsService,
    GeoProcessorService,
    AreasProcessorService
  ]
})
export class MapModule { }
