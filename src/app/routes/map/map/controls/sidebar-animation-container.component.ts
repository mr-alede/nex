import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    HostBinding,
    Input,
    OnDestroy,
    OnInit,
    SkipSelf
} from '@angular/core';
import { BehaviorSubject, filter, Subscription } from 'rxjs';

import { MapStateService, SidebarType } from '../../services';

const ANIMATION_TIMEOUT = 1000;

@Component({
    selector: 'app-sidebar-animation-container',
    template: '<ng-content *ngIf="renderContent$ | async"></ng-content>',
    styles: [':host { float: right;}'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarAnimationContainerComponent implements OnInit, OnDestroy {
    subscriptions = new Array<Subscription>();

    @Input() type: SidebarType;

    private _currentType: SidebarType | null = null;

    expanded = false;

    renderContent$ = new BehaviorSubject<boolean>(false);

    private _busy = false;

    @HostBinding('class') cssClass: string;

    constructor(private mapState: MapStateService, @SkipSelf() private cdRef: ChangeDetectorRef) { }

    ngOnInit(): void {
        this.cssClass = 'collapsed';
        if (this._busy)
            return;

        this._busy = true;
        this.subscriptions.push(
            this.mapState.sidebarVisible$
                .subscribe(type => {
                    if (type === this.type) {
                        if (!this._currentType) {
                            this.cssClass = '';
                            this.renderContent$.next(true);
                            this.setFree(type);
                        } else {
                            setTimeout(() => {
                                this.renderContent$.next(true);
                                this.cssClass = '';
                                this.setFree(type);
                            }, ANIMATION_TIMEOUT);
                        }
                    } else {
                        if (!this._currentType) {
                            this.renderContent$.next(false);
                            setTimeout(() => {
                                this.cssClass = 'collapsed';
                                this.setFree(type);
                            }, ANIMATION_TIMEOUT);
                        } else {
                            this.cssClass = 'collapsed';
                            this.cdRef.detectChanges();
                            setTimeout(() => {
                                this.renderContent$.next(false);
                                this.setFree(type);
                            }, ANIMATION_TIMEOUT);
                        }
                    }
                })
        );
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(x => x.unsubscribe());
        this.subscriptions = [];
    }

    private setFree(type: SidebarType | null) {
        this._busy = false;
        this._currentType = type;
    }
}