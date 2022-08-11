import { Injectable } from "@angular/core";

import { BehaviorSubject, Observable, of, tap, catchError, zip, map } from "rxjs";
import { FeatureCollection, Feature, GeoJsonProperties, Geometry, Position } from 'geojson';

import { AppNotificationsService } from "../../../system";
import { ITile, LayerName, RevenueType, TilesBoundingBox } from "../../../model";
import {
  AppStateService,
  GeoIndexesService,
  IEntityBase,
  IGeoEntityBase,
  IZoneGeo
} from "../../../services";

export const EmptyFeatureCollection: FeatureCollection = { type: "FeatureCollection", features: [] };

interface IFeaturesByY<T> {
  [y: number]: { data: Array<T>, expiresAt: Date };
}
interface IFeaturesByX {
  [x: number]: IFeaturesByY<any>;
}
interface IFeaturesByZ {
  [z: number]: IFeaturesByX;
}
interface IFeaturesByItem {
  [item: string]: IFeaturesByZ;
}
interface IFeaturesByCity {
  [city: string]: IFeaturesByItem;
}

const EXPIRATION_SECS = 0;

export interface IMapLayersSource {
  meters: FeatureCollection;
  cameras: FeatureCollection;
  signs: FeatureCollection;
  spots: FeatureCollection;
  zones: FeatureCollection;
  offstreetZones: FeatureCollection;
  metersRevenue: FeatureCollection;
}

@Injectable()
export class GeoProcessorService {
  private _cache: IFeaturesByCity = {};

  private _meters$ = new BehaviorSubject<FeatureCollection>(EmptyFeatureCollection);
  private _cameras$ = new BehaviorSubject<FeatureCollection>(EmptyFeatureCollection);
  private _signs$ = new BehaviorSubject<FeatureCollection>(EmptyFeatureCollection);
  private _spots$ = new BehaviorSubject<FeatureCollection>(EmptyFeatureCollection);
  private _zones$ = new BehaviorSubject<FeatureCollection>(EmptyFeatureCollection);
  private _offstreetZones$ = new BehaviorSubject<FeatureCollection>(EmptyFeatureCollection);
  private _metersRevenue$ = new BehaviorSubject<FeatureCollection>(EmptyFeatureCollection);

  public get meters$(): Observable<FeatureCollection> {
    return this._meters$.asObservable();
  }
  public get cameras$(): Observable<FeatureCollection> {
    return this._cameras$.asObservable();
  }
  public get signs$(): Observable<FeatureCollection> {
    return this._signs$.asObservable();
  }
  public get spots$(): Observable<FeatureCollection> {
    return this._spots$.asObservable();
  }
  public get zones$(): Observable<FeatureCollection> {
    return this._zones$.asObservable();
  }
  public get offstreetZones$(): Observable<FeatureCollection> {
    return this._offstreetZones$.asObservable();
  }
  public get metersRevenue$(): Observable<FeatureCollection> {
    return this._metersRevenue$.asObservable();
  }

  constructor(
    private appNotifications: AppNotificationsService,
    private appState: AppStateService,
    private geoIndexes: GeoIndexesService
  ) { }

  public loadMeters(box: TilesBoundingBox, zoom: number): Observable<FeatureCollection> {
    const tiles = box.getTiles();
    const tasks = tiles.map(tile => this.loadItems(LayerName.Meters, tile, zoom, () => this.geoIndexes.getMeters(tile.x, tile.y, zoom)));
    return zip(tasks)
      .pipe(
        map(x => this.mapPoints(x, (f) => ({
          id: f.Id,
          status: f.Status,
          policy: f.PolicyType
        }))),
        tap(res => this._meters$.next(res))
      );
  }

  public loadCameras(box: TilesBoundingBox, zoom: number): Observable<FeatureCollection> {
    const tiles = box.getTiles();
    const tasks = tiles.map(tile => this.loadItems(LayerName.Cameras, tile, zoom, () => this.geoIndexes.getCameras(tile.x, tile.y, zoom)));
    return zip(tasks)
      .pipe(
        map(x => this.mapPoints(x)),
        tap(res => this._cameras$.next(res))
      );
  }

