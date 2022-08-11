import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';

import {
  Point,
  FeatureCollection,
  Feature,
  GeoJsonProperties
} from 'geojson'
import { LngLatLike, MapLayerMouseEvent } from 'mapbox-gl';
import { BehaviorSubject, mergeMap, of, Subscription, zip } from 'rxjs';
import { filter, finalize, map } from "rxjs/operators";

import {
  ISelectedEntityOnMap,
  ISelectedSpot,
  LayersVisibilityService,
  MapStateService,
  SelectedItemsService
} from '../../../../services';

import { ILayouts, IPaints, LayerBaseComponent } from '../../layer-base.component';

import {
  AreasService,
  FrontendApiCamerasService,
  ISpot,
  MetersService,
  SignsService,
  SpotsService,
  ZonesService
} from "../../../../../../services";
import { CityMapComponent } from "../../../city-map/city-map.component";
import { LayerName, SelectedItemName } from "../../../../../../model";
import { GeoJSONSourceComponent } from 'ngx-mapbox-gl';

interface ISpotCar {
  vehicleId: number;
  parkingDate: string;
  realColor: string;
  realType: string;
  isLarge: boolean;
}

@Component({
  selector: 'app-spots-layer',
  templateUrl: './spots-layer.component.html',
  styleUrls: ['./spots-layer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpotsLayerComponent extends LayerBaseComponent implements OnInit, OnDestroy {
  @Input() map: CityMapComponent;
  @ViewChild('spotsSource') spotsSource: GeoJSONSourceComponent;

  subscriptions = new Array<Subscription>();

  busy = true;
  popupOpen = false;

  spot$ = new BehaviorSubject<ISelectedSpot | null>(null);
  selectedSpot!: Feature<Point, GeoJsonProperties> | null;

  clusterFeatures: Feature<Point, GeoJsonProperties>[] | null = null;
  clusterCenter: LngLatLike | undefined = undefined;

  private _spots: FeatureCollection = { type: "FeatureCollection", features: [] };
  get spots(): FeatureCollection {
    return this._spots;
  }

  @Input() set spots(value: FeatureCollection | null) {
    this._spots = value || { type: "FeatureCollection", features: [] };
  }

  layouts$ = new BehaviorSubject<ILayouts>({
    spots: {
      visibility: 'visible'
    },
    spotsLogos: {
      visibility: 'visible',
      'icon-image': [
        "match", ["get", "companyName"],
        'Aramark', "aramac",
        'FedEx', "fedex",
        'UPS', "ups",
        'USPS', "usps",
        'Amazon', "amazon",
        'OnTrac', "ontrac",
        ''
      ],
      'icon-allow-overlap': true,
      'icon-size': {
        'base': 0.2,
        'stops': [
          [16, 0.4],
          [18, 0.6],
          [20, 1.0],
          [21, 1.6]
        ]
      },
      'icon-offset': [15, -10]
    }
  });

  paints: IPaints = {
    spots: {
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
      'circle-color': [
        'match', ['get', 'status'],
        'Vacant', '#00B62D',
        'Occupied', 'red',
        'Booked', '#cccc00',
        /* other */ '#262626'
      ],
      'circle-opacity': 0.3
    },
    spotsPoints: {
      'circle-radius': {
        'base': 1,
        'stops': [
          [12, 1.1],
          [22, 4]
        ]
      },
      'circle-color': [
        'match', ['get', 'Status'],
        'free', '#204E00',
        'Free', '#204E00',
        'booked', '#FEFF00',
        'Booked', '#FEFF00',
        'busy', '#DE4006',
        'Busy', '#DE4006',
        /* other */ '#262626'
      ],
      'circle-opacity': 0.3
    },
    spotsLogos: {
      "text-color": 'black'
    }
  };

  constructor(
    private cdRef: ChangeDetectorRef,
    layersVisibility: LayersVisibilityService,
    mapState: MapStateService,
    private selectedItemsService: SelectedItemsService,
    private spotsService: SpotsService,
    private signsService: SignsService,
    private zonesService: ZonesService,
    private areasService: AreasService,
    private metersService: MetersService,
    private frontendApiCamerasService: FrontendApiCamerasService) {
    super(layersVisibility, mapState);
  }

  ngOnInit(): void {
    this.initVisibility(LayerName.Spots, true);

    this.subscriptions.push(
      this.mapState.selectedEntity$
        .subscribe(x => {
          this.selectedSpot = null;

          if (x?.type === 'spot') {
            this.selectSpot(x.entity)
          }
        })
    );

    this.subscriptions.push(
      this.selectedItemsService.items$
        .subscribe(x => {
          this.spot$.next(x.spot?.item || null);
        })
    );

    this.subscriptions.push(
      this.mapState.selectedEntityOnMap$
        .pipe(
          filter(x => x?.type === 'spot'),
        )
        .subscribe(x => {
          this.selectOnMap(<ISelectedEntityOnMap>x)
        })
    );
  }

  private selectSpot(spot: any) {
    this.busy = true;
    const properties = spot.properties || {};
    this.selectedSpot = spot;
    const spotId = properties['id'] || properties['Id'];

    this.selectedItemsService.loadItem(SelectedItemName.Spot, spotId, () => {
      return zip(
        this.spotsService.get(spotId),
        this.frontendApiCamerasService.getCameraBySpotsIds([spotId]),
        this.signsService.getSpotSignsId([spotId]),
        this.spotsService.getSpotRegulation(spotId),
        this.spotsService.getSpotState(spotId),
        this.metersService.getSpotMeterNames(spotId),
      )
        .pipe(
          mergeMap(res => {
            return res[2] && res[2][0] ? this.signsService.getSignState(res[2][0]).pipe(map(s => ({
              spot: res[0],
              cameraIdWithSpots: res[1],
              signId: res[2],
              regulation: res[3],
              spotsStates: res[4] || [],
              metersNames: res[5] || [],
              signState: s,
            }))) : of({
              spot: res[0],
              cameraIdWithSpots: res[1],
              signId: res[2],
              regulation: res[3],
              spotsStates: res[4] || [],
              metersNames: res[5] || [],
              signState: null,
            })
          })).pipe((
            mergeMap(res => {
              return !!res.cameraIdWithSpots && !!res.cameraIdWithSpots[0]
                ? zip(
                  this.frontendApiCamerasService.get(res.cameraIdWithSpots[0].CameraId),
                  this.frontendApiCamerasService.getCameraState(res.cameraIdWithSpots[0].CameraId)
                ).pipe(map(res => ({
                  camera: res[0],
                  cameraState: res.length > 1 ? res[1] : null
                })))
                  .pipe(map(y => ({
                    ...res,
                    camera: y.camera,
                    cameraState: y.cameraState
                  })))
                : of({
                  ...res,
                  camera: null,
                  cameraState: null
                })
            }))).pipe((
              mergeMap(res => {
                return !!res.spot && !!res.spot.ZoneId ?
                  this.zonesService.get(res.spot.ZoneId).pipe(map(z => ({
                    ...res,
                    zone: z
                  }))) : of({
                    ...res,
                    zone: null,
                  })
              })),
              mergeMap(res => {
                return !!res.zone && !!res.zone.AreaId ?
                  this.areasService.get(res.zone.AreaId).pipe(map(area => ({
                    ...res,
                    area: area,
                  }))) : of({ ...res, area: null })
              }),
              map(res => {
                return {
                  ...res.spot,
                  cameraIdWithSpots: res.cameraIdWithSpots,
                  signState: res.signState,
                  camera: res.camera,
                  zone: res.zone,
                  regulation: res.regulation,
                  area: res.area,
                  spotsStates: res.spotsStates,
                  metersNames: res.metersNames,
                  cameraState: res.cameraState
                }
              }), finalize(() => this.busy = false),
            )
    })
      .subscribe(() => {
        this.busy = false;
      });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(x => x.unsubscribe());
    this.subscriptions = [];
  }

  onSpotClick(evt: MapLayerMouseEvent) {
    const spotsSrc = <Array<Feature<Point, GeoJsonProperties>>>evt.features;
    const spots = this.uniqueById(spotsSrc);

    // if (spots.length > 1) {
    //   this.clusterFeatures = spots;
    //   this.clusterCenter = <LngLatLike>spots[0].geometry.coordinates;
    // } else {
      this.mapState.selectEntity(SelectedItemName.Spot, spots[0]);
    // }
  }

  onClusterItemClick(feature: Feature<Point, GeoJsonProperties>) {
    this.clusterFeatures = null;
    this.clusterCenter = undefined;
    this.mapState.selectEntity(SelectedItemName.Spot, feature);
  }

  private selectOnMap(x: ISelectedEntityOnMap): void {
    const feature = this.findFeatureById(this._spots, x?.id || 0)

    if (!!feature) {
      this.openPopupOnMap(feature, SelectedItemName.Spot, this.map);
    }

    if (!feature) {
      this.spotsService.get(x?.id || 0).subscribe((spot: ISpot) => {

        const position = spot ? spot.Position : null;

        const spotPoint: Feature<Point, GeoJsonProperties> = {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: position ? [position[0], position[1]] : []
          },
          properties: { ...spot }
        };

        if (spotPoint) {
          this.checkAndTurnOnLayerVisibility(LayerName.Spots);
          this.map.moveTo(spotPoint.geometry.coordinates[0], spotPoint.geometry.coordinates[1]);
          this.mapState.selectEntity(SelectedItemName.Spot, spotPoint);
        }
      });
    }
  }
}

