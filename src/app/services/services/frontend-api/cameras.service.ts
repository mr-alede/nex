import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { delay, map, Observable, of, tap } from 'rxjs';
import { CameraStatus } from '../../../model';
import { IEntityBase } from './entity-base';

export interface ICameraConfiguration {
  Mode: string;
  ResolutionX: number;
  ResolutionY: number;
  SnapshotTimeoutMs: number;
  UploadIntervalMs: number;
  TelemetryTimeoutMs: number;
  Version: string;
  Period: Array<{ From: Date, To: Date }>;
}

export interface ICameraWithSpots {
  CameraId: number;
  SpotIds: Array<number>;
}

export interface ICamera extends IEntityBase {
  Name: string;
  Position: [number, number];
  Address: string;
  SpotIds: Array<number>;
  CreatedAt: Date;
  UpdatedAt: Date;
  VideoUrl: string;
  Configuration?: ICameraConfiguration;
}

export interface ICameraState {
  CameraId: number;
  LastUpdated: Date;
  Status: CameraStatus
}

export interface ICameraEvent {
  EventType: string;
  VehicleType: string;
  Start?: Date;
  End?: Date;
  IsViolation: boolean;
}

export interface ICameraStateWithPictureUrl extends ICameraState {
  CameraId: number;
  LastUpdated: Date;
  Status: CameraStatus;
  PictureUrl: string;
  SpotsIds: Array<number>;
}

@Injectable({
  providedIn: 'root'
})
export class FrontendApiCamerasService {

  constructor(private _httpClient: HttpClient) {
  }

  getZoneCameras(spotsIds: number[]): Observable<Array<ICameraWithSpots>> {
    const ids = spotsIds.map(x => `id=${x}`).join('&');
    return this._httpClient.get<Array<ICameraWithSpots>>(`{FRONTEND_API}/Camera/by-spots/?${ids}`);
  }

  get(id: number): Observable<ICamera> {
    return this._httpClient.get<ICamera>(`{FRONTEND_API}/Camera/${id}`)
      .pipe(
        tap(x => {
          x.CreatedAt = new Date(x.CreatedAt);
          (x.Configuration?.Period || []).forEach(p => {
            p.From = new Date(p.From);
            p.To = new Date(p.To);
          })
        })
      );
  }

  getCameraBySpotsIds(spotsIds: Array<number>): Observable<Array<ICameraWithSpots>> {
    const ids = spotsIds.map(x => `id=${x}`).join('&');
    return this._httpClient.get<Array<ICameraWithSpots>>(`{FRONTEND_API}/Camera/by-spots/?${ids}`);
  }

  getCameraState(id: number): Observable<ICameraState> {
    return this._httpClient.get<ICameraState>(`{FRONTEND_API}/camera/${id}/state`)
      .pipe(tap(x => {
        x.LastUpdated = new Date(x.LastUpdated);
      }));
  }

  getCameraEvents(id: number): Observable<Array<ICameraEvent>> {
    return this._httpClient.get<Array<ICameraEvent>>(`{FRONTEND_API}/CameraEvent/by-camera?id=${id}`)
      .pipe(
        map(res => res || []),
        tap(items => items.forEach(x => {
          x.Start = x.Start ? new Date(x.Start) : null!;
          x.End = x.End ? new Date(x.End) : null!;
        })));
  }
}
