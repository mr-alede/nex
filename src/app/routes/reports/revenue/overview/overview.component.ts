import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { ReportsBuilder } from '../../../../model';
import { AppStateService } from '../../../../services';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OverviewComponent implements OnInit, OnDestroy {
  subscriptions = new Array<Subscription>();

  garageId: string | null;
  cityCode: string | null;

  reportUrl: string | null = null;

  constructor(
    private ref: ChangeDetectorRef,
    private route: ActivatedRoute, private appStateService: AppStateService) { }

  ngOnInit(): void {
    this.subscriptions.push(
      this.appStateService
        .currentCity$
        .subscribe(city => {
          this.cityCode = city?.Code || null;
          this.setReportUrl();
        })
    );

    this.subscriptions.push(
      this.route
        .queryParams
        .subscribe(params => {
          this.garageId = params.garageid || null;
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
        this.reportUrl = ReportsBuilder.getRevenueReport(this.cityCode);
        this.ref.markForCheck();
      }, 1);
    }
  }
}
