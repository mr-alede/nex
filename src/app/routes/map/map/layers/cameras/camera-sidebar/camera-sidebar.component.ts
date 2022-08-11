import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { ISelectedCamera, MapStateService, SelectedItemsService } from '../../../../services';
import { AppStateService, ICameraEvent } from '../../../../../../services';

import { ReportsBuilder, SelectedItemName } from '../../../../../../model';

export interface ICameraEventModel extends ICameraEvent {
  EventTypeShort: string;
}

@Component({
  selector: 'app-camera-sidebar',
  templateUrl: './camera-sidebar.component.html',
  styleUrls: ['./camera-sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CameraSidebarComponent implements OnInit, OnDestroy {
  private readonly eventsMap: Map<string, string> = new Map([
    ["PARKING (NEAR)", "PN"],
    ["PARKING (FAR)", "PF"],
    ["DOUBLE PARKING (CENTER)", "DPC"],
    ["DOUBLE PARKING (FAR)", "DPF"],
    ["DOUBLE PARKING (NEAR)", "DPN"]
  ]);

  sidebarVisible = false;
  subscriptions = new Array<Subscription>();

  camera: ISelectedCamera | null = null;

  stateUpdated: string | null;

  events: ICameraEventModel[] | null = null;
  cityCode: string | undefined;

  constructor(
    public mapState: MapStateService,
    private appState: AppStateService,
    private selectedItemsService: SelectedItemsService) { }

  ngOnInit(): void {
    this.subscriptions.push(
      this.mapState.sidebarVisible$
        .subscribe(visible => this.sidebarVisible = visible === 'camera')
    );

    this.subscriptions.push(
      this.selectedItemsService.items$
        .subscribe(items => {
          this.camera = items.camera?.item || null;
          this.events = this.camera?.events?.map(x => ({
            ...x,
            EventTypeShort: this.eventsMap.get(x.EventType?.toUpperCase()) || ""
          })) || null;
        })
    );

    this.subscriptions.push(
      this.appState
        .currentCity$
        .subscribe(city => {
          this.cityCode = city?.Code;
        })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(x => x.unsubscribe());
    this.subscriptions = [];
  }

  close() {
    this.mapState.closeSidebar();
  }

  mapView() {
    const cameraId = this.camera?.Id || 0;
    this.mapState.selectEntityOnMap(SelectedItemName.Camera, cameraId);
  }

  eventsMoreInfo() {
    window.open(ReportsBuilder.getCameraOverview(this.cityCode), '_blank');
  }
}
