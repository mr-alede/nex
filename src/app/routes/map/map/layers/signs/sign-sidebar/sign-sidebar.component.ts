import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { finalize, Subscription } from 'rxjs';

import { ISelectedSign, MapStateService, SelectedItemsService } from '../../../../services';
import { AppConfigurationService, ISignTelemetry, SignsService } from '../../../../../../services';
import { SelectedItemName } from '../../../../../../model';

@Component({
  selector: 'app-sign-sidebar',
  templateUrl: './sign-sidebar.component.html',
  styleUrls: ['./sign-sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignSidebarComponent implements OnInit, OnDestroy {
  sidebarVisible = false;
  subscriptions = new Array<Subscription>();

  sign: ISelectedSign | null = null;

  pictureUrl: string | null = null;
  ledColor: string = 'Green';

  telemetry: ISignTelemetry | null = null;

  telemetryPanelExpanded = false;
  busy = false;

  constructor(
    public mapState: MapStateService,
    private selectedItemsService: SelectedItemsService,
    private signsService: SignsService) { }

  ngOnInit(): void {
    this.subscriptions.push(
      this.mapState.sidebarVisible$
        .subscribe(visible => this.sidebarVisible = visible === 'sign')
    );

    this.subscriptions.push(
      this.selectedItemsService.items$
        .subscribe(items => {
          if (!items.sign?.item) {
            this.telemetry = null;
            this.telemetryPanelExpanded = false;
          }

          this.sign = items.sign?.item || null;
          this.pictureUrl = !!this.sign ? `{FRONTEND_API}/sign/screen/${this.sign?.ActiveScreenId}` : null;
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
    const signId = this.sign?.Id || 0;
    this.mapState.selectEntityOnMap(SelectedItemName.Sign, signId);
  }

  telemetryExpanded(expanded: boolean) {
    if (!this.telemetryPanelExpanded && expanded && !this.telemetry) {
      this.busy = true;
      this.signsService.getSignTelemetry(this.sign?.Id || 0)
        .pipe(
          finalize(() => this.busy = false)
        )
        .subscribe(telemetry => {
          this.telemetryPanelExpanded = expanded;
          this.telemetry = telemetry;
        });
    }
  }

  openZone() {

  }
}
