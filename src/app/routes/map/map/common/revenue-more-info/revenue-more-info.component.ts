import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { ReportsBuilder } from '../../../../../model';

import { AppStateService } from '../../../../../services';

@Component({
  selector: 'app-revenue-more-info',
  templateUrl: './revenue-more-info.component.html',
  styleUrls: ['./revenue-more-info.component.scss']
})
export class RevenueMoreInfoComponent implements OnInit, OnDestroy {
  @Input() garageId: string | undefined;
  @Input() zoneId: number | undefined;
  @Input() meterId: number | undefined;
  @Input() areaId: number | undefined;

  subscriptions = new Array<Subscription>();

  cityCode: string | null;

  constructor(private router: Router, private appState: AppStateService) { }

  ngOnInit(): void {
    this.subscriptions.push(
      this.appState
        .currentCity$
        .subscribe(city => {
          this.cityCode = city?.Code || null;
        })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(x => x.unsubscribe());
    this.subscriptions = [];
  }

  moreInfo() {
    if (this.garageId !== undefined) {
      window.open(ReportsBuilder.getGarageRevenueReport(this.garageId), '_blank');
    } else if (this.zoneId !== undefined) {
      window.open(ReportsBuilder.getZoneRevenueReport(this.zoneId), '_blank');
    } else if (this.meterId !== undefined) {
      window.open(ReportsBuilder.getMeterRevenueReport(this.meterId), '_blank');
    } else if (this.areaId !== undefined && this.cityCode !== undefined) {
      window.open(ReportsBuilder.getAreaRevenueReport(this.cityCode), '_blank');
    }
  }
}
