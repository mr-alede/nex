import { Injectable, Inject } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AppConfigurationService } from '../services/app-config.service';
import { AppStateService } from '../services';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {
    constructor(private configuration: AppConfigurationService, private appState: AppStateService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        let url = request.url;
        if (!url.startsWith('http')) {
            if (url.startsWith('{FRONTEND_API}')) {
                url = url.replace('{FRONTEND_API}', `${this.configuration.frontendApiUrl}/${this.appState.currentCity?.Code}`);
            } else {
                url = `${this.configuration.apiUrl}/${url}`;
            }
        }

        let headers: {
            [name: string]: string;
        } = {};

        let ignoreContentType =
            typeof request.body === 'undefined'
            || request.body === null
            || request.body.toString() === '[object FormData]'
            || request.headers.has('Content-Type');

        if (!ignoreContentType) {
            headers['content-type'] = 'application/json; charset=utf-8';
        }

        request = request.clone({
            url: url,
            setHeaders: headers
        });

        return next.handle(request);
    }
}
