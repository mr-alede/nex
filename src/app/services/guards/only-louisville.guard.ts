import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";

import { map, tap } from "rxjs";

import { AppStateService } from "../services";

@Injectable()
export class OnlyLouisvilleGuard implements CanActivate {
    constructor(private router: Router, private appStateService: AppStateService) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return this.appStateService.currentCity$
            .pipe(
                tap(city => {
                    if (city?.Code !== 'LSV') {
                        this.router.navigateByUrl('/reports');
                    }
                }),
                map(city => city?.Code === 'LSV')
            );
    }
}