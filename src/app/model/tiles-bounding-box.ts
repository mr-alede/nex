import { LngLatBounds } from "mapbox-gl";

export interface ITile {
    x: number;
    y: number;
}

export class TilesBoundingBox {
    private _left: number; // X top-left corner
    private _top: number; // Y top-left corner

    private _right: number; // X bottom-right corner
    private _bottom: number; // Y bottom-right corner

    private _tiles: Array<ITile> | null = null;
    private _zoom: number;

    get left(): number { return this._left; }
    get top(): number { return this._top; }
    get right(): number { return this._right; }
    get bottom(): number { return this._bottom; }
    get zoom(): number { return this._zoom; }

    get key(): string { return `${this._left}-${this._top}-${this._right}-${this._bottom}`; }

    constructor(bounds: LngLatBounds, zoom: number) {
        this._zoom = Math.ceil(zoom);

        this._top = this.lat2tile(bounds.getNorth(), this._zoom);
        this._left = this.lng2tile(bounds.getWest(), this._zoom);
        this._bottom = this.lat2tile(bounds.getSouth(), this._zoom);
        this._right = this.lng2tile(bounds.getEast(), this._zoom);
    }

    getTiles(): Array<ITile> {
        if (this._tiles !== null) { return this._tiles; }

        const result = new Array<ITile>();
        for (let x = this._left; x <= this._right; x++) {
            for (let y = this._top; y <= this._bottom; y++) {
                result.push({ x, y });
            }
        }

        this._tiles = result;
        return result;
    }

    equalsTo(other: TilesBoundingBox): boolean {
        return this._left === other.left && this._top === other.top && this._right === other.right && this._bottom === other.bottom;
    }

    lng2tile(lng: number, zoom: number): number {
        return (Math.floor((lng + 180) / 360 * Math.pow(2, zoom)));
    }

    lat2tile(lat: number, zoom: number): number {
        return (Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom)));
    }
}