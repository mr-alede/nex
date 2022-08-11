import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Subscription } from 'rxjs';

import { AppStateService, AuthService } from "../../services";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  subscriptions = new Array<Subscription>();

  isAuthenticated = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private appState: AppStateService
  ) { }

  ngOnInit(): void {
    this.subscriptions.push(
      this.appState.isAuthenticated$
        .subscribe(isAuthenticated => {
          this.isAuthenticated = isAuthenticated;
          if(isAuthenticated){
            this.router.navigate(['map']);
          }
        })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(x => x.unsubscribe());
    this.subscriptions = [];
  }

  login(): void {
    this.authService.login();
  }

}
