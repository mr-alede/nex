import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { map, Observable, tap } from 'rxjs';
import { OccupancyStatus, SpotPolicyType, DayOfWeekId, ScheduleType } from '../../../model';
import { IEntityBase } from './entity-base';

export interface ISpot extends IEntityBase {
  Name: string;
  ZoneId: number;
  PolicyType: SpotPolicyType;
  Position: [number, number];
}

export interface ISpotState {
  PolicyType: SpotPolicyType;
  Status: OccupancyStatus;
  SpotId: number;
  CompanyName: string;
}

// Regulations

export interface ISpotRegulation {
  Policy: SpotPolicyType;
  Schedules: Array<ISchedule>;
}

export interface ISchedule {
  Items: Array<IScheduleItem>;
  ScheduleType: ScheduleType;
}

export interface IScheduleItem {
  DayOfWeekId: DayOfWeekId;
  ToTime: string;
  FromTime: string;
  Rates: Array<IScheduleItemRate>;
  TimeLimitMinutes?: number;
}

export interface IScheduleItemRate {
  FromTime: string;
  Rate: number;
  IsRecurring: boolean;
  ToTime: string;
}

@Injectable({
  providedIn: 'root'
})
export class SpotsService {

  constructor(private _httpClient: HttpClient) {
  }

  get(id: number): Observable<ISpot> {
    return this._httpClient.get<ISpot>(`{FRONTEND_API}/Spot/${id}`);
  }

  getSpotState(id: number): Observable<Array<ISpotState>> {
    return this._httpClient.get<Array<ISpotState>>(`{FRONTEND_API}/Spot/state/?id=${id}`);
  }

  getZoneSpotsStates(zoneId: number): Observable<Array<ISpotState>> {
    return this._httpClient.get<Array<ISpotState>>(`{FRONTEND_API}/Spot/state/by-zone/?id=${zoneId}`);
  }

  getSpotsStates(spots: Array<number>): Observable<Array<ISpotState>> {
    const ids = spots.map(x => `id=${x}`).join('&');
    return this._httpClient.get<Array<ISpotState>>(`{FRONTEND_API}/spot/state?${ids}`)
      .pipe(map(x => x || []));
  }

  getSpotRegulation(spotId: number): Observable<ISpotRegulation> {
    return this._httpClient.get<ISpotRegulation>(`{FRONTEND_API}/spot/${spotId}/regulation`)
      .pipe(
        tap(x => {
          (x.Schedules || []).forEach(schedule => {
            schedule.Items.forEach((i: IScheduleItem) => {
              if (i.ToTime) i.ToTime = i.ToTime.split(':')[0] + ':' + i.ToTime.split(':')[1];
              if (i.FromTime) i.FromTime = i.FromTime.split(':')[0] + ':' + i.FromTime.split(':')[1];

              if (i.Rates) {
                i.Rates.forEach((r:IScheduleItemRate) => {
                  if (r.ToTime) r.ToTime = r.ToTime.split(':')[0] + ':' + r.ToTime.split(':')[1];
                  if (r.FromTime) r.FromTime = r.FromTime.split(':')[0] + ':' + r.FromTime.split(':')[1];
                })
              }
            })
          });
        })
      );
  }
}
