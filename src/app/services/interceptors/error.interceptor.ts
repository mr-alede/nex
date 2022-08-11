import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest, HttpEvent, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { AppNotificationsService } from '../../system';
import { AppConfigurationService } from '../services';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    private _exclusions: Array<{ name: string, checker: (url: string) => boolean }> = [
        { name: 'telemetry', checker: url => url.endsWith('/telemetry') },
        { name: 'camera/state', checker: url => url.indexOf('/camera') > -1 && url.endsWith('/state') },
        { name: 'camera/snapshot', checker: url => url.indexOf('/camera') > -1 && url.endsWith('/snapshot') }
    ];

    constructor(
        private notifications: AppNotificationsService,
        private appConfiguration: AppConfigurationService,
        private router: Router) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request)
            .pipe(
                catchError(err => this.catchApiError(err, next))
            );
    }

    private catchApiError = (response: HttpResponse<any>, next: HttpHandler): Observable<any> => {
        let error: HttpErrorResponse | null = null;

        if (response instanceof HttpErrorResponse) {
            error = <HttpErrorResponse>response;
        } else {
            return throwError(response);
        }

        if (error.status === 401) { // if not authenticated
        } else if (error.status === 404) {
            let urlString = this.getResponseUrl(response);
            let errorMessage = `Resource '${urlString}' not found.`;
            if (!this.skipErrorMessage(urlString)) {
                this.notifications.error(errorMessage);
            }
        } else if (error.status === 0) {
            console.log('RESPONSE ERROR STATUS 0.', error);
        } else {
            console.log(error)

            let errorMessage = error.error.detail || error.statusText;
            if (!!error.error.errors) {
                let errors = Object.getOwnPropertyNames(error.error.errors).map(x => error?.error.errors[x]);
                errorMessage = errors[0] || errorMessage;
            }

            this.notifications.error(errorMessage);
        }

        return throwError(response);
    }

    private getResponseUrl(response: HttpResponse<any> | HttpErrorResponse): string | null {
        let urlString: string | null = response.url;
        return urlString
            ?.replace(this.appConfiguration.apiUrl, '')
            ?.replace(this.appConfiguration.frontendApiUrl, '') || null;
    }

    private skipErrorMessage(url: string | null): boolean {
        if (!url) { return false; }

        return this._exclusions.find(x => x.checker(url)) !== undefined;
    }
}
