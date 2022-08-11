import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Position } from 'geojson'
import { delay, map, Observable, of } from 'rxjs';

import { CameraStatus, MeterStatus, MeterType, OccupancyStatus, RevenueType, SignStatus, SpotPolicyType } from '../../../model';
import { IEntityBase } from './entity-base';

export interface IGeoEntityBase<TPosition, TStatus = void> extends IEntityBase {
  Position: TPosition;
  Status: TStatus;
}

export interface ICameraGeo extends IGeoEntityBase<Position, CameraStatus> {
}

export interface IMeterGeo extends IGeoEntityBase<Position, MeterStatus> {
  PolicyType: SpotPolicyType;
}

export interface ISignGeo extends IGeoEntityBase<Position, SignStatus> {
}

export interface IZoneGeo extends IEntityBase {
  Positions: Array<Position>;
}

export interface ISpotGeo extends IGeoEntityBase<Position, OccupancyStatus> {
  PolicyType: SpotPolicyType;
  CompanyName?: string;
}

export interface IOffstreetZoneGeo extends IGeoEntityBase<Position> {
}

export interface IMeterRevenueGeo extends IGeoEntityBase<Position, MeterStatus> {
  Type: MeterType;
  Revenue?: number;
}

@Injectable({
  providedIn: 'root'
})
export class GeoIndexesService {

  constructor(private _httpClient: HttpClient) {
  }

  getCameras(x: number, y: number, z: number): Observable<Array<ICameraGeo>> {
    return this._httpClient
      .get<Array<ICameraGeo>>(`{FRONTEND_API}/geoindex/camera/${z}/${x}/${y}`)
      .pipe(
        map(res => !res ? [] : res)
      );
  }

  getMeters(x: number, y: number, z: number): Observable<Array<IMeterGeo>> {
    return this._httpClient
      .get<Array<IMeterGeo>>(`{FRONTEND_API}/geoindex/meter/${z}/${x}/${y}`)
      .pipe(
        map(res => !res ? [] : res)
      );
  }

  getSigns(x: number, y: number, z: number): Observable<Array<ISignGeo>> {
    return this._httpClient
      .get<Array<ISignGeo>>(`{FRONTEND_API}/geoindex/sign/${z}/${x}/${y}`)
      .pipe(
        map(res => !res ? [] : res)
      );
  }

  getZones(x: number, y: number, z: number): Observable<Array<IZoneGeo>> {
    return this._httpClient
      .get<Array<IZoneGeo>>(`{FRONTEND_API}/geoindex/zone/${z}/${x}/${y}`)
      .pipe(
        map(res => !res ? [] : res)
      );
  }

  getSpots(x: number, y: number, z: number): Observable<Array<ISpotGeo>> {
    return this._httpClient
      .get<Array<ISpotGeo>>(`{FRONTEND_API}/geoindex/spot/${z}/${x}/${y}`)
      .pipe(
        map(res => !res ? [] : res)
      );
  }

  getOffstreetZones(x: number, y: number, z: number): Observable<Array<IOffstreetZoneGeo>> {
    return this._httpClient
      .get<Array<IOffstreetZoneGeo>>(`{FRONTEND_API}/geoindex/offstreetzone/${z}/${x}/${y}`)
      .pipe(
        map(res => !res ? [] : res)
      );
  }

  getMetersRevenue(x: number, y: number, z: number, revenuePeriod: RevenueType): Observable<Array<IMeterRevenueGeo>> {
    return this._httpClient
      .get<Array<IMeterRevenueGeo>>(`{FRONTEND_API}/geoindex/meter-revenue/${z}/${x}/${y}?revenuePeriod=${revenuePeriod}`)
      .pipe(
        map(res => !res ? [] : res)
      );
  }
}
