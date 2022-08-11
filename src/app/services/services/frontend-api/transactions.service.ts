import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { map, Observable, tap } from 'rxjs';
import { IEntityBase } from './entity-base';

export enum PaymentMethod {
  Unknown = 'Unknown',
  Cash = 'Cash',
  CreditDebitCard = 'CreditDebitCard',
  CashAndCreditDebitCard = 'CashAndCreditDebitCard',
  SmartCard = 'SmartCard',
  PayByCell = 'PayByCell',
  RemotePBP = 'RemotePBP',
  TechCard = 'TechCard',
}

export enum MeterEventType {
  Unknown = "Unknown",
  NewSession = "NewSession",
  AdditionalTime = "AdditionalTime",
  StatusChange = "StatusChange",
}

export interface ITransaction extends IEntityBase {
  PaymentMethod: PaymentMethod;
  MeterEventType: MeterEventType;
  SessionStart: Date;
  SessionEnd: Date | null;
  GrossPaid: number;
}

@Injectable({
  providedIn: 'root',
})
export class TransactionsService {
  constructor(private _httpClient: HttpClient) {}

  getTopMeterTransactions(meterId: number): Observable<Array<ITransaction>> {
    return this._httpClient
      .get<Array<ITransaction>>(
        `{FRONTEND_API}/transaction/by-meter?id=${meterId}`
      )
      .pipe(
        map((res) => (!res ? [] : res)),
        tap((items) =>
          items.forEach((x) => {
            x.SessionStart = new Date(x.SessionStart);
            x.SessionEnd = !!x.SessionEnd ? new Date(x.SessionEnd) : null;
          })
        )
      );
  }
}
