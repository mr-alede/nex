import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ReportsBuilder } from '../../../../model';

import { AppStateService } from '../../../../services';

@Component({
  selector: 'app-cameras-grid',
  templateUrl: './cameras-grid.component.html',
  styleUrls: ['./cameras-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CamerasGridComponent implements OnInit, OnDestroy {
  subscriptions = new Array<Subscription>();

  cityCode: string | undefined;

  reportUrl: string | null = null;

  constructor(
    private ref: ChangeDetectorRef,
    private appStateService: AppStateService) { }

  ngOnInit(): void {
    this.subscriptions.push(
      this.appStateService
        .currentCity$
        .subscribe(city => {
          this.cityCode = city?.Code;
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
        this.reportUrl = ReportsBuilder.getCameraGridView(this.cityCode);
        this.ref.markForCheck();
      }, 1);
    }
  }
}

