import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { delay, map, Observable, of, tap } from 'rxjs';
import { AppConfigurationService } from '../app-config.service';

export interface ICity {
  Id: number;
  Name: string;
  Code: string;
  CenterPosition: [number, number];
  CreatedAt: Date;
  UpdatedAt: Date | null;
}

@Injectable({
  providedIn: 'root'
})
export class CitiesService {

  constructor(private _httpClient: HttpClient, private appSettings: AppConfigurationService) {
  }

  getAll(): Observable<Array<ICity>> {
    return this._httpClient.get<Array<ICity>>(`${this.appSettings.frontendApiUrl}/city`)
      .pipe(
        map(res => res || []),
        tap(items => items.forEach(x => ({
          Id: x.Id,
          Name: x.Name,
          Code: x.Code,
          CenterPosition: x.CenterPosition,
          CreatedAt: new Date(x.CreatedAt),
          UpdatedAt: !!x.UpdatedAt ? new Date(x.UpdatedAt) : null,
        }))
        )
      );
  }
}
