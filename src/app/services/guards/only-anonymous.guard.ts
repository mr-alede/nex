import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { MsalService } from "@azure/msal-angular";

import { map, tap, zip } from "rxjs";

import { DEFAULT_SIGNEDIN_ROUTE } from "../../constants";

import { AppStateService } from "../services";

@Injectable()
export class OnlyAnonymousGuard implements CanActivate {
    constructor(
        private router: Router,
        private msalService: MsalService,
        private appStateService: AppStateService) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return this.appStateService.currentCity$
            .pipe(
                tap(city => {
                    if (!!city) {
                        this.router.navigate([DEFAULT_SIGNEDIN_ROUTE]);
                    }
                }),
                map(city => !city)
            );
    }
}