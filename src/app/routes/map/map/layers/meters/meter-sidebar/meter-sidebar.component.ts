import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { MeterEventType, PaymentMethod } from 'src/app/services/services/frontend-api/transactions.service';

import { MeterType, ReportsBuilder, SelectedItemName } from '../../../../../../model';

import { MapStateService, SelectedItemsService, ISelectedMeter } from '../../../../services';

@Component({
  selector: 'app-meter-sidebar',
  templateUrl: './meter-sidebar.component.html',
  styleUrls: ['./meter-sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MeterSidebarComponent implements OnInit, OnDestroy {
  sidebarVisible = false;
  subscriptions = new Array<Subscription>();

  meter: ISelectedMeter | null = null;
  meterPosition: [number, number] | null = null;

  paymentMethod = PaymentMethod;
  meterEventType = MeterEventType;

  meterType = MeterType;

  constructor(
    public mapState: MapStateService,
    private selectedItemsService: SelectedItemsService) { }

  ngOnInit(): void {
    this.subscriptions.push(
      this.mapState.sidebarVisible$
        .subscribe(visible => this.sidebarVisible = visible === 'meter')
    );

    this.subscriptions.push(
      this.selectedItemsService.items$
        .subscribe(items => {
          this.meter = items.meter?.item || null;

          if (!!this.meter) {
            this.meterPosition = this.meter?.Position || null;
          }

        })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(x => x.unsubscribe());
    this.subscriptions = [];
  }

  openZone() {
    const zoneId = this.meter?.ZoneId || 0;
    this.mapState.selectEntityOnMap(SelectedItemName.Zone, zoneId);
  }

  close() {
    this.mapState.closeSidebar();
  }

  mapView() {
    const meterId = this.meter?.Id || 0;
    this.mapState.selectEntityOnMap(SelectedItemName.Meter, meterId);
  }

  transactionsMoreInfo() {
    window.open(ReportsBuilder.getMeterTransactionsReport(this.meter?.Id), '_blank');
  }
}
