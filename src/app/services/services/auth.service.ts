import { Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { MsalGuardConfiguration, MsalService, MSAL_GUARD_CONFIG } from '@azure/msal-angular';

import { AuthenticationResult, PopupRequest, RedirectRequest, InteractionRequiredAuthError } from '@azure/msal-browser';

import { Observable, catchError, map, tap } from 'rxjs';
import { DEFAULT_SIGNEDIN_ROUTE } from '../../constants';
import { AppStateService } from '.';

@Injectable({ providedIn: 'root' })
export class AuthService {
    constructor(
        private router: Router,
        @Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration,
        private msalService: MsalService,
        private appState: AppStateService) {
    }

    login() {
        this.loginPopup()
            .subscribe(x => {
                this.router.navigate([DEFAULT_SIGNEDIN_ROUTE]);
            });
    }

    logout(popup = true): Observable<void> {
        let result: Observable<void>;

        if (popup) {
            result = this.msalService.logoutPopup({
                mainWindowRedirectUri: "/"
            });
        } else {
            result = this.msalService.logoutRedirect();
        }

        return result.pipe(
            tap(res => {
                this.appState.setAvailableCities([]);
                this.appState.setCity(null);
            })
        )
    }

    public acquireToken(): Observable<string> {
        const account = this.msalService.instance.getAllAccounts()[0];
        const accessTokenRequest = {
            scopes: ["user.read"],
            account: account,
        };

        return this.msalService
            .acquireTokenSilent(accessTokenRequest)
            .pipe(
                map(res => res.accessToken),
                catchError(err => {
                    if (err instanceof InteractionRequiredAuthError) {
                        return this.msalService
                            .acquireTokenPopup(accessTokenRequest)
                            .pipe(
                                map(res => res.accessToken)
                            );
                    }

                    throw err;
                })
            );
    }

    private loginRedirect() {
        if (this.msalGuardConfig.authRequest) {
            this.msalService.loginRedirect({ ...this.msalGuardConfig.authRequest } as RedirectRequest);
        } else {
            this.msalService.loginRedirect();
        }
    }

    private loginPopup(): Observable<AuthenticationResult> {
        if (this.msalGuardConfig.authRequest) {
            return this.msalService.loginPopup({ ...this.msalGuardConfig.authRequest } as PopupRequest)
                .pipe(tap((response: AuthenticationResult) => {
                    this.msalService.instance.setActiveAccount(response.account);
                }));
        } else {
            return this.msalService.loginPopup()
                .pipe(tap((response: AuthenticationResult) => {
                    this.msalService.instance.setActiveAccount(response.account);
                }));
        }
    }
}
