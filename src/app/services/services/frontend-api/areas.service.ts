import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { IEntityBase } from "./entity-base";

export interface IAreaPolygon extends IEntityBase {
    TypeId: number;
    Name: string;
    Positions: [number, number][]
}

export interface IArea extends IEntityBase {
    Name: string;
    TypeId: number;
    Descendants: Array<IArea>;
}

export interface IAreaType extends IEntityBase {
    Name: string;
    PluralName: string;
    Level: number;
    Parent: number;
    Descendants: Array<IAreaType>;
}

@Injectable({
    providedIn: 'root'
})
export class AreasService {
    constructor(private _httpClient: HttpClient) {
    }

    get(id: number): Observable<IArea> {
        return this._httpClient.get<IArea>(`{FRONTEND_API}/area/${id}`);
    }

    getAllTypes(): Observable<Array<IAreaType>> {
        return this._httpClient.get<Array<IAreaType>>(`{FRONTEND_API}/area/types`);
    }

    getArea(id?: number): Observable<IArea> {
        return this._httpClient.get<IArea>(`{FRONTEND_API}/area/${id}`);
    }

    getLevelPolygons(LevelId: number): Observable<Array<IAreaPolygon>> {
        return this._httpClient.get<Array<IAreaPolygon>>(`{FRONTEND_API}/Area/polygons/?level=${LevelId}`);
    }
}
