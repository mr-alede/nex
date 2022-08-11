import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from "@angular/core";

import { Feature, FeatureCollection, GeoJsonProperties, Point, Polygon } from "geojson";
import { MapLayerMouseEvent } from "mapbox-gl";

import { BehaviorSubject, mergeMap, of, Subscription, zip, tap } from 'rxjs';
import { filter, finalize, map } from 'rxjs/operators';

import { CityMapComponent } from "../../../city-map/city-map.component";
import {
  ISelectedEntityOnMap,
  ISelectedZone,
  LayersVisibilityService, MapStateService,
  SelectedItemsService
} from "../../../../services";
import { ILayouts, IPaints, LayerBaseComponent } from "../../layer-base.component";

import {
  AreasService,
  FrontendApiCamerasService,
  MetersService,
  SignsService,
  SpotsService,
  IZone, ZonesService,
  RevenueService
} from "../../../../../../services";

import { LayerName, SelectedItemName } from "../../../../../../model";

const ZONE_COLOR = '#106EBE';
const ZONE_OPACITY = 0.5;

@Component({
  selector: 'app-zones-layer',
  templateUrl: 'zones-layer.component.html',
  styleUrls: ['zones-layer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ZonesLayerComponent extends LayerBaseComponent implements OnInit, OnDestroy {
  @Input() map: CityMapComponent;

  subscriptions = new Array<Subscription>();

  popupOpen = false;
  selectedZonePoint!: Feature<Point, GeoJsonProperties> | null;
  zone$ = new BehaviorSubject<ISelectedZone | null>(null);

  busy = true;

  private _zones: FeatureCollection = { type: "FeatureCollection", features: [] };
  get zones(): FeatureCollection {
    return this._zones;
  }

  @Input() set zones(value: FeatureCollection | null) {
    this._zones = value || { type: "FeatureCollection", features: [] };
  }

  layouts$ = new BehaviorSubject<ILayouts>({
    zones: {
      visibility: 'none',
    }
  });

  paints: IPaints = {
    zonesCircle: {
      'circle-radius': {
        'base': 3,
        'stops': [
          [16, 4],
          [17, 8],
          [19, 20],
          [20, 40],
          [21, 60]
        ]
      },
      'circle-color': ZONE_COLOR,
      'circle-opacity': ZONE_OPACITY
    },
    zonesLine: {
      'line-color': ZONE_COLOR,
      "line-width": 10,
      'line-opacity': ZONE_OPACITY
    },
    zonesPolygon: {
      'fill-color': ZONE_COLOR,
      'fill-opacity': ZONE_OPACITY
    }
  };

  constructor(
    layersVisibility: LayersVisibilityService,
    mapState: MapStateService,
    private spotsService: SpotsService,
    private areasService: AreasService,
    private frontendApiCamerasService: FrontendApiCamerasService,
    private metersService: MetersService,
    private zoneService: ZonesService,
    private signsService: SignsService,
    private revenueService: RevenueService,
    private selectedItemsService: SelectedItemsService) {
    super(layersVisibility, mapState);
  }

  ngOnInit() {
    this.initVisibility(LayerName.Zones, false);

    this.subscriptions.push(
      this.mapState.selectedEntity$
        .subscribe(x => {
          this.selectedZonePoint = null;

          if (x?.type === 'zone') {
            this.selectZone(x?.entity);
          }
        })
    );

    this.subscriptions.push(
      this.selectedItemsService.items$
        .subscribe(x => {
          this.zone$.next(x.zone?.item || null);
        })
    );

    this.subscriptions.push(
      this.mapState.selectedEntityOnMap$
        .pipe(
          filter(x => x?.type === 'zone'),
        )
        .subscribe(x => {
          this.selectOnMap(<ISelectedEntityOnMap>x);
        })
    );
  }

  onZoneClick(evt: MapLayerMouseEvent) {
    const point: Feature<Point, GeoJsonProperties> = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [evt.lngLat.lng, evt.lngLat.lat]
      },
      properties: evt.features![0].properties
    }
    const prop = evt.features![0].properties || {};
    const propId = prop['Id'] || prop['id'];
    this.zoneService.get(propId).subscribe((next) => {
      console.log('zoneService get ', next);
    });
    this.mapState.selectEntity(SelectedItemName.Zone, point);
  }

  private selectZone(zone: Feature<Point, GeoJsonProperties>) {
    this.busy = true;
    const properties = zone.properties || {};
    const zoneId = properties['Id'] || properties['id'];

    this.selectedZonePoint = { ...zone };

    this.selectedItemsService.loadItem(SelectedItemName.Zone, zoneId, () => {
      return zip(
        this.zoneService.get(zoneId),
        this.spotsService.getZoneSpotsStates(zoneId),
        this.signsService.getZoneSigns(zoneId),
        this.metersService.getZoneMeterNames(zoneId)
      )
        .pipe(
          map(res => ({
            zone: res[0],
            spotsStates: res[1] ? res[1] : [],
            signsIds: res[2] ? res[2] : [],
            meterNames: res[3] ? res[3] : []
          })),
          mergeMap(res => zip(
            of(res),
            this.frontendApiCamerasService.getZoneCameras(res.spotsStates.map(v => v.SpotId || 0)),
            zone ? this.areasService.get(res.zone.AreaId) : of(null),
            res.zone ? this.revenueService.getRevenueByZone(res.zone.Id) : of(null)
          )),
          map(res => {
            return {
              ...res[0].zone,
              spotsStates: res[0].spotsStates,
              camerasIdsWithSpotIds: res[1] || [],
              signsIds: res[0].signsIds,
              metersNames: res[0].meterNames,
              area: res[2],
              revenue: res[3]
            }
          }),
          finalize(() => this.busy = false)
        )
    })
      .subscribe({
        complete: () => this.busy = false
      });
  }

  ngOnDestroy() {
    this.subscriptions.forEach(x => x.unsubscribe());
    this.subscriptions = [];
  }


  private selectOnMap(x: ISelectedEntityOnMap): void {
    const feature = this.findFeatureById(this._zones, x?.id || 0)
    this.checkAndTurnOnLayerVisibility(LayerName.Zones)

    if (!!feature) {
      this.openPopupOnMap(feature, SelectedItemName.Zone, this.map);
    }

    if (!feature) {
      this.zoneService.get(x?.id || 0).subscribe((zone: IZone) => {
        const position = zone ? zone['Positions'] : null;

        const zoneFeature: Feature<Polygon, GeoJsonProperties> = {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: position ? [position] : []
          },
          properties: {
            id: x.id,
            Name: zone.Name,
            AreaId: zone.AreaId,
          }
        };

        const centerOfZone = this.findCenter(zoneFeature);

        if (centerOfZone && centerOfZone.properties && zoneFeature.properties) {
          centerOfZone.properties['id'] = zoneFeature.properties['id'];
          this.map.moveTo(centerOfZone.geometry.coordinates[0], centerOfZone.geometry.coordinates[1]);
          this.mapState.selectEntity(SelectedItemName.Zone, centerOfZone);
        }
      })
    }
  }

}
