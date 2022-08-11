import { IRevenueItem } from "./zones.service";
import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";

export interface IRevenueWithChange {
  isDayChangePositive: boolean,
  isWeekChangePositive: boolean,
  isMonthChangePositive: boolean
}

@Injectable({
  providedIn: 'root'
})

export class RevenueService {
  constructor(private _httpClient: HttpClient) {
  }

  getRevenueByArea(areaId: number): Observable<Array<IRevenueItem>> {
    return this._httpClient.get<Array<IRevenueItem>>(`{FRONTEND_API}/Revenue/by-area?id=${areaId}`)
      .pipe(
        map(res => !res ? [] : res)
      )
  }

  getRevenueByZone(zoneId: number): Observable<Array<IRevenueItem>> {
    return this._httpClient.get<Array<IRevenueItem>>(`{FRONTEND_API}/Revenue/by-zone/?id=${zoneId}`)
  }

  getRevenueByMeter(meterId: number): Observable<Array<IRevenueItem>> {
    return this._httpClient.get<Array<IRevenueItem>>(`{FRONTEND_API}/Revenue/by-meter/?id=${meterId}`)
  }

  getRevenueByOffstreetZone(offstreetZoneId: number): Observable<Array<IRevenueItem>> {
    return this._httpClient.get<Array<IRevenueItem>>(`{FRONTEND_API}/Revenue/by-offstreetZone/?id=${offstreetZoneId}`)
  }

  // public countRevenueChangeColors(revenue: IRevenueItem[]): IRevenueWithChange {
  //   let revenueWithChange: IRevenueWithChange = { isDayChangePositive: false, isWeekChangePositive: false, isMonthChangePositive: false }
  //   if (revenue
  //     && revenue[0]
  //     && revenue[1]
  //     && revenue[2]
  //     && revenue[0].Current
  //     && revenue[0].Previous
  //     && revenue[1].Current
  //     && revenue[1].Previous
  //     && revenue[2].Current
  //     && revenue[2].Previous
  //   ) {
  //     revenueWithChange.isDayChangePositive = revenue[0].Current > revenue[0].Previous
  //     revenueWithChange.isWeekChangePositive = revenue[1].Current > revenue[1].Previous
  //     revenueWithChange.isMonthChangePositive = revenue[2].Current > revenue[2].Previous
  //   }
  //   return revenueWithChange;
  // }
}
