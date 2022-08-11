import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { relativeTimeThreshold } from 'moment';

import { delay, filter, fromEvent, Subscription, take } from 'rxjs';

import { AppStateService, AuthService, ICity, IUserProfile } from '../../services';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  dependencies = new Array<Subscription>();

  userDropDownExpand = false;
  userDropdownSubscription: Subscription | null;

  userProfile: IUserProfile | null;

  cities: Array<ICity> = [];
  city: ICity | null = null;

  constructor(
    private appState: AppStateService,
    private authService: AuthService,
    private router: Router) {

  }

  ngOnInit(): void {
    this.dependencies.push(
      this.appState.userProfile$
        .subscribe(x => this.userProfile = x)
    );

    this.dependencies.push(
      this.appState.cities$
        .subscribe(x => this.cities = x)
    );

    this.dependencies.push(
      this.appState.currentCity$
        .subscribe(x => this.city = x)
    );

    this.dependencies.push(
      this.appState.currentCity$
        .subscribe(x => this.city = x)
    );
  }

  ngOnDestroy(): void {
    this.dependencies.forEach(x => x.unsubscribe());
    this.dependencies = [];
  }

  onCitySelected(city: ICity) {
    this.appState.setCity(city);
  }

  userDropdown($event: Event) {
    $event.preventDefault();
  }

  login($event: Event) {
    $event.preventDefault();
    this.userDropDownExpand = false;

    this.authService.login();
  }

  settings($event: Event) {
    $event.preventDefault();
    this.userDropDownExpand = false;

    this.router.navigate(['/settings']);
  }

  customization($event: Event) {
    $event.preventDefault();
    this.userDropDownExpand = false;
  }

  logout($event: Event, popup = true) {
    $event.preventDefault();
    this.userDropDownExpand = false;

    this.authService.logout()
      .subscribe(res => { });
  }
}
