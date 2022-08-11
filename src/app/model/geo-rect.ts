import { LngLatBounds } from "mapbox-gl";

export class GeoRect {
    get swLng(): number { return this.minX; }
    get swLat(): number { return this.minY; }
    get neLng(): number { return this.maxX; }
    get neLat(): number { return this.maxY; }

    constructor(public minX: number, public minY: number, public maxX: number, public maxY: number) { }

    public static fromLngLatBounds(bounds: LngLatBounds): GeoRect {
        const sw = bounds.getSouthWest();
        const ne = bounds.getNorthEast();

        return new GeoRect(
            sw.lng,
            sw.lat,
            ne.lng,
            ne.lat
        );
    }

    toArray(): Array<number> {
        return [this.swLng, this.swLat, this.neLng, this.neLat];
    }
}