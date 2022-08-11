import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { delay, Observable, of } from "rxjs";
import { IEntityBase } from "./entity-base";

export interface IOffstreetZone extends IEntityBase {
  Name: string;
  Address: string;
  Position: [number, number];
  AreaId: number;
  Vendor: string;
  SpotsCount?: number;
  LocationId: string;
}

@Injectable({
  providedIn: 'root'
})

export class OffstreetZonesService {
  constructor(private _httpClient: HttpClient) {
  }

  get(id: number): Observable<IOffstreetZone> {
    return this._httpClient.get<IOffstreetZone>(`{FRONTEND_API}/offstreetzone/${id}`);
  }
}
