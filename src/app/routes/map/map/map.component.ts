import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { AppConfigurationService, AppStateService, ICity } from '../../../services';

import { DefaultMapSettings, IMapSettings } from './city-map/city-map.component';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, OnDestroy {
  mapSettings: IMapSettings = { ...DefaultMapSettings };
  style: string;

  city: ICity | null;

  subscriptions = new Array<Subscription>();

  constructor(private appConfig: AppConfigurationService, private appState: AppStateService) { }

  ngOnInit(): void {
    this.style = this.appConfig.data.map.style;
    this.mapSettings = {
      ...DefaultMapSettings,
      ...{
        lng: this.appConfig.data.map.lng,
        lat: this.appConfig.data.map.lat,
        animationEnabled: false
      }
    };

    this.subscriptions.push(
      this.appState.currentCity$
        .subscribe(city => {
          const animationEnabled = !!this.city && this.city?.Code !== city?.Code;

          this.mapSettings = {
            ...DefaultMapSettings,
            ...{
              lng: city?.CenterPosition[0] || 0,
              lat: city?.CenterPosition[1] || 0,
              animationEnabled: animationEnabled
            }
          };

          this.city = city;
        })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(x => x.unsubscribe());
    this.subscriptions = [];
  }
}
