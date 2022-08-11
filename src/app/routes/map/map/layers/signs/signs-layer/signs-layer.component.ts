import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';

import { MapLayerMouseEvent } from 'mapbox-gl';

import { BehaviorSubject, Subscription, zip } from 'rxjs';
import { filter, finalize, map } from 'rxjs/operators';

import {
  Point,
  FeatureCollection,
  Feature,
  GeoJsonProperties
} from 'geojson'

import {
  ISelectedEntityOnMap,
  ISelectedSign,
  LayersVisibilityService,
  MapStateService,
  SelectedItemsService,
} from '../../../../services';
import { ILayouts, IPaints, LayerBaseComponent } from '../../layer-base.component';

import {
  ISign,
  SignsService
} from '../../../../../../services';

import { AppNotificationsService } from '../../../../../../system';
import { CityMapComponent } from '../../../city-map/city-map.component';
import { LayerName, SelectedItemName } from "../../../../../../model";

@Component({
  selector: 'app-signs-layer',
  templateUrl: './signs-layer.component.html',
  styleUrls: ['./signs-layer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignsLayerComponent extends LayerBaseComponent implements OnInit, OnDestroy {
  @Input() map: CityMapComponent;

  subscriptions = new Array<Subscription>();

  popupOpen = false;
  selectedSignFeature!: Feature<Point, GeoJsonProperties> | null;
  sign$ = new BehaviorSubject<ISelectedSign | null>(null);

  busy = true;

  private _signs: FeatureCollection = { type: "FeatureCollection", features: [] };
  get signs(): FeatureCollection {
    return this._signs;
  }
  @Input() set signs(value: FeatureCollection | null) {
    this._signs = value || { type: "FeatureCollection", features: [] };
  }

  layouts$ = new BehaviorSubject<ILayouts>({
    signs: {
      visibility: 'none',
      'icon-image': [
        "match", ["get", "status"],
        'Offline', "point-sign-offline",
        'Inactive', "point-sign-inactive",
        'Active', "point-sign-active",
        'point-sign-offline'
      ],
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
    }
  });

  paints: IPaints = {
    signs: {
      "text-color": "#fff",
      "text-halo-color": "#106EBE",
      "text-halo-width": 20
    }
  };

  constructor(
    layersVisibility: LayersVisibilityService,
    mapState: MapStateService,
    private appNotifications: AppNotificationsService,
    private signsService: SignsService,
    private selectedItemsService: SelectedItemsService) {
    super(layersVisibility, mapState);
  }

  ngOnInit(): void {
    this.initVisibility(LayerName.Signs, false);

    this.subscriptions.push(
      this.mapState.selectedEntity$
        .subscribe(x => {
          if (x?.type === 'sign') {
            this.selectSign(x?.entity);
          } else {
            this.selectedSignFeature = null;
          }
        })
    );

    this.subscriptions.push(
      this.selectedItemsService.items$
        .subscribe(x => {
          this.sign$.next(x.sign?.item || null);
        })
    );

    this.subscriptions.push(
      this.mapState.selectedEntityOnMap$
        .pipe(
          filter(x => x?.type === 'sign'),
        )
        .subscribe(x => {
          this.selectOnMap(<ISelectedEntityOnMap>x)
        })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(x => x.unsubscribe());
    this.subscriptions = [];
  }

  onSignClick(evt: MapLayerMouseEvent) {
    const sign = <Feature<Point, GeoJsonProperties>>evt.features![0];
    this.mapState.selectEntity(SelectedItemName.Sign, sign);
  }

  private selectSign(sign: Feature<Point, GeoJsonProperties>) {
    const properties = sign.properties || {};
    const id = properties['id'];
    this.selectedSignFeature = sign;

    this.selectedItemsService.loadItem(SelectedItemName.Sign, id, () => {
      this.busy = true;
      return zip(
        this.signsService.get(id),
        this.signsService.getSignState(id)
      )
        .pipe(
          finalize(() => this.busy = false),
          map(res => {
            return {
              ...res[0], ...{ state: res[1] }
            }
          })
        )
    })
      .subscribe(res => { });
  }

  private selectOnMap(x: ISelectedEntityOnMap): void {
    const feature = this.findFeatureById(this._signs, x?.id || 0)
    if (!!feature) {
      this.openPopupOnMap(feature, SelectedItemName.Sign, this.map);
    }
    if (!feature) {
      this.signsService.get(x?.id || 0).subscribe((sign: ISign) => {

        const position = sign ? sign.Position : null;

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
          this.mapState.selectEntity(SelectedItemName.Sign, point);
        }

      })
    }
  }
}
