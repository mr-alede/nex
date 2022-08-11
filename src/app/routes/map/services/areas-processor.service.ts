import { Injectable } from "@angular/core";

import { BehaviorSubject, Observable, of, tap, zip, map } from 'rxjs';
import { FeatureCollection, Feature, GeoJsonProperties, Polygon } from 'geojson';

import { AppNotificationsService } from "../../../system";

import { AreasService, IAreaType, ICity } from "../../../services";

export interface IAreaTypeNameById {
  [id: number]: { level: number, name: string, pluralName: string };
}

export const EmptyAreasFeatureCollection: FeatureCollection = { type: "FeatureCollection", features: [] };

export const AREA_LEVEL_NONE = {
  id: -1,
  name: 'None',
  level: -1,
  layers: []
};

@Injectable()
export class AreasProcessorService {
  private _areaTypes: IAreaTypeNameById | null = null;

  private _area$ = new BehaviorSubject<FeatureCollection>(EmptyAreasFeatureCollection);
  private _busy$ = new BehaviorSubject<boolean>(false);
  private _selectedAreaTypeLevel$ = new BehaviorSubject<number>(AREA_LEVEL_NONE.id);

  public get area$(): Observable<FeatureCollection> {
    return this._area$.asObservable();
  }

  public get busy$(): Observable<boolean> {
    return this._busy$.asObservable();
  }

  public get selectedAreaTypeLevel$(): Observable<number> {
    return this._selectedAreaTypeLevel$.asObservable();
  }

  constructor(
    private appNotifications: AppNotificationsService,
    private areasService: AreasService
  ) {
  }

  onCityChanged(city: ICity | null) {
    this._areaTypes = null;
  }

  onLevelChanged(level: number | undefined | null) {
    if (level !== undefined && level !== null && level > -1) {
      this.loadLevel(level)
        .subscribe(res => { });
    } else {
      this._area$.next(EmptyAreasFeatureCollection);
      this._selectedAreaTypeLevel$.next(AREA_LEVEL_NONE.id);
    }
  }

  loadLevel(level: number): Observable<FeatureCollection> {
    this._busy$.next(true);
    return zip(
      this.areasService.getLevelPolygons(level),
      this.getTypes()
    )
      .pipe(
        map(res => {
          const features: Array<Feature<Polygon, GeoJsonProperties>> = res[0].map(f => {
            return {
              type: 'Feature',
              geometry: {
                type: 'Polygon',
                coordinates: [f.Positions],
              },
              properties: {
                id: f.Id,
                typeId: f.TypeId,
                name: f.Name,
                typeName: res[1][f.TypeId]?.name,
                typeLevel: res[1][f.TypeId]?.level,
              }
            };
          });

          const result: any = {
            level: level,
            type: "FeatureCollection",
            features: features
          };

          return result;
        }),
        tap((x: { level: number, type: any, features: Array<Feature> }) => {
          this._area$.next(x);
          this._busy$.next(false);
          this._selectedAreaTypeLevel$.next(x.level);
        })
      );
  }

  getTypes(): Observable<IAreaTypeNameById> {
    if (this._areaTypes !== null) {
      return of(this._areaTypes);
    }

    return this.areasService.getAllTypes()
      .pipe(
        map(x => this.getAreaTypes(x)),
        tap(res => this._areaTypes = res)
      );
  }

  setTypes(areaTypes: Array<IAreaType>) {
    this._areaTypes = this.getAreaTypes(areaTypes);
  }

  changeSelectedAreaTypeLevel(level: number) {
    this._selectedAreaTypeLevel$.next(level);
  }

  private getAreaTypes(areaTypes: Array<IAreaType>): IAreaTypeNameById {
    let result: IAreaTypeNameById = {};

    areaTypes.forEach(t => {
      result[t.Id] = { level: t.Level, name: t.Name, pluralName: t.PluralName };

      if (t.Descendants && t.Descendants.length > 0) {
        result = { ...result, ...this.getAreaTypes(t.Descendants) };
      }
    });

    return result;
  }
}

