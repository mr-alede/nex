import { Injectable } from "@angular/core";

import { BehaviorSubject, map, Observable, Subject } from "rxjs";

import {
  Point,
  Feature,
  GeoJsonProperties
} from 'geojson';

import { IArea } from "../../../services";
import { AreasProcessorService } from "./areas-processor.service";
import { LayerName, RevenueType, SelectedItemName } from "../../../model";

export interface ISelectedEntity {
  type: SelectedItemName;
  entity: any;
}
export interface ISelectedEntityOnMap {
  type: SelectedItemName;
  id: number;
  data?: any;
  typeId?: number;
}

export interface ISpotCar {
  vehicleId: number;
  parkingDate: string;
  realColor: string;
  realType: string;
  isLarge: boolean;
}

export type SidebarType = 'layers' | 'spot' | 'camera' | 'meter' | 'sign' | 'zone' | 'area' | 'offstreet-zone';

@Injectable()
export class MapStateService {
  private _selectedEntity$ = new BehaviorSubject<ISelectedEntity | null>(null);

  public get selectedEntity$(): Observable<ISelectedEntity | null> {
    return this._selectedEntity$.asObservable();
  }
  public get selectedEntity(): ISelectedEntity | null {
    return this._selectedEntity$.value;
  }

  public get selectedSpot(): Feature<Point, GeoJsonProperties> | null {
    if (this._selectedEntity$.value?.type === 'spot')
      return this._selectedEntity$.value?.entity;

    return null;
  }
  public get selectedSpotCar(): ISpotCar | null {
    if (this._selectedEntity$.value?.type === 'spot') {
      const car = (this._selectedEntity$.value?.entity.properties || {})['Car'];
      if (!!car) {
        return JSON.parse(car);
      }
    }

    return null;
  }

  private _sidebarVisible$ = new BehaviorSubject<SidebarType | null>(null);
  public get sidebarVisible$(): Observable<SidebarType | null> {
    return this._sidebarVisible$.asObservable();
  }

  public get sidebarExpanded$(): Observable<boolean> {
    return this._sidebarVisible$.pipe(map(x => !!x));
  }

  private _selectedEntityOnMap$ = new Subject<ISelectedEntityOnMap | null>();
  public get selectedEntityOnMap$(): Observable<ISelectedEntityOnMap | null> {
    return this._selectedEntityOnMap$.asObservable();
  }

  private _popupVisible$ = new BehaviorSubject<boolean>(false);
  public get popupVisible$(): Observable<boolean> {
    return this._popupVisible$.asObservable();
  }

  private _revenueType$ = new BehaviorSubject<RevenueType>(RevenueType.Day);
  public get revenueType$(): Observable<RevenueType> {
    return this._revenueType$.asObservable();
  }

  constructor(private areasProcessor: AreasProcessorService) { }

  public toggleSidebar(type: SidebarType) {
    if (this._sidebarVisible$.value !== type)
      this._sidebarVisible$.next(type);
    else
      this._sidebarVisible$.next(null);
  }
  public openSidebar(type: SidebarType) {
    this._sidebarVisible$.next(type);
  }
  public closeSidebar() {
    this._sidebarVisible$.next(null);
  }

  public selectEntity(type: SelectedItemName, entity: any) {
    if (!entity)
      throw new Error(`'entity' parameter must not be empty.`);

    if (!type)
      throw new Error(`'type' parameter must not be empty.`);

    this._selectedEntity$.next({ type: type, entity: entity });
    this.closeSidebar();
  }

  public clearSelectedEntity() {
    this._selectedEntity$.next(null);
  }

  public clearSelectedEntityByLayerName(layerName: LayerName) {
    if (this.getEntityTypeByLayerName(layerName) === this._selectedEntity$.value?.type) {
      this._selectedEntity$.next(null);
    }
  }

  public selectEntityOnMap(type: SelectedItemName, id: number, typeId?: number) {
    this._selectedEntityOnMap$.next({ type: type, id: id, typeId: typeId });
  }

  public selectAreaOnMap(area: IArea | undefined | null, zoom = false) {
    if (!!area) {
      this.areasProcessor.getTypes()
        .subscribe(types => {
          this._selectedEntityOnMap$.next({ type: SelectedItemName.Area, id: area.Id, data: { level: types[area.TypeId].level, zoom } });
        });
    }
  }

  public setRevenueType(type: RevenueType) {
    this._revenueType$.next(type);
  }

  public openPopup() {
    this._popupVisible$.next(true);
  }
  public closePopup() {
    this._popupVisible$.next(false);
  }

  private getEntityTypeByLayerName(layerName: LayerName): SelectedItemName | null {
    switch (layerName) {
      case LayerName.Areas:
        return SelectedItemName.Area;

      case LayerName.Cameras:
        return SelectedItemName.Camera;

      case LayerName.Meters:
        return SelectedItemName.Meter;

      case LayerName.OffstreetZones:
        return SelectedItemName.OffstreetZone;

      case LayerName.Signs:
        return SelectedItemName.Sign;

      case LayerName.Spots:
        return SelectedItemName.Spot;

      case LayerName.Zones:
        return SelectedItemName.Zone;

      default: return null;
    }
  }

}
