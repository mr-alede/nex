import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';

import { MapLayerMouseEvent, Map } from 'mapbox-gl';

import { BehaviorSubject, Subscription, zip } from 'rxjs';
import { filter, finalize, map, mergeMap } from 'rxjs/operators';

import {
  Point,
  FeatureCollection,
  Feature,
  GeoJsonProperties,
  Polygon
} from 'geojson'

import * as turf from '@turf/boolean-point-in-polygon';

import {
  ISelectedEntityOnMap,
  ISelectedOffstreetZone, LayersVisibilityService,
  MapStateService, SelectedItemsService
} from '../../../../services';
import { ILayouts, IPaints, LayerBaseComponent } from '../../layer-base.component';

import {
  AreasService, IOffstreetZone, OffstreetZonesService, RevenueService,
} from '../../../../../../services';

import { AppNotificationsService } from '../../../../../../system';
import { CityMapComponent } from '../../../city-map/city-map.component';
import { LayerName, SelectedItemName } from "../../../../../../model";

@Component({
  selector: 'app-offstreet-zones-layer',
  templateUrl: './offstreet-zones-layer.component.html',
  styleUrls: ['./offstreet-zones-layer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OffstreetZonesLayerComponent extends LayerBaseComponent implements OnInit, OnDestroy {
  @Input() map: CityMapComponent;
  @Input() mapboxMap: Map;

  private _zones: FeatureCollection = { type: "FeatureCollection", features: [] };
  get zones(): FeatureCollection {
    return this._zones;
  }
  @Input() set zones(value: FeatureCollection | null) {
    this._zones = value || { type: "FeatureCollection", features: [] };
    if (!!this.mapboxMap) {
      this.highlightBuildings();
    }
  }

  buildingsFilter: Array<any> = ['all'];

  subscriptions = new Array<Subscription>();

  popupOpen = false;
  selectedZoneFeature!: Feature<Point, GeoJsonProperties> | null;
  offstreetZone$ = new BehaviorSubject<ISelectedOffstreetZone | null>(null);

  busy = true;

  layouts$ = new BehaviorSubject<ILayouts>({
    offstreetZones: {
      visibility: 'visible',
      'icon-image': 'point-garage',
      'icon-allow-overlap': true,
      'icon-size': {
        'base': 0.4,
        'stops': [
          [16, 0.6],
          [18, 0.8],
          [20, 1.4],
          [21, 1.6]
        ]
      },
      'text-font': [
        'Open Sans Regular'
      ],
      'text-offset': [0, 1.25],
      'text-anchor': 'top'
    }
  });

  paints: IPaints = {
    offstreetZones: {
      "text-color": "black"
    }
  };

  constructor(
    layersVisibility: LayersVisibilityService,
    mapState: MapStateService,
    private appNotifications: AppNotificationsService,
    private offstreetZonesService: OffstreetZonesService,
    private areasService: AreasService,
    private selectedItemsService: SelectedItemsService,
    private revenueService: RevenueService) {
    super(layersVisibility, mapState);
  }

  ngOnInit(): void {
    this.initVisibility(LayerName.OffstreetZones, false);

    this.subscriptions.push(
      this.mapState.selectedEntity$
        .subscribe(x => {
          if (x?.type === SelectedItemName.OffstreetZone) {
            this.selectZone(x?.entity);
          } else {
            this.selectedZoneFeature = null;
          }
        })
    );

    this.subscriptions.push(
      this.selectedItemsService.items$
        .subscribe(x => {
          this.offstreetZone$.next(x.offstreetZone?.item || null);
        })
    );

    this.subscriptions.push(
      this.layersVisibility.layers$
        .subscribe(x => {
          if (x['offstreet-zones']) {
            this.enableHiglighting();
          } else {
            this.disableHiglighting();
          }
        })
    );

    this.subscriptions.push(
      this.mapState.selectedEntityOnMap$
        .pipe(
          filter(x => x?.type === SelectedItemName.OffstreetZone),
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

  onZoneClick(evt: MapLayerMouseEvent) {
    const offstreetZone = <Feature<Point, GeoJsonProperties>>evt.features![0];
    this.mapState.selectEntity(SelectedItemName.OffstreetZone, offstreetZone);
  }

  private selectZone(offstreetZone: Feature<Point, GeoJsonProperties>) {
    const properties = offstreetZone.properties || {};
    const id = properties['id'];
    this.selectedZoneFeature = offstreetZone;

    this.selectedItemsService.loadItem(SelectedItemName.OffstreetZone, id, () => {
      this.busy = true;
      return zip(
        this.offstreetZonesService.get(id),
        this.revenueService.getRevenueByOffstreetZone(id)
      )
        .pipe(
          map(x => ({
            ...x[0],
            revenue: x[1]
          })),
          mergeMap(x => this.areasService.get(x.AreaId).pipe(map(res => [x, res]))),
          finalize(() => this.busy = false),
          map(res => {
            return {
              ...res[0],
              area: res[1]
            }
          })
        )
    })
      .subscribe(res => { });
  }

  private selectOnMap(x: ISelectedEntityOnMap): void {
    const feature = this.findFeatureById(this.zones, x?.id || 0)

    if (feature) {
      this.openPopupOnMap(feature, SelectedItemName.OffstreetZone, this.map);
    }

    if (!feature) {
      this.offstreetZonesService.get(x?.id || 0).subscribe((offstreetZone: IOffstreetZone) => {
        const position = offstreetZone ? offstreetZone.Position : null;

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
          this.mapState.selectEntity(SelectedItemName.OffstreetZone, point);
        }

      })
    }
  }

  private highlightBuildings() {
    const visibleBuildings = this.mapboxMap.queryRenderedFeatures(undefined, {
      layers: ['building-extrusion']
    });

    this.zones.features.forEach(async x => {
      if (x.geometry.type === 'Point') {
        const pt = [x.geometry.coordinates[0], x.geometry.coordinates[1]];

        visibleBuildings.forEach(f => {
          const poly = <Polygon>(f.geometry);

          if (turf.default(pt, poly)) {
            this.mapboxMap.setFeatureState({
              source: f.source,
              sourceLayer: f.sourceLayer,
              id: f.id || x.properties?.id
            }, {
              garage: true,
              garageId: x.properties?.id
            });
          }
        });
      }
    });
  }

  private enableHiglighting() {
    if (!this.mapboxMap) { return; }

    this.mapboxMap.setPaintProperty('building-extrusion', 'fill-extrusion-color', [
      'case',
      ['boolean', ['feature-state', 'garage'], false],
      'red',
      'hsl(210, 87%, 18%)'
    ]);
  }

  private disableHiglighting() {
    if (!this.mapboxMap) { return; }

    this.mapboxMap.setPaintProperty('building-extrusion', 'fill-extrusion-color', 'hsl(210, 87%, 18%)');
  }
}
