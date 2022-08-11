import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable, tap } from 'rxjs';
import { MeterStatus, MeterType } from '../../../model';
import { IEntityBase } from './entity-base';

export interface IMeter extends IEntityBase {
  Name: string;
  Vendor: string;
  Model: string;
  Type: MeterType;
  Blockface: string;
  Jurisdiction: string;
  Position: [number, number];
  Address: string;
  Status: MeterStatus;
  SpotIds: Array<number>;
  ZoneId: number;
  HoursOfOperation: string;
  MaxTime: string;
  CreatedAt: Date;
  UpdatedAt: Date | null;
}

export interface IMeterName extends IEntityBase {
  Name: string;
}

@Injectable({
  providedIn: 'root'
})
export class MetersService {

  constructor(private _httpClient: HttpClient) {
  }

  get(id: number): Observable<IMeter> {
    return this._httpClient.get<IMeter>(`{FRONTEND_API}/meter/${id}`)
      .pipe(tap(x => {
        x.CreatedAt = new Date(x.CreatedAt);
        x.UpdatedAt = !!x.UpdatedAt && new Date(x.UpdatedAt) || null;
      }));
  }

  getZoneMeterNames(zoneId: number): Observable<Array<IMeterName>> {
    return this._httpClient.get<Array<IMeterName>>(`{FRONTEND_API}/meter/by-zone/?id=${zoneId}`);
  }

  getSpotMeterNames(id: number): Observable<Array<IMeterName>> {
    return this._httpClient.get<Array<IMeterName>>(`{FRONTEND_API}/Meter/by-spot/?id=${id}`);
  }
}
