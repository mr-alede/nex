import { Component, Input, OnDestroy, OnInit } from '@angular/core';

import { BehaviorSubject, filter, finalize, map, mergeMap, Observable, of, zip } from "rxjs";
import { Feature, FeatureCollection, GeoJsonProperties, Point, Polygon } from "geojson";
import { MapLayerMouseEvent } from "mapbox-gl";

import {
  AreasProcessorService,
  EmptyAreasFeatureCollection,
  IAreaTypeNameById,
  ISelectedArea, ISelectedEntityOnMap,
  LayersVisibilityService,
  MapStateService,
  SelectedItemsService
} from '../../../../services';
import { ILayouts, IPaints, LayerBaseComponent } from '../../layer-base.component';
import { CityMapComponent } from "../../../city-map/city-map.component";
import { AreasService, IAreaPolygon, ZonesService, RevenueService } from "../../../../../../services";
import { LayerName, SelectedItemName } from "../../../../../../model";

@Component({
  selector: 'app-areas-layer',
  templateUrl: './areas-layer.component.html',
  styleUrls: ['./areas-layer.component.scss']
})
export class AreasLayerComponent extends LayerBaseComponent implements OnInit, OnDestroy {
  @Input() map: CityMapComponent;
  popupOpen = false;
  busy = false;

  // areas = "https://data.sfgov.org/resource/6vtc-mmhr.geojson";
  areas: FeatureCollection = EmptyAreasFeatureCollection;
  area$ = new BehaviorSubject<ISelectedArea | null>(null);
  selectedAreaGeo: Feature<Point, GeoJsonProperties> | null;
  areaTypes$: Observable<IAreaTypeNameById | null>;

  layouts$ = new BehaviorSubject<ILayouts>({
    areas: {
      visibility: 'visible'
    },
    areas_lables: {
      visibility: 'visible',
      'text-field': ['get', 'name'],
      'text-size': 14,
      'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold']
    }
  });

  paints: IPaints = {
    areas_lines: {
      "line-color": "white",
      "line-width": 2,
    },
    areas_fill: {
      "fill-color": "#8a61ba",
      "fill-opacity": 0.4
    },
    areas_lables: {
      "text-color": "white"
    }
  };

  constructor(layersVisibility: LayersVisibilityService,
    mapState: MapStateService,
    private selectedItemsService: SelectedItemsService,
    private areasService: AreasService,
    private areasProcessorService: AreasProcessorService,
    private areasProcessor: AreasProcessorService,
    private revenueService: RevenueService,
    private zonesService: ZonesService) {
    super(layersVisibility, mapState);
  }

  ngOnInit(): void {
    this.initVisibility(LayerName.Areas, false);
    this.areaTypes$ = this.areasProcessorService.getTypes();

    this.subscriptions.push(
      this.mapState.selectedEntity$
        .subscribe(x => {
          this.selectedAreaGeo = null;

          if (x?.type === 'area') {
            this.selectArea(x?.entity);
          }
        })
    );

    this.subscriptions.push(
      this.areasProcessor.area$
        .subscribe(x => {
          this.areas = x;
        })
    );

    this.subscriptions.push(
      this.selectedItemsService.items$
        .subscribe(x => {
          this.area$.next(x.area?.item || null);
        })
    );

    this.subscriptions.push(
      this.mapState.selectedEntityOnMap$
        .pipe(
          filter(x => x?.type === 'area')
        )
        .subscribe(x => {
          this.areasProcessorService.getTypes().subscribe((areaTypes) => {
            const currentLevel: number | undefined = (<any>this.areas).level;
            let entityLevel: number | null = x?.typeId && areaTypes ? areaTypes[x?.typeId].level : null;
            entityLevel = entityLevel === null ? x?.data?.level : entityLevel;

            if (x) {
              this.selectOnMap(x, currentLevel, entityLevel);
            }
          })
        })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(x => x.unsubscribe());
    this.subscriptions = [];
  }

  onAreaClick(evt: MapLayerMouseEvent) {
    const currentlevel: number | undefined = (<any>this.areas).level;
    const point: Feature<Point, GeoJsonProperties> = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [evt.lngLat.lng, evt.lngLat.lat]
      },
      properties: { ...evt.features![0].properties, level: currentlevel }
    };

    this.mapState.selectEntity(SelectedItemName.Area, point);
  }

  private selectArea(area: Feature<Point, GeoJsonProperties>) {
    const properties = area.properties || {};
    const areaId = properties['Id'] || properties['id'];

    this.selectedAreaGeo = { ...area };

    this.selectedItemsService.loadItem(SelectedItemName.Area, areaId, () => {
      this.busy = true;
      return zip(
        this.areasService.getArea(areaId),
        this.areasProcessor.getTypes(),
        this.zonesService.getAreaZoneNames(areaId)
      )
        .pipe(
          mergeMap((res) => {
            const area = res[0];
            return res[0]?.Id ? this.revenueService.getRevenueByArea(res[0].Id).pipe(map((revenue) => ({
              ...area,
              typeName: res[1][area.TypeId]?.name,
              typeLevel: res[1][area.TypeId]?.level,
              zoneNames: res[2],
              revenue: revenue
            }))) : of({
              ...area,
              typeName: res[1][area.TypeId]?.name,
              typeLevel: res[1][area.TypeId]?.level,
              zoneNames: res[2],
              revenue: null
            })
          }),
          map(res => {
            return {
              ...res,
              typeName: res.typeName,
              typeLevel: res.typeLevel,
              zoneNames: res.zoneNames,
              revenue: res.revenue
            }
          }),
          finalize(() => this.busy = false),
        )
    })
      .subscribe(res => { });
  }

  private selectOnMap(x: ISelectedEntityOnMap, currentLevel: number | undefined, entityLevel: number | null): void {
    const zoom = x.data?.zoom === true ? 12 : null;

    if (entityLevel !== null) {
      this.layers[LayerName.Areas] = true;
      this.layersVisibility.applyLayers(this.layers);
      this.areasProcessor.onLevelChanged(entityLevel);
      this.areasProcessor.changeSelectedAreaTypeLevel(entityLevel);
    }

    const feature = this.findFeatureById(this.areas, x?.id || 0)

    if (!!feature && currentLevel === entityLevel) {
      let center = this.findCenterByFeature(feature, LayerName.Areas)

      if (center && center.properties && feature.properties) {
        center.properties['id'] = x.id;
        center.properties['level'] = feature.properties.typeLevel;
        center = { ...center };

        this.map.moveTo(center.geometry.coordinates[0], center.geometry.coordinates[1], zoom);
        this.mapState.selectEntity(SelectedItemName.Area, center);
      }
    }

    if (!feature && entityLevel !== null) {
      this.areasService.getLevelPolygons(entityLevel).subscribe((areaPolygons: IAreaPolygon[]) => {
        const currentAreaPolygon: IAreaPolygon | undefined = areaPolygons.find((a) => a.Id === x.id)
        const positions = currentAreaPolygon ? currentAreaPolygon.Positions : null;

        const polygon: Feature<Polygon, GeoJsonProperties> = {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: positions ? [positions] : []
          },
          properties: { id: x.id, level: entityLevel, TypeId: currentAreaPolygon?.TypeId, Name: currentAreaPolygon?.Name }
        };

        const center = this.findCenter(polygon)

        if (center && center.properties && polygon.properties) {
          center.properties['id'] = polygon.properties['id']
          this.map.moveTo(center.geometry.coordinates[0], center.geometry.coordinates[1], zoom);
          this.mapState.selectEntity(SelectedItemName.Area, center)
        }

      })
    }
  }
}
