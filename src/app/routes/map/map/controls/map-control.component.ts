import {
    AfterContentInit,
    ChangeDetectionStrategy,
    Component,
    Input,
    OnDestroy
} from '@angular/core';
import { IControl } from 'mapbox-gl';
import { ControlComponent, MapService } from 'ngx-mapbox-gl';

@Component({
    selector: 'app-mgl-control',
    template: '<div class="mapboxgl-ctrl" #content [ngClass]="cssClass"><ng-content></ng-content></div>',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapControlComponent<T extends IControl>
    extends ControlComponent<T>
    implements OnDestroy, AfterContentInit {

    @Input() cssClass: string | string[] | Set<string> | { [klass: string]: any; };

    constructor(mapService: MapService) {
        super(mapService);
    }
}