  public loadSigns(box: TilesBoundingBox, zoom: number): Observable<FeatureCollection> {
    const tiles = box.getTiles();
    const tasks = tiles.map(tile => this.loadItems(LayerName.Signs, tile, zoom, () => this.geoIndexes.getSigns(tile.x, tile.y, zoom)));
    return zip(tasks)
      .pipe(
        map(x => this.mapPoints(x)),
        tap(res => this._signs$.next(res))
      );
  }

  public loadSpots(box: TilesBoundingBox, zoom: number): Observable<FeatureCollection> {
    const tiles = box.getTiles();
    const tasks = tiles.map(tile => this.loadItems(LayerName.Spots, tile, zoom, () => this.geoIndexes.getSpots(tile.x, tile.y, zoom)));
    return zip(tasks)
      .pipe(
        map(x => this.mapPoints(x, f => ({
          id: f.Id,
          status: f.Status,
          policyType: f.PolicyType,
          companyName: f.CompanyName
        }))),
        tap(res => this._spots$.next(res))
      );
  }

  public loadZones(box: TilesBoundingBox, zoom: number): Observable<FeatureCollection> {
    const tiles = box.getTiles();
    const tasks = tiles.map(tile => this.loadItems(LayerName.Zones, tile, zoom, () => this.geoIndexes.getZones(tile.x, tile.y, zoom)));
    return zip(tasks)
      .pipe(
        map(x => this.mapZonesGeometry(x)),
        tap(res => this._zones$.next(res))
      );
  }

  public loadOffstreetZones(box: TilesBoundingBox, zoom: number): Observable<FeatureCollection> {
    const tiles = box.getTiles();
    const tasks = tiles.map(tile => this.loadItems(LayerName.OffstreetZones, tile, zoom, () => this.geoIndexes.getOffstreetZones(tile.x, tile.y, zoom)));
    return zip(tasks)
      .pipe(
        map(x => this.mapPoints(x)),
        tap(res => this._offstreetZones$.next(res))
      );
  }

  public loadMetersRevenue(box: TilesBoundingBox, zoom: number, period: RevenueType): Observable<FeatureCollection> {
    const tiles = box.getTiles();
    const tasks = tiles.map(tile => this.geoIndexes.getMetersRevenue(tile.x, tile.y, zoom, period));
    return zip(tasks)
      .pipe(
        map(x => this.mapPoints(x, (f) => ({
          id: f.Id,
          status: f.Status,
          type: f.Type,
          revenue: f.Revenue || 0
        }))),
        tap(res => this._metersRevenue$.next(res))
      );
  }

  private loadItems<T extends IEntityBase>(itemName: LayerName, tile: ITile, zoom: number,
    loader: () => Observable<Array<T>>): Observable<Array<T>> {
    if (EXPIRATION_SECS === 0) {
      return loader()
        .pipe(
          catchError(err => {
            return of([]);
          })
        );
    }

    const cityCode = this.appState.currentCity?.Code || '';
    let cityLevel = this._cache[cityCode];
    if (!cityLevel) {
      cityLevel = this._cache[cityCode] = {};
    }

    let itemLevel = cityLevel[itemName];
    if (!itemLevel) {
      itemLevel = cityLevel[itemName] = {};
    }

    let zoomLevel = itemLevel[zoom];
    if (!zoomLevel) {
      zoomLevel = itemLevel[zoom] = {};
    }

    let xLevel = zoomLevel[tile.x];
    if (!xLevel) {
      xLevel = zoomLevel[tile.x] = {};
    }

    let yLevel = xLevel[tile.y];
    if (!!yLevel && new Date() <= yLevel.expiresAt) {
      return of(yLevel.data);
    }

    return loader()
      .pipe(
        tap(items => {
          xLevel[tile.y] = { data: items, expiresAt: this.getExpirationDate() };
        }),
        catchError(err => {
          return of([]);
        })
      );
  }

