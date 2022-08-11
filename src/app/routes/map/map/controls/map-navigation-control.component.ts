import {
    AfterContentInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    Input,
    OnDestroy,
    ViewChild
} from '@angular/core';
import mapboxgl, { IControl, NavigationControl } from 'mapbox-gl';
import { MapService } from 'ngx-mapbox-gl';

export class CustomCompositeControl implements IControl {
    constructor(private container: HTMLElement, private controls: IControl[]) {
    }

    onAdd(map: mapboxgl.Map) {
        this.controls.forEach(c => this.container.prepend(c.onAdd(map)));
        return this.container;
    }

    onRemove(map: mapboxgl.Map) {
        this.controls.forEach(c => c.onRemove(map));
        return this.container.parentNode!.removeChild(this.container);
    }

    getDefaultPosition() {
        return 'top-right';
    }
}

@Component({
    selector: 'app-map-navigation-control',
    template: '<div class="mapboxgl-ctrl mapboxgl-ctrl-group" #content [ngClass]="cssClass"><ng-content></ng-content></div>',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapNavigationControlComponent<T extends IControl>
    implements OnDestroy, AfterContentInit {

    @Input() position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    @Input() showCompass?: boolean;
    @Input() showZoom?: boolean;
    @Input() cssClass: string | string[] | Set<string> | { [klass: string]: any; };

    @ViewChild('content', { static: true }) content: ElementRef;

    control: IControl;

    constructor(private MapService: MapService) { }

    ngAfterContentInit() {
        const options: { showCompass?: boolean; showZoom?: boolean } = {};
        if (this.showCompass !== undefined) {
            options.showCompass = this.showCompass;
        }

        if (this.showZoom !== undefined) {
            options.showZoom = this.showZoom;
        }

        let controls = new Array<IControl>();
        controls.push(new NavigationControl(options));

        if (this.content.nativeElement.childNodes.length) {
            this.control = new CustomCompositeControl(this.content.nativeElement, controls);
        } else {
            this.control = controls[0];
        }

        this.MapService.mapCreated$.subscribe(() => {
            this.MapService.addControl(this.control!, this.position);
        });
    }

    ngOnDestroy() {
        this.MapService.removeControl(this.control);
    }
}