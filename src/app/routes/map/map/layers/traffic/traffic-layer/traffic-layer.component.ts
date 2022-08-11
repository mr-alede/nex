import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';

import { LayersVisibilityService, MapStateService } from '../../../../services';
import { ILayouts, IPaints, LayerBaseComponent } from '../../layer-base.component';
import { LayerName } from "../../../../../../model";
import { BehaviorSubject } from 'rxjs';


@Component({
  selector: 'app-traffic-layer',
  templateUrl: './traffic-layer.component.html',
  styleUrls: ['./traffic-layer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TrafficLayerComponent extends LayerBaseComponent implements OnInit, OnDestroy {

  layouts$ = new BehaviorSubject<ILayouts>({
    traffic: {
      visibility: 'none'
    }
  });

  paints: IPaints = {
    traffic: {
      'line-width': {
        'base': 1.5,
        'stops': [
          [
            14,
            2.5
          ],
          [
            20,
            3
          ]
        ]
      },
      'line-color': {
        'base': 1,
        'type': 'categorical',
        'property': 'congestion',
        'stops': [
          [
            'low',
            'hsl(145, 95%, 30%)'
          ],
          [
            'moderate',
            'hsl(30, 100%, 42%)'
          ],
          [
            'heavy',
            'hsl(355, 100%, 37%)'
          ],
          [
            'severe',
            'hsl(355, 70%, 22%)'
          ]
        ]
      },
      //   'line-opacity': {
      //     'base': 1,
      //     'stops': [
      //       [15, 0.75]
      //     ]
      //   }
    }
  };

  constructor(layersVisibility: LayersVisibilityService,
    mapState: MapStateService) {
    super(layersVisibility, mapState);
  }
  ngOnDestroy(): void {
    this.subscriptions.forEach(x => x.unsubscribe());
    this.subscriptions = [];
  }

  ngOnInit(): void {
    this.initVisibility(LayerName.Traffic, false);
  }
}
