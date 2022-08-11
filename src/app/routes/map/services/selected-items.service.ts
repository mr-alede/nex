import { Injectable } from "@angular/core";

import { BehaviorSubject, Observable, of, tap, catchError } from "rxjs";

import { AppNotificationsService } from "../../../system";
import {
  IMeter,
  ICamera,
  IEntityBase,
  ISign,
  IMeterName,
  ISignState,
  ICameraState, ISpot, ICameraWithSpots, ISpotRegulation, IArea, IOffstreetZone, ISpotState, ITransaction, ICameraEvent
} from "../../../services";
import { IRevenueItem, IZone, IZoneName } from "../../../services/services/frontend-api/zones.service";

export enum SelectedItemName {
  Meter = 'meter',
  Camera = 'camera',
  Sign = 'sign',
  Zone = 'zone',
  Spot = 'spot',
  Area = 'area',
  OffstreetZone = 'offstreetZone'
};

export interface ISelectedItem<T> {
  item: T;
  details: any | null;
}

export interface ISelectedZone extends IZone {
  spotsStates: Array<ISpotState>,
  camerasIdsWithSpotIds: Array<ICameraWithSpots>,
  signsIds: Array<number>,
  metersNames: Array<IMeterName>;
  area: IArea,
  revenue: IRevenueItem[]
}

export interface ISelectedSpot extends ISpot {
  cameraIdWithSpots: ICameraWithSpots;
  signIds: number[];
  signState: ISignState | null;
  camera: ICamera | null;
  zone: IZone | null;
  area: IArea | null;
  regulation: ISpotRegulation | null;
  metersNames: IMeterName[];
  spotsStates: ISpotState[];
  cameraState: ICameraState | null;
}

export interface ISelectedSign extends ISign {
  state: ISignState | null;
}

export interface ISelectedCamera extends ICamera {
  state: ICameraState | null;
  events: ICameraEvent[];
}

export interface ISelectedArea extends IArea {
  typeName: string;
  typeLevel: number;
  zoneNames: Array<IZoneName>;
  revenue: IRevenueItem[],
}

export interface ISelectedOffstreetZone extends IOffstreetZone {
  area: IArea;
  revenue: IRevenueItem[];
}
export interface ISelectedMeter extends IMeter {
  revenue: IRevenueItem[];
  zone: IZone;
  transactions: ITransaction[];
}

export interface ISelectedItems {
  meter: ISelectedItem<ISelectedMeter> | null;
  camera: ISelectedItem<ISelectedCamera> | null;
  sign: ISelectedItem<ISelectedSign> | null;
  zone: ISelectedItem<ISelectedZone> | null;
  spot: ISelectedItem<ISelectedSpot> | null;
  area: ISelectedItem<ISelectedArea> | null;
  offstreetZone: ISelectedItem<ISelectedOffstreetZone> | null;
}

@Injectable()
export class SelectedItemsService {
  private _items$ = new BehaviorSubject<ISelectedItems>({
    meter: null,
    camera: null,
    sign: null,
    zone: null,
    spot: null,
    area: null,
    offstreetZone: null
  });

  public get items$(): Observable<ISelectedItems> {
    return this._items$.asObservable();
  }

  constructor(private appNotifications: AppNotificationsService) { }

  loadItem<T extends IEntityBase>(itemName: SelectedItemName, itemId: number, loader: () => Observable<T>): Observable<T | null> {
    const existing = this._items$.value[itemName];
    if (!!existing && existing?.item?.Id === itemId) {
      return of(existing.item as any);
    }

    this._items$.next({
      ...this._items$.value, ...{
        [itemName]: { item: null, details: null }
      }
    });

    return loader()
      .pipe(
        tap(item => {
          this._items$.next({
            ...this._items$.value, ...{
              [itemName]: { item, details: null }
            }
          });
        }),
        catchError(err => {
          console.log(err);
          return of(null);
        })
      );
  }

  loadItemDetails<TDetails>(itemName: SelectedItemName, itemId: number, loader: () => Observable<TDetails>):
    Observable<TDetails | null> {
    const existing = this._items$.value[itemName];
    if (!existing || existing.item.Id !== itemId) {
      throw Error('Invalid selected item.');
    }

    if (!!existing.details) {
      return of(existing.details);
      // this._items$.next({
      //   ...this._items$.value, ...{
      //     [itemName]: { item: null, details: null }
      //   }
      // });
    }

    return loader()
      .pipe(
        tap(details => {
          this._items$.next({
            ...this._items$.value, ...{
              [itemName]: { item: existing.item, details: details }
            }
          });
        }),
        catchError(err => {
          this.appNotifications.error(err.message);
          return of(null);
        })
      );
  }
}
