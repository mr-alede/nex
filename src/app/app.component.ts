import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import { EventMessage, EventType, InteractionStatus } from '@azure/msal-browser';
import { filter, finalize, map, mergeMap, Subject, takeUntil, tap } from 'rxjs';

import { DEFAULT_ANONYMOUS_ROUTE } from './constants';

import { AppStateService, AuthService, CitiesService, IUserProfile } from './services';
import { FullScreenModalService, IFullScreenModalData } from "./shared/services/full-screen-modal.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  private readonly _destroying$ = new Subject<void>();

  title = 'NexCity';
  isSignedIn = false;
  busy = true;
  navSidebar = false;
  fullScreenModalData: IFullScreenModalData | null = null;

  constructor(
    private authService: MsalService,
    private appAuthService: AuthService,
    private msalBroadcastService: MsalBroadcastService,
    private appState: AppStateService,
    private citiesService: CitiesService,
    private router: Router,
    private fullScreenModalService: FullScreenModalService,
    private activatedRoute: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.busy = true;

    this.appState.userProfile$
      .pipe(takeUntil(this._destroying$))
      .subscribe((userProfile: IUserProfile | null) => {
        this.isSignedIn = !!userProfile;
      });

    this.appState.currentCity$
      .subscribe(city => {
        if (!!city && this.router.url.indexOf('reports') > 1) {
          this.router.navigateByUrl(this.router.url);
        }
      });

    this.authService.instance.enableAccountStorageEvents();

    this.msalBroadcastService.msalSubject$
      .pipe(
        tap(x => console.log(x, this.authService.instance.getAllAccounts())),
        filter((msg: EventMessage) => msg.eventType === EventType.ACCOUNT_ADDED
          || msg.eventType === EventType.ACCOUNT_REMOVED
          || msg.eventType === EventType.LOGIN_SUCCESS)
      )
      .subscribe(() => {
        this.setProfile();
      }, err => this.busy = false);

    this.msalBroadcastService.msalSubject$
      .pipe(
        filter((msg: EventMessage) => msg.eventType === EventType.ACQUIRE_TOKEN_FAILURE),
        mergeMap(x => this.appAuthService.logout())
      )
      .subscribe(() => {
        this.router.navigate([DEFAULT_ANONYMOUS_ROUTE]);
        this.busy = false;
      });

    this.msalBroadcastService.inProgress$
      .pipe(
        filter((status: InteractionStatus) => status === InteractionStatus.None),
        takeUntil(this._destroying$)
      )
      .subscribe(() => {
        this.checkAndSetActiveAccount();
        this.setProfile();
      }, err => this.busy = false);

    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.activatedRoute),
        map(route => {
          while (route.firstChild && route.snapshot.url.length === 0) { route = route.firstChild; }
          return route;
        }),
        filter(route => route.outlet === 'primary'),
        mergeMap(route => route.data)
      )
      .subscribe(data => {
        this.navSidebar = !!data.navSidebar;
      });

    this.fullScreenModalService.modalData$
      .pipe(takeUntil(this._destroying$))
      .subscribe((data) => {
        this.fullScreenModalData = data;
      })

    this.setProfile();
  }

  ngOnDestroy(): void {
    this._destroying$.next(undefined);
    this._destroying$.complete();
  }

  private setProfile() {
    if (this.authService.instance.getAllAccounts().length > 0) {
      const account = this.authService.instance.getAllAccounts()[0];

      this.appState.onSignIn({
        email: account.username,
        name: account.name
      });

      this.citiesService.getAll()
        .pipe(finalize(() => this.busy = false),)
        .subscribe(cities => {
          if (cities.length > 0) {
            this.appState.setAvailableCities(cities);
            this.appState.setCity(cities[0]);
          } else {
            this.appState.setAvailableCities([]);
            this.appState.setCity(null);
          }
        });
    } else {
      this.appState.onSignOut();
      this.busy = false;
    }
  }

  private checkAndSetActiveAccount() {
    /**
     * If no active account set but there are accounts signed in, sets first account to active account
     * To use active account set here, subscribe to inProgress$ first in your component
     * Note: Basic usage demonstrated. Your app may require more complicated account selection logic
     */
    let activeAccount = this.authService.instance.getActiveAccount();

    if (!activeAccount && this.authService.instance.getAllAccounts().length > 0) {
      let accounts = this.authService.instance.getAllAccounts();
      this.authService.instance.setActiveAccount(accounts[0]);
    }
  }
}
