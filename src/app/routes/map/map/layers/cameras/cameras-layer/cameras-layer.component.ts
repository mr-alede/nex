import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';

import {
  Point,
  FeatureCollection,
  Feature,
  GeoJsonProperties
} from 'geojson'

import { MapLayerMouseEvent } from 'mapbox-gl';
import { BehaviorSubject, filter, finalize, map, Subscription, zip } from 'rxjs';

import { FrontendApiCamerasService, ICamera } from '../../../../../../services';

import {
  ISelectedCamera, ISelectedEntityOnMap,
  LayersVisibilityService,
  MapStateService,
  SelectedItemsService
} from '../../../../services';
import { CityMapComponent } from '../../../city-map/city-map.component';
import { ILayouts, IPaints, LayerBaseComponent } from '../../layer-base.component';
import { LayerName, SelectedItemName } from '../../../../../../model';

@Component({
  selector: 'app-cameras-layer',
  templateUrl: './cameras-layer.component.html',
  styleUrls: ['./cameras-layer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CamerasLayerComponent extends LayerBaseComponent implements OnInit, OnDestroy {
  @Input() map: CityMapComponent;

  subscriptions = new Array<Subscription>();

  popupOpen = false;
  selectedCameraFeature!: Feature<Point, GeoJsonProperties> | null;
  camera$ = new BehaviorSubject<ISelectedCamera | null>(null);

  busy = true;

  private _cameras: FeatureCollection = { type: "FeatureCollection", features: [] };
  get cameras(): FeatureCollection {
    return this._cameras;
  }
  @Input() set cameras(value: FeatureCollection | null) {
    this._cameras = value || { type: "FeatureCollection", features: [] };
  }

  layouts$ = new BehaviorSubject<ILayouts>({
    cameras: {
      visibility: 'visible',
      'icon-image': [
        "match", ["get", "status"],
        'Offline', "point-camera-offline",
        'Inactive', "point-camera-inactive",
        'Active', "point-camera-active",
        'point-camera-offline'
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
      'text-font': [
        'Open Sans Regular'
      ],
      'text-offset': [0, 1.25],
      'text-anchor': 'top'
    }
  });


  paints: IPaints = {
    cameras: {
      "text-color": "black"
    }
  };

  constructor(
    layersVisibility: LayersVisibilityService,
    mapState: MapStateService,
    private camerasService: FrontendApiCamerasService,
    private selectedItemsService: SelectedItemsService,
  ) {
    super(layersVisibility, mapState);
  }

  ngOnInit(): void {
    this.initVisibility(LayerName.Cameras, true);

    this.subscriptions.push(
      this.mapState.selectedEntity$
        .subscribe(x => {
          if (x?.type === 'camera') {
            this.selectCamera(x?.entity);
          } else {
            this.selectedCameraFeature = null;
          }
        })
    );

    this.subscriptions.push(
      this.selectedItemsService.items$
        .subscribe(x => {
          this.camera$.next(x.camera?.item || null);
        })
    );

    this.subscriptions.push(
      this.mapState.selectedEntityOnMap$
        .pipe(
          filter(x => x?.type === 'camera'),
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

  onCameraClick(evt: MapLayerMouseEvent) {
    const camera = <Feature<Point, GeoJsonProperties>>evt.features![0];
    this.mapState.selectEntity(SelectedItemName.Camera, camera);
  }

  private selectCamera(camera: Feature<Point, GeoJsonProperties>) {
    const properties = camera.properties || {};
    const id = properties['id'] || properties['Id'];
    this.selectedCameraFeature = camera;

    this.selectedItemsService.loadItem(SelectedItemName.Camera, id, () => {
      this.busy = true;
      return zip(
        this.camerasService.get(id),
        this.camerasService.getCameraState(id),
        this.camerasService.getCameraEvents(id)
      )
        .pipe(
          map(res => ({
            camera: res[0],
            cameraState: res[1],
            cameraEvents: res[2]
          })),
          finalize(() => this.busy = false),
          map(res => ({
            ...res.camera,
            state: res.cameraState,
            events: res.cameraEvents
          }))
        )
    })
      .subscribe(res => { });
  }

  private selectOnMap(x: ISelectedEntityOnMap): void {
    const feature = this.findFeatureById(this._cameras, x?.id || 0)
    if (!!feature) {
      this.openPopupOnMap(feature, SelectedItemName.Camera, this.map);
    }
    if (!feature) {
      this.camerasService.get(x?.id || 0).subscribe((camera: ICamera) => {

        const position = camera ? camera.Position : null;

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
          this.mapState.selectEntity(SelectedItemName.Camera, point);
        }
      })
    }
  }

}
