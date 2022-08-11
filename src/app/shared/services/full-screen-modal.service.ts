import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from "rxjs";

export interface IFullScreenModalData {
  VideoUrl: string | null;
  PictureUrl: string | null;
  ActualUrl: string | null;
}

@Injectable({ providedIn: 'root' })
export class FullScreenModalService {
  public _modalData$ = new BehaviorSubject<IFullScreenModalData | null>(null)
  public _returnedData$ = new BehaviorSubject<IFullScreenModalData | null>(null)
  public _busy$ = new BehaviorSubject<boolean>(false)


  get modalData$():Observable<IFullScreenModalData | null> {
    return this._modalData$.asObservable();
  }

  get busy$():Observable<boolean> {
    return this._busy$.asObservable();
  }

  setBusy(busyFlag: boolean){
    this._busy$.next(busyFlag);
  }

  openFullScreenModal$(data: IFullScreenModalData): Observable<IFullScreenModalData | null> {
    this._modalData$.next(data);
    this._returnedData$.next(null);
    return this._returnedData$.asObservable();
  }

  closeFullScreenModal(data: IFullScreenModalData) {
    this._modalData$.next(null);
    this._returnedData$.next(data);
  }

}
