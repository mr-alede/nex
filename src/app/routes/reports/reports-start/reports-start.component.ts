import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AppStateService } from '../../../services';

@Component({
  selector: 'app-reports-start',
  templateUrl: './reports-start.component.html',
  styleUrls: ['./reports-start.component.scss']
})
export class ReportsStartComponent implements OnInit, OnDestroy {
  subscriptions = new Array<Subscription>();

  cityCode: string | null = null;

  constructor(private appState: AppStateService) { }

  ngOnInit(): void {
    this.subscriptions.push(
      this.appState.currentCity$
        .subscribe(x => {
          this.cityCode = x?.Code || null;
        })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(x => x.unsubscribe());
    this.subscriptions = [];
  }
}
