import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { AppStateService } from '../../services';

@Component({
  selector: 'app-nav-sidebar',
  templateUrl: './nav-sidebar.component.html',
  styleUrls: ['./nav-sidebar.component.scss']
})
export class NavSidebarComponent implements OnInit, OnDestroy {
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
