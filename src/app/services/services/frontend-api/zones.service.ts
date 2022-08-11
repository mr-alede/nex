import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, map } from "rxjs";
import { IEntityBase } from "./entity-base";
import { RevenueType } from "../../../model";

export interface IZone extends IEntityBase {
  Name: string;
  AreaId: number;
  Positions: [number, number][];
}

export interface IRevenueItem {
  Period: RevenueType;
  Current: number | null;
  Previous: number | null;
  Change: number | null;
  Forecast: number | null;
}

export interface IZoneName extends IEntityBase {
  Name: string;
}

@Injectable({
  providedIn: 'root'
})

export class ZonesService {
  constructor(private _httpClient: HttpClient) {
  }

  get(id: number): Observable<IZone> {
    return this._httpClient.get<IZone>(`{FRONTEND_API}/Zone/${id}`);

    // const zone: IZone = {
    //   Id: id,
    //   DistrictId: 34,
    //   Name: 'Zone #1',
    // };
    //
    // return of(zone).pipe(delay(1500));
  }

  getAreaZoneNames(areaId: number): Observable<Array<IZoneName>> {
    return this._httpClient.get<Array<IZoneName>>(`{FRONTEND_API}/zone/by-area/?id=${areaId}`)
      .pipe(map(x => x || []))
  }
}
