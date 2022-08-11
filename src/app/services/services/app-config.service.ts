import { Injectable } from '@angular/core';
import { HttpClient, HttpBackend } from '@angular/common/http';

import { tap } from 'rxjs/operators';
import { lastValueFrom } from 'rxjs';

export interface IAppConfiguration {
    api_url: string;
    frontent_api_url: string;
    map: {
        lng: number,
        lat: number,
        style: string,
        mapbox_api_token: string;
    },
    auth: {
        aadClientId: string;
        aadAuthority: string;
    }
}

@Injectable({ providedIn: 'root' })
export class AppConfigurationService {
    private _data!: IAppConfiguration;
    private _promise!: Promise<IAppConfiguration>;
    private _httpClient: HttpClient;

    public get apiUrl(): string {
        let baseUrl: string = this.data.api_url;
        return baseUrl.replace(/\/$/, '');
    }

    public get frontendApiUrl(): string {
        let baseUrl: string = this.data.frontent_api_url;
        return baseUrl.replace(/\/$/, '');
    }

    public get data(): IAppConfiguration {
        return this._data;
    }

    constructor(handler: HttpBackend) {
        this._httpClient = new HttpClient(handler);
    }

    private get originUrl(): string {
        return window.location.origin;
    }

    load(): Promise<IAppConfiguration> {
        if (!this._promise) {
            const path = `${this.originUrl}/appConfiguration.json`;
            let res = this._httpClient.get<IAppConfiguration>(path)
                .pipe(
                    tap(res => {
                        this._data = Object.assign(this._data || {}, res);
                    }, error => {
                        console.log('Failed to load Client configuration', error);
                    })
                );

            this._promise = lastValueFrom(res);
        }

        return this._promise;
    }
}
