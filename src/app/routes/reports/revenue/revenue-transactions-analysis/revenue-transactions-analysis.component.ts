import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';

import { Subscription } from 'rxjs';

import { ReportsBuilder } from '../../../../model';
import { AppStateService } from '../../../../services';
@Component({
  selector: 'app-revenue-transactions-analysis',
  templateUrl: './revenue-transactions-analysis.component.html',
  styleUrls: ['./revenue-transactions-analysis.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RevenueTransactionsAnalysisComponent implements OnInit, OnDestroy {
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
        this.reportUrl = ReportsBuilder.getRevenueTransactionsReport(this.cityCode);
        this.ref.markForCheck();
      }, 1);
    }
  }
}
