import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';
import { delay, map, timeout } from 'rxjs/operators';

import { GeoRect } from '../../model';
import { Utils } from '../utils';

export interface IRevenueSum {
    [key: string]: number;
}

export interface IParkingMeterRevenue {
    yearRevenue: number;
    prevMonthRevenue: number;
    currentMonthRevenue: number;
    todayRevenue: number;
};

type RevenueResponse = { parkingMetersRevenue: Array<{ parkingMeterId: string, revenue: number }> };


@Injectable({
    providedIn: 'root'
})
export class RevenueTransactionsService {

    constructor(private _httpClient: HttpClient) {
    }

    getRevenueSummary(rect: GeoRect, start: Date, end: Date): Observable<IRevenueSum> {
        let parameters = Utils.GetParams(rect);
        parameters = parameters.append('start', Utils.dateToString(start));
        parameters = parameters.append('end', Utils.dateToString(end));

        return this._httpClient.get<RevenueResponse>('RevenueTransaction/sum', {
            params: parameters
        })
            .pipe(
                map(res => this.toObject(res))
            );
    }

    getParkingMeterRevenueSummary(parkingMeterId: number): Observable<IParkingMeterRevenue> {
        let parameters = new HttpParams();
        parameters = parameters.append('ParkingMeterId', parkingMeterId.toString());

        return this._httpClient.get<IParkingMeterRevenue>('RevenueTransaction/sum/meter', {
            params: parameters
        });
    }

    private toObject(data: RevenueResponse): IRevenueSum {
        const items = data.parkingMetersRevenue;
        const res: IRevenueSum = {};
        for (let i = 0; i < items.length; ++i) {
            const item = items[i];
            res[item.parkingMeterId] = item.revenue;
        }

        return res;
    }
}
