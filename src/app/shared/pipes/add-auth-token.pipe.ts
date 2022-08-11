import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Pipe, PipeTransform } from '@angular/core';
import { catchError, mergeMap, Observable, of } from 'rxjs';

import { AuthService } from 'src/app/services';

@Pipe({ name: 'appAddAuthToken' })
export class AddAuthTokenPipe implements PipeTransform {
  constructor(private authService: AuthService, private http: HttpClient) {
  }

  transform(src: string | null): Observable<string | null> {
    if (!src) {
      return of(null);
    }

    return this.authService.acquireToken()
      .pipe(
        mergeMap(token => {
          const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
          return this.http.get(src || '', { headers, responseType: 'blob' });
        }),
        mergeMap(imageBlob => {
          const reader = new FileReader();
          return new Observable<string>(observer => {
            reader.onloadend = () => {
              observer.next(reader.result as string);
              observer.complete();
            };

            reader.onerror = error => {
              observer.error(error);
            }

            reader.readAsDataURL(imageBlob);
          })
        }),
        catchError(err => {
          return of(null);
        })
      );
  }
}
