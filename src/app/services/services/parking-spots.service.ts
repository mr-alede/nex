import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { FeatureCollection } from 'geojson'

import { GeoRect } from '../../model';
import { Utils } from '../utils';

@Injectable({
  providedIn: 'root'
})
export class ParkingSpotsService {

  constructor(private _httpClient: HttpClient) {
  }

  getParkingSpotsGeoJson(rect: GeoRect): Observable<FeatureCollection> {
    return this._httpClient.get<FeatureCollection>('ParkingSpot/geo', { params: Utils.GetParams(rect) });
  }
}
