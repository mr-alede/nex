import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';

import { LngLatLike, MapLayerMouseEvent } from 'mapbox-gl';

import { BehaviorSubject, mergeMap, of, Subscription, zip } from 'rxjs';
import { filter, finalize, map } from 'rxjs/operators';

import {
  Point,
  FeatureCollection,
  Feature,
  GeoJsonProperties
} from 'geojson';

import { GeoJSONSourceComponent } from 'ngx-mapbox-gl';

import {
  LayersVisibilityService, MapStateService, SelectedItemsService, ISelectedMeter,
  ISelectedEntityOnMap
} from '../../../../services';
import { ILayouts, IPaints, LayerBaseComponent } from '../../layer-base.component';

import {
  IMeter,
  MetersService,
  ZonesService,
  TransactionsService,
  RevenueService
} from '../../../../../../services';

import { CityMapComponent } from '../../../city-map/city-map.component';
import { LayerName, SelectedItemName } from '../../../../../../model';

const COLORS = {
  'General': 'gray',
  'Commercial': 'yellow',
  'ShortTerm': 'green',
  'Motorcycle': 'black',
  'TourBus': 'brown',
  'SixWheeled': 'red',
  'BoatTrailer': 'violet'
};

@Component({
  selector: 'app-meters-layer',
  templateUrl: './meters-layer.component.html',
  styleUrls: ['./meters-layer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MetersLayerComponent extends LayerBaseComponent implements OnInit, OnDestroy {
  @Input() map: CityMapComponent;
  @ViewChild('metersSource') metersSource: GeoJSONSourceComponent;

  subscriptions = new Array<Subscription>();

  popupOpen = false;
  selectedMeterFeature!: Feature<Point, GeoJsonProperties> | null;

  clusterFeatures: Feature<Point, GeoJsonProperties>[] | null = null;
  clusterCenter: LngLatLike | undefined = undefined;

  meter$ = new BehaviorSubject<ISelectedMeter | null>(null);

  busy = true;

  @Input() spots: FeatureCollection | null = { type: "FeatureCollection", features: [] };

  private _meters: FeatureCollection = { type: "FeatureCollection", features: [] };
  get meters(): FeatureCollection {
    return this._meters;
  }
  @Input() set meters(value: FeatureCollection | null) {
    this._meters = value || { type: "FeatureCollection", features: [] };
  }

  layouts$ = new BehaviorSubject<ILayouts>({
    meters: {
      visibility: 'visible'
    }
  });

  paints: IPaints = {
    meters: {
      'circle-radius': {
        'base': 1.2,
        'stops': [
          [12, 1.5],
          [22, 8]
        ]
      },
      'circle-color': [
        'match', ['get', 'policy'],
        'General', COLORS['General'],
        'Commercial', COLORS['Commercial'],
        'ShortTerm', COLORS['ShortTerm'],
        'Motorcycle', COLORS['Motorcycle'],
        'TourBus', COLORS['TourBus'],
        'SixWheeled', COLORS['SixWheeled'],
        'BoatTrailer', COLORS['BoatTrailer'],
        /* other */ 'gray'
      ]
    }
  };

  constructor(
    layersVisibility: LayersVisibilityService,
    mapState: MapStateService,
    private metersService: MetersService,
    private selectedItemsService: SelectedItemsService,
    private zonesService: ZonesService,
    private revenueService: RevenueService,
    private transactionService: TransactionsService) {
    super(layersVisibility, mapState);
  }

  ngOnInit(): void {
    this.initVisibility(LayerName.Meters, true);

    this.subscriptions.push(
      this.mapState.selectedEntity$
        .subscribe(x => {
          this.selectedMeterFeature = null;

          if (x?.type === 'meter') {
            this.selectMeter(x?.entity);
          }
        })
    );

    this.subscriptions.push(
      this.selectedItemsService.items$
        .subscribe(x => {
          this.meter$.next(x.meter?.item || null);
        })
    );

    this.subscriptions.push(
      this.mapState.selectedEntityOnMap$
        .pipe(
          filter(x => x?.type === SelectedItemName.Meter),
        )
        .subscribe(x => {
          this.selectOnMap(<ISelectedEntityOnMap>x);
        })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(x => x.unsubscribe());
    this.subscriptions = [];
  }

  onMeterClick(evt: MapLayerMouseEvent) {
    const meters = <Feature<Point, GeoJsonProperties>[]>evt.features;
    // if (meters.length > 1) {
    //   this.clusterFeatures = meters;
    //   this.clusterCenter = <LngLatLike>meters[0].geometry.coordinates;
    // } else {
      this.mapState.selectEntity(SelectedItemName.Meter, meters[0]);
    // }
  }

  onClusterItemClick(feature: Feature<Point, GeoJsonProperties>) {
    this.clusterFeatures = null;
    this.clusterCenter = undefined;
    this.mapState.selectEntity(SelectedItemName.Meter, feature);
  }

  private selectMeter(meter: Feature<Point, GeoJsonProperties>) {
    const properties = meter.properties || {};
    const parkingMeterId = properties['id'];
    this.selectedMeterFeature = meter;

    this.selectedItemsService.loadItem(SelectedItemName.Meter, parkingMeterId, () => {
      this.busy = true;
      return this.metersService.get(parkingMeterId)
        .pipe(
          mergeMap(res => zip(
            of(res),
            res?.Id ? this.revenueService.getRevenueByMeter(res.Id) : of([]),
            res?.Id ? this.transactionService.getTopMeterTransactions(res.Id) : of([]),
            res?.ZoneId ? this.zonesService.get(res.ZoneId) : of(null)
          )),
          map(res => {
            return {
              ...res[0],
              revenue: res[1],
              zone: res[3],
              transactions: res[2]
            }
          }),
          finalize(() => {
            this.busy = false;
          }),
        )
    })
      .subscribe(res => { });
  }

  private selectOnMap(x: ISelectedEntityOnMap): void {
    const feature = this.findFeatureById(this._meters, x.id || 0)

    if (!!feature) {
      this.openPopupOnMap(feature, SelectedItemName.Meter, this.map);
    }

    if (!feature) {
      this.metersService.get(x?.id || 0).subscribe((meter: IMeter) => {

        const position = meter ? meter.Position : null;

        const point: Feature<Point, GeoJsonProperties> = {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: position ? [position[0], position[1]] : []
          },
          properties: { id: x.id }
        };

        if (point && position) {
          this.map.moveTo(point.geometry.coordinates[0], point.geometry.coordinates[1]);
          this.mapState.selectEntity(SelectedItemName.Meter, point);
        }
      })
    }
  }
}