  private mapPoints<TEntityStatus, T extends IGeoEntityBase<Position, TEntityStatus>>(
    itemsArrays: T[][],
    propertiesFactory: (f: T) => GeoJsonProperties = (f) => ({
      id: f.Id,
      status: f.Status
    }),
    geometryFactory: (f: T) => Geometry = (f) => ({
      type: 'Point',
      coordinates: f.Position
    })): FeatureCollection {

    const items = itemsArrays.reduce((a, b) => a.concat(b));

    const features: Array<Feature<Geometry, GeoJsonProperties>> = items.map(f => {
      return {
        type: 'Feature',
        geometry: geometryFactory(f),
        properties: propertiesFactory(f)
      };
    });

    return {
      type: "FeatureCollection",
      features: features
    };
  }

  private mapLines<TEntityStatus, T extends IGeoEntityBase<Array<Position>, TEntityStatus>>(
    itemsArrays: T[][],
    propertiesFactory: (f: T) => GeoJsonProperties = (f) => ({
      id: f.Id,
      status: f.Status
    }),
    geometryFactory: (f: T) => Geometry = (f) => ({
      type: 'MultiPoint',
      coordinates: f.Position
    })): FeatureCollection {

    const items = itemsArrays.reduce((a, b) => a.concat(b));

    const features: Array<Feature<Geometry, GeoJsonProperties>> = items.map(f => {
      return {
        type: 'Feature',
        geometry: geometryFactory(f),
        properties: propertiesFactory(f)
      };
    });

    return {
      type: "FeatureCollection",
      features: features
    };
  }

  private mapMultiGeometry<TEntityStatus, T extends IGeoEntityBase<Array<Position>, TEntityStatus>>(
    itemsArrays: T[][],
    propertiesFactory: (f: T) => GeoJsonProperties = (f) => ({
      id: f.Id,
      status: f.Status
    }),
    geometryFactory: (f: T) => Geometry = (f) => {
      if (f.Position.length === 1) {
        return {
          type: 'Point',
          coordinates: f.Position[0]
        };
      }

      if (f.Position.length > 1
        && f.Position[0][0] === f.Position[f.Position.length - 1][0] && f.Position[0][1] === f.Position[f.Position.length - 1][1]) {
        return {
          type: 'Polygon',
          coordinates: [f.Position]
        };
      }

      return {
        type: 'LineString',
        coordinates: f.Position
      };
    }): FeatureCollection {

    const items = itemsArrays.reduce((a, b) => a.concat(b));

    const features: Array<Feature<Geometry, GeoJsonProperties>> = items.map(f => {
      return {
        type: 'Feature',
        geometry: geometryFactory(f),
        properties: propertiesFactory(f)
      };
    });

    return {
      type: "FeatureCollection",
      features: features
    };
  }

  private mapZonesGeometry<T extends IZoneGeo>(
    itemsArrays: T[][],
    propertiesFactory: (f: T) => GeoJsonProperties = (f) => ({
      id: f.Id
    }),
    geometryFactory: (f: T) => Geometry = (f) => {
      if (f.Positions.length === 1) {
        return {
          type: 'Point',
          coordinates: f.Positions[0]
        };
      }

      return {
        type: 'LineString',
        coordinates: f.Positions
      };
    }): FeatureCollection {

    const items = itemsArrays.reduce((a, b) => a.concat(b));

    const features: Array<Feature<Geometry, GeoJsonProperties>> = items.map(f => {
      return {
        type: 'Feature',
        geometry: geometryFactory(f),
        properties: propertiesFactory(f)
      };
    });

    return {
      type: "FeatureCollection",
      features: features
    };
  }

  private getExpirationDate(): Date {
    return new Date(new Date().getTime() + EXPIRATION_SECS * 1000);
  }
}

