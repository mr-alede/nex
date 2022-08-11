import { AnyLayout, AnyPaint } from "mapbox-gl";
import { BehaviorSubject, Subscription } from "rxjs";

import { Feature, FeatureCollection, GeoJsonProperties, Geometry, Point } from "geojson";
import * as pointOnFeature from '@turf/point-on-feature'
import * as midpoint from '@turf/midpoint'

import { LayerName, SelectedItemName } from "../../../../model";
import { ILayersVisibility, LayersVisibilityService } from "../../services/layers-visibility.service";
import { CityMapComponent } from "../city-map/city-map.component";
import { MapStateService } from "../../services";

export interface ILayouts {
  [key: string]: AnyLayout;
}
export interface IPaints {
  [key: string]: AnyPaint;
}

export abstract class LayerBaseComponent {
  protected subscriptions = new Array<Subscription>();

  public abstract layouts$: BehaviorSubject<ILayouts>;
  public layers: ILayersVisibility;

  constructor(
    public layersVisibility: LayersVisibilityService,
    public mapState: MapStateService
  ) { }

  initVisibility(layerName: LayerName, visible: boolean = true): void {
    this.layersVisibility.registerLayer(layerName, visible);

    this.subscriptions.push(
      this.layersVisibility.layers$
        .subscribe(layers => {
          const visible = layers[layerName] || false;
          this.layers = layers;

          let current = { ...this.layouts$.value };
          let changed = false;
          Object.keys(current).forEach(name => {
            let visibility = visible ? 'visible' : 'none';
            changed = changed || current[name].visibility !== visibility;

            current[name] = {
              ...current[name],
              visibility: visible ? 'visible' : 'none'
            };
          });

          if (changed) {
            this.layouts$.next(current);
          }
        })
    );
  }

  layerMouseEnter() {
    this.layersVisibility.layerMouseEnter();
  }

  layerMouseLeave() {
    this.layersVisibility.layerMouseLeave();
  }

  protected findFeatureById(layer: FeatureCollection, id: number): Feature<Geometry, GeoJsonProperties> | null {
    return layer.features.find(f => (f.properties || {})['id'] === id) || null;
  }

  protected findCenterByFeature(feature: Feature<Geometry, GeoJsonProperties>, layerName: LayerName): Feature<Point, GeoJsonProperties> | null {
    this.checkAndTurnOnLayerVisibility(layerName);
    return this.findCenter(feature);
  }

  protected findCenter(feature: Feature<Geometry, GeoJsonProperties>): Feature<Point, GeoJsonProperties> | null {
    let centerPoint: Feature<Point, GeoJsonProperties> | null = null;

    if (feature && feature.geometry.type === 'Point') {
      centerPoint = <Feature<Point, GeoJsonProperties>>feature;
    }
    if (feature && feature.geometry.type === 'Polygon') {
      centerPoint = pointOnFeature.default(feature.geometry);
    }
    if (feature && feature.geometry.type === 'LineString') {
      centerPoint = midpoint.default(feature.geometry.coordinates[0], feature.geometry.coordinates[1]);
    }
    return centerPoint;
  }

  protected checkAndTurnOnLayerVisibility(layerName: LayerName) {
    if (!this.layersVisibility.isLayerVisible(layerName)) {
      this.layersVisibility.toggleLayer(layerName)
    }
  }

  protected openPopupOnMap(feature: Feature<Geometry, GeoJsonProperties>, itemName: SelectedItemName, map: CityMapComponent) {
    let center = this.findCenterByFeature(feature, LayerName.Meters)

    if (!!center && center.properties) {
      center.properties['id'] = feature?.properties?.id;
      center = { ...center };

      map.moveTo(center.geometry.coordinates[0], center.geometry.coordinates[1]);
      this.mapState.selectEntity(itemName, center);
    }
  }

  protected countPropInCluster(propName: string, propValue: string) {
    return ['+', ['match', ['get', propName], propValue, 1, 0]];
  }

  protected uniqueById(src: Array<Feature<Point, GeoJsonProperties>>): Array<Feature<Point, GeoJsonProperties>> {
    const map = new Map<string, Feature<Point, GeoJsonProperties>>();
    const result = new Array<Feature<Point, GeoJsonProperties>>();
    src.forEach(x => {
      let id: string = x?.properties?.id;
      if (!!id && !map.get(id)) {
        map.set(id, x);
        result.push(x);
      }
    });

    return result;
  }
}
