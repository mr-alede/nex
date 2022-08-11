import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';

import { Subscription } from 'rxjs';

import { ReportsBuilder } from '../../../../model';
import { AppStateService } from '../../../../services';
@Component({
  selector: 'app-grid-view-revenue',
  templateUrl: './grid-view-revenue.component.html',
  styleUrls: ['./grid-view-revenue.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GridViewRevenueComponent implements OnInit, OnDestroy {
  subscriptions = new Array<Subscription>();

  garageId: string | null;
  cityCode: string | null;

  reportUrl: string | null = null;

  constructor(
    private ref: ChangeDetectorRef,
    private appStateService: AppStateService) { }

  ngOnInit(): void {
    this.subscriptions.push(
      this.appStateService
        .currentCity$
        .subscribe(city => {
          this.cityCode = city?.Code || null;
          this.setReportUrl();
        })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(x => x.unsubscribe());
    this.subscriptions = [];
  }

  private setReportUrl() {
    this.reportUrl = null;
    this.ref.markForCheck();

    if (!!this.cityCode) {
      setTimeout(() => {
        this.reportUrl = ReportsBuilder.getRevenueGridViewReport(this.cityCode);
        this.ref.markForCheck();
      }, 1);
    }
  }
}

