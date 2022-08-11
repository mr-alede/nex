import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { delay, Observable, of, tap } from 'rxjs';

import { SignStatus } from '../../../model';
import { IEntityBase } from './entity-base';

export interface ISignState {
  SignId: number;
  ActiveScreenId: number;
  LastUpdated: Date | null;
  Status: SignStatus;
}

export interface ISignStateWithPictureUrl extends ISignState {
  PictureUrl: string | null;
}

export interface ISign extends IEntityBase {
  Name: string;
  ZoneId: number | null;
  SpotIds: Array<number>;
  DeviceId: number;
  Address: string;
  Position: [number, number];
  ActiveScreenId: number;
  ImagesIds: Array<number>;
}

export interface ISignTelemetry {
  SignId: number;
  Firmware: string;
  State: number;
  Battery: number;
  RSSI: string;
  Light: number;
  LastUpdated: Date;
}

@Injectable({
  providedIn: 'root'
})
export class SignsService {

  constructor(private _httpClient: HttpClient) {
  }

  get(id: number): Observable<ISign> {
    return this._httpClient.get<ISign>(`{FRONTEND_API}/sign/${id}`);
  }

  getZoneSigns(zoneId: number): Observable<Array<number>> {
    return this._httpClient.get<Array<number>>(`{FRONTEND_API}/Sign/by-zone/?id=${zoneId}`);

  }

  getSpotSignsId(spotsIds: number[]): Observable<Array<number>> {
    const ids = spotsIds.map(x => `id=${x}`).join('&');
    return this._httpClient.get<Array<number>>(`{FRONTEND_API}/Sign/by-spots/?${ids}`);

  }

  getSignTelemetry(id: number): Observable<ISignTelemetry> {
    return this._httpClient.get<ISignTelemetry>(`{FRONTEND_API}/sign/${id}/telemetry`)
      .pipe(tap(x => {
        x.LastUpdated = new Date(x.LastUpdated);
      }));
  }

  getSignState(id: number): Observable<ISignState> {
    return this._httpClient.get<ISignState>(`{FRONTEND_API}/sign/${id}/state`)
      .pipe(tap(x => {
        x.LastUpdated = !!x.LastUpdated ? new Date(x.LastUpdated) : null;
      }));
  }
}
