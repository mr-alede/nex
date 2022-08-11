import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';

import { BehaviorSubject, Subscription } from 'rxjs';

import {
  FeatureCollection,
} from 'geojson'
import { MapLayerMouseEvent } from 'mapbox-gl';
import mapboxgl from 'mapbox-gl';

import { GeoProcessorService, LayersVisibilityService, MapStateService } from '../../../../services';
import { ILayouts, IPaints, LayerBaseComponent } from '../../layer-base.component';
import { LayerName, RevenueType } from "../../../../../../model";

import { CityMapComponent } from '../../../city-map/city-map.component';

@Component({
  selector: 'app-revenue-layer',
  templateUrl: './revenue-layer.component.html',
  styleUrls: ['./revenue-layer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RevenueLayerComponent extends LayerBaseComponent implements OnInit, OnDestroy {
  subscriptions = new Array<Subscription>();

  private _revenue: FeatureCollection = { type: "FeatureCollection", features: [] };
  get revenue(): FeatureCollection {
    return this._revenue;
  }
  @Input() set revenue(value: FeatureCollection | null) {
    this._revenue = value || { type: "FeatureCollection", features: [] };
  }

  @Input() map: CityMapComponent;

  popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false
  });

  layouts$ = new BehaviorSubject<ILayouts>({
    revenue: {
      visibility: 'none'
    }
  });

  paints: IPaints = this.revenueSettings();
  paintsCopy: IPaints | null = null;

  constructor(
    private geoProcessor: GeoProcessorService,
    layersVisibility: LayersVisibilityService,
    mapState: MapStateService) {
    super(layersVisibility, mapState);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(x => x.unsubscribe());
    this.subscriptions = [];
  }

  ngOnInit(): void {
    this.popup.addClassName('revenue-tooltip');

    this.initVisibility(LayerName.Revenue, false);

    this.subscriptions.push(
      this.mapState.revenueType$
        .subscribe(period => {
          this._revenue = { type: "FeatureCollection", features: [] }
          if (period == RevenueType.Day) {
            this.paints = this.revenueSettings([[0, 0], [10, 1]]);
          } else {
            this.paints = this.revenueSettings();
          }
        })
    );
  }

  mouseEnter(evt: MapLayerMouseEvent) {
    let revenueSum = 0;
    (evt.features || []).forEach(x => {
      let revenue = x.properties?.revenue || 0;
      revenueSum += revenue;
    });

    if (revenueSum > 0) {
      const revenueTxt = `<span style='margin-left: 5px;'>Revenue: $${revenueSum.toFixed(2)}</span>`;
      this.popup.setLngLat(evt.lngLat).setHTML(revenueTxt).addTo(this.map.map);
    }
  }

  mouseLeave(evt: MapLayerMouseEvent) {
    this.popup.remove();
  }

  private revenueSettings(weight: Array<[number, number]> | null = null): IPaints {
    weight = weight || [
      [0, 0],
      [100, 1]
    ];

    return {
      revenue: {
        'heatmap-weight': {
          property: 'revenue',
          type: 'exponential',
          stops: weight
        },
        // increase intensity as zoom level increases
        'heatmap-intensity': {
          stops: [
            [11, 1],
            [15, 3]
          ]
        },
        'heatmap-color': [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
          0,
          'rgba(33,102,172,0)',
          0.2,
          'rgb(103,169,207)',
          0.4,
          'rgb(209,229,240)',
          0.6,
          'rgb(253,219,199)',
          0.8,
          'rgb(239,138,98)',
          1,
          'rgb(178,24,43)'
        ],
        // increase radius as zoom increases
        'heatmap-radius': {
          stops: [
            [11, 15],
            [15, 20]
          ]
        },
        'heatmap-opacity': 1
      }
    };
  }
}
