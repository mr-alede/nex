import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { MsalService } from "@azure/msal-angular";

import { map, tap, filter } from "rxjs";

import { AppStateService } from "../services";

@Injectable()
export class TenantGuard implements CanActivate {
    constructor(
        private router: Router,
        private msalService: MsalService,
        private appStateService: AppStateService) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return this.appStateService.currentCity$
            .pipe(
                filter(city => !!city),
                map(city => !!city)
            );
    }
}