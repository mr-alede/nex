import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { GeoRect } from '../../model';
import { Utils } from '../utils';

import { FeatureCollection } from 'geojson'

@Injectable({ providedIn: 'root' })
export class CamerasService {
  constructor(private _httpClient: HttpClient) {
  }

  getCamerasGeoJson(rect: GeoRect): Observable<FeatureCollection> {

    return this._httpClient.get<FeatureCollection>('Camera/geo', { params: Utils.GetParams(rect) });
  }

  public getRegulationsJSON(): Observable<FeatureCollection> {
    return this._httpClient.get<FeatureCollection>("ParkingZone/All");
  }
}

