import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';

import { BehaviorSubject, combineLatest, interval, Observable, of, Subject, Subscription, timer } from 'rxjs';
import {
  debounce,
  distinctUntilKeyChanged, filter, map, share, switchMap, tap
} from 'rxjs/operators';

import { LngLatBounds, LngLatLike, Map } from 'mapbox-gl';

import { FeatureCollection } from 'geojson'

import { AppStateService, ICity } from '../../../../services';

import { AppNotificationsService } from '../../../../system';

import { ILayersVisibility, LayersVisibilityService } from '../../services/layers-visibility.service';
import { EmptyFeatureCollection, GeoProcessorService, MapStateService, SidebarType } from '../../services';
import { LayerName, RevenueType, TilesBoundingBox } from 'src/app/model';

const TestStreamUrl = 'http://210.148.114.53/-wvhttp-01-/GetOneShot?image_size=640x480&frame_count=1000000000';

export interface IMapSettings {
  lng: number;
  lat: number;
  zoom: number;
  pitch: number;
  animationEnabled: boolean;
}

export const DefaultMapSettings: IMapSettings = {
  lng: 0,
  lat: 0,
  zoom: 15,
  pitch: 30,
  animationEnabled: true
};

@Component({
  selector: 'app-city-map',
  templateUrl: './city-map.component.html',
  styleUrls: ['./city-map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CityMapComponent implements OnInit, OnDestroy {
  private _mapSettingsDeferred: IMapSettings | null;
  private _mapSettings: IMapSettings;
  get mapSettings(): IMapSettings {
    return this._mapSettings;
  }
  @Input() set mapSettings(value: IMapSettings) {
    if (!!this.map && value.animationEnabled) {
      this.map.flyTo({
        bearing: 0,
        zoom: value.zoom,
        pitch: value.pitch,
        center: [
          value.lng,
          value.lat
        ],
        essential: true,
        speed: 2
      });

      this._mapSettingsDeferred = value;
    } else {
      this.applyMapSettings(value);
    }
  }

  @Input() style: string;

  private _subscriptions = new Array<Subscription>();
  private _center$ = new BehaviorSubject<LngLatLike>(this.buildCenter(DefaultMapSettings));
  private _lngLatBounds$ = new Subject<LngLatBounds>();
  private _revenueRange$ = new Subject<Date[]>();

  get lngLatBounds$(): Observable<LngLatBounds> {
    return this._lngLatBounds$.asObservable();
  }

  city: ICity | null = null;
  center?: LngLatLike;
  zoom: [number];
  pitch: [number];
  bounds: LngLatBounds | null;
  cursorStyle!: string;
  busy = false;
  revenueType: RevenueType;

  cameras$ = new BehaviorSubject<FeatureCollection>(EmptyFeatureCollection);
  meters$ = new BehaviorSubject<FeatureCollection>(EmptyFeatureCollection);
  spots$ = new BehaviorSubject<FeatureCollection>(EmptyFeatureCollection);
  signs$ = new BehaviorSubject<FeatureCollection>(EmptyFeatureCollection);
  zones$ = new BehaviorSubject<FeatureCollection>(EmptyFeatureCollection);
  offstreetZones$ = new BehaviorSubject<FeatureCollection>(EmptyFeatureCollection);
  metersRevenue$ = new BehaviorSubject<FeatureCollection>(EmptyFeatureCollection);

  initialized = false;
  isMetersInfoPanelAvailable = true;
  map: Map;

  layerName = LayerName;

  constructor(
    private cdRef: ChangeDetectorRef,
    private appNotifications: AppNotificationsService,
    public layersVisibility: LayersVisibilityService,
    private mapState: MapStateService,
    private appState: AppStateService,
    private geoProcessor: GeoProcessorService
  ) {
    this.mapSettings = { ...DefaultMapSettings };
    let today = new Date();
    let yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
  }

  ngOnInit(): void {
    this._subscriptions.push(
      this.mapState.revenueType$
        .subscribe(res => {
          this.revenueType = res;
        })
    );

    const bounds$ = combineLatest(
      this.layersVisibility.layers$.pipe(
        map(
          x => this.getActiveLayers(x)
        )
      ),
      this._lngLatBounds$.pipe(
        map(x => ({ bounds: x, zoom: this.map?.getZoom() })),
        filter(x => !!x.zoom),
        map(x => new TilesBoundingBox(x.bounds, x.zoom)),
        distinctUntilKeyChanged('key')
      )
    )
      .pipe(
        map(x => ({ layers: x[0], box: x[1] })),
        tap(x => console.log('BOUNDING BOX OF ', x.box.getTiles().length, ' tiles')),
        switchMap(box => timer(0, 10000).pipe(map(x => ({ ...box, isPooling: x > 0 })))),
        filter(x => x.layers.length > 0 && !document.hidden),
        map(x => ({
          box: x.box,
          zoom: x.box.zoom,
          layers: x.layers,
          isPooling: x.isPooling
        })),
        share()
      );

    this._subscriptions.push(
      bounds$
        .pipe(
          filter(x => !!x.layers.find(l => l === 'meters') && !x.isPooling),
          switchMap(x => this.geoProcessor.loadMeters(x.box, x.zoom))
        )
        .subscribe(res => {
          this.meters$.next(res);
        })
    );

    this._subscriptions.push(
      bounds$
        .pipe(
          filter(x => !!x.layers.find(l => l === 'cameras') && !x.isPooling),
          switchMap(x => this.geoProcessor.loadCameras(x.box, x.zoom))
        )
        .subscribe(res => {
          this.cameras$.next(res);
        })
    );

    this._subscriptions.push(
      bounds$
        .pipe(
          filter(x => !!x.layers.find(l => l === 'signs') && !x.isPooling),
          switchMap(x => this.geoProcessor.loadSigns(x.box, x.zoom))
        )
        .subscribe(res => {
          this.signs$.next(res);
        })
    );

    this._subscriptions.push(
      bounds$
        .pipe(
          filter(x => !!x.layers.find(l => l === 'spots')),
          switchMap(x => this.geoProcessor.loadSpots(x.box, x.zoom))
        )
        .subscribe(res => {
          this.spots$.next(res);
        })
    );

    this._subscriptions.push(
      bounds$
        .pipe(
          filter(x => !!x.layers.find(l => l === 'zones') && !x.isPooling),
          switchMap(x => this.geoProcessor.loadZones(x.box, x.zoom))
        )
        .subscribe(res => {
          this.zones$.next(res);
        })
    );

    this._subscriptions.push(
      bounds$
        .pipe(
          filter(x => !!x.layers.find(l => l === 'offstreet-zones') && !x.isPooling),
          switchMap(x => this.geoProcessor.loadOffstreetZones(x.box, x.zoom))
        )
        .subscribe(res => {
          this.offstreetZones$.next(res);
        })
    );

    this._subscriptions.push(
      bounds$
        .pipe(
          filter(x => !!x.layers.find(l => l === 'revenue')),
          switchMap(x => this.mapState.revenueType$.pipe(map(t => ({ type: t, bounds: x })))),
          switchMap(x => this.geoProcessor.loadMetersRevenue(x.bounds.box, x.bounds.zoom, x.type))
        )
        .subscribe(res => {
          this.metersRevenue$.next(res);
        })
    );

    this._subscriptions.push(
      this._center$.pipe(
        debounce(x => interval(50))
      )
        .subscribe(res => {
          this.center = res;
        }));

    this._subscriptions.push(
      this.appState.currentCity$
        .subscribe(res => {
          this.mapState.clearSelectedEntity();
          this.mapState.closeSidebar();
        }));

    this._subscriptions.push(
      this.appState.currentCity$
        .subscribe(res => {
          this.isMetersInfoPanelAvailable = (res?.Code == 'SFC');
        })
    );

    this._subscriptions.push(
      this.appState.currentCity$
        .subscribe(city => {
          this.city = city;
        })
    );
  }

  ngOnDestroy(): void {
    this._subscriptions.forEach(x => x.unsubscribe());
    this._subscriptions = [];
    this.mapState.clearSelectedEntity();
  }

  onLoad(map: Map) {
    this.map = map;
    this.initialized = true;
    this._lngLatBounds$.next(map.getBounds());
  }

  onMoveEnd($event: { type: string, target: Map, originalEvent: any }) {
    if (!$event.originalEvent && !!this._mapSettingsDeferred) {
      this.applyMapSettings(this._mapSettingsDeferred);
      this._mapSettingsDeferred = null;
    }

    const zoom = this.map?.getZoom();
    if (!!zoom) {
      this._lngLatBounds$.next($event.target.getBounds());
    }

    console.log('Zoom:', this.map?.getZoom());
  }

  toggleSidebar(type: SidebarType) {
    this.mapState.toggleSidebar(type);
  }

  home() {
    this.mapSettings = {
      lng: this.city?.CenterPosition[0] || 0,
      lat: this.city?.CenterPosition[1] || 0,
      animationEnabled: true,
      ...{ zoom: DefaultMapSettings.zoom, pitch: DefaultMapSettings.pitch }
    };
  }

  isLayerVisible(name: LayerName): boolean {
    return this.layersVisibility.isLayerVisible(name);
  }
  isAnyLayerVisible(): boolean {
    return this.layersVisibility.isAnyLayerVisible();
  }

  applyRevenueRange(range: Date[]) {
    this._revenueRange$.next(range);
    this.busy = true;
  }

  moveTo(lng: number, lat: number, zoom: number | null = null) {
    zoom = zoom || this.map?.getZoom();
    this.mapSettings = { ...this._mapSettings, ...{ lng, lat, zoom: zoom, pitch: this.map?.getPitch() } };
    this.cdRef.detectChanges();
  }

  private applyMapSettings(value: IMapSettings) {
    this._mapSettings = value;

    this._center$.next(this.buildCenter(value));
    this.zoom = [value.zoom];
    this.pitch = [value.pitch];
  }

  private buildCenter(settings: IMapSettings): LngLatLike {
    return [settings.lng, settings.lat];
  }

  private catchError(err: any): Observable<GeoJSON.FeatureCollection> {
    console.log(err);
    this.appNotifications.error(err.message);
    return of<GeoJSON.FeatureCollection>(EmptyFeatureCollection);
  }

  private getActiveLayers(layersVisibility: ILayersVisibility): Array<LayerName> {
    return Object.getOwnPropertyNames(layersVisibility).filter(l => layersVisibility[l] === true).map(l => <LayerName>l);
  }
}


