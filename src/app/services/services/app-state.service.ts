import { Injectable } from '@angular/core';

import { BehaviorSubject, map, Observable } from 'rxjs';
import { ICity } from './frontend-api';

export interface IUserProfile {
    email: string;
    name?: string;
}

@Injectable({ providedIn: 'root' })
export class AppStateService {
    private _userProfile$ = new BehaviorSubject<IUserProfile | null>(null);
    get userProfile$(): Observable<IUserProfile | null> {
        return this._userProfile$.asObservable();
    }

    private _cities$ = new BehaviorSubject<Array<ICity>>([]);
    get cities$(): Observable<Array<ICity>> {
        return this._cities$.asObservable();
    }

    private _currentCity$ = new BehaviorSubject<ICity | null>(null);
    get currentCity$(): Observable<ICity | null> {
        return this._currentCity$.asObservable();
    }
    get currentCity(): ICity | null {
        return this._currentCity$.value;
    }

    get isAuthenticated$(): Observable<boolean> {
        return this._userProfile$.asObservable()
            .pipe(
                map(profile => !!profile)
            );
    }

    constructor() {
    }

    onSignIn(profile: IUserProfile) {
        this._userProfile$.next(profile);
    }

    onSignOut() {
        this._userProfile$.next(null);
    }

    setAvailableCities(cities: Array<ICity>) {
        this._cities$.next(cities);
    }
    setCity(city: ICity | null) {
        this._currentCity$.next(city);
    }
}
