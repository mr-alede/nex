
interface ICityIds {
    [cityCode: string]: number;
}

const CITY_IDS: ICityIds = {
    SFC: 1,
    LSV: 2
};

export class ReportsBuilder {
    public static getRevenueReport(cityCode: string | null): string {
        if (!!cityCode) {
            const cityId = CITY_IDS[cityCode];
            return `https://app.powerbi.com/reportEmbed?reportId=883b6312-41ed-4c5d-a0be-03a240feb748&autoAuth=true&ctid=2b42b343-b349-421e-83fc-7f12b246bdbb&$filter=City/CityId%20eq%20${cityId}&config=eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly93YWJpLXVzLW5vcnRoLWNlbnRyYWwtcmVkaXJlY3QuYW5hbHlzaXMud2luZG93cy5uZXQvIn0%3D`;
        } else {
            return `https://app.powerbi.com/reportEmbed?reportId=883b6312-41ed-4c5d-a0be-03a240feb748&autoAuth=true&ctid=2b42b343-b349-421e-83fc-7f12b246bdbb&&config=eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly93YWJpLXVzLW5vcnRoLWNlbnRyYWwtcmVkaXJlY3QuYW5hbHlzaXMud2luZG93cy5uZXQvIn0%3D`;
        }
    }

    public static getRevenueTransactionsReport(cityCode: string | null): string {
        if (!!cityCode) {
            const cityId = CITY_IDS[cityCode];
            return `https://app.powerbi.com/reportEmbed?reportId=28f5178b-8720-4d5a-bd88-27c4e2c0cb1b&autoAuth=true&ctid=2b42b343-b349-421e-83fc-7f12b246bdbb&$filter=City/CityId%20eq%20${cityId}&config=eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly93YWJpLXVzLW5vcnRoLWNlbnRyYWwtcmVkaXJlY3QuYW5hbHlzaXMud2luZG93cy5uZXQvIn0%3D`;
        } else {
            return `https://app.powerbi.com/reportEmbed?reportId=28f5178b-8720-4d5a-bd88-27c4e2c0cb1b&autoAuth=true&ctid=2b42b343-b349-421e-83fc-7f12b246bdbb&&config=eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly93YWJpLXVzLW5vcnRoLWNlbnRyYWwtcmVkaXJlY3QuYW5hbHlzaXMud2luZG93cy5uZXQvIn0%3D`;
        }
    }

    public static getRevenueAnalysisReport(cityCode: string | null): string {
        if (!!cityCode) {
            const cityId = CITY_IDS[cityCode];
            return `https://app.powerbi.com/reportEmbed?reportId=d026edcd-3498-4b2e-97f9-0a137c6aecb5&autoAuth=true&ctid=2b42b343-b349-421e-83fc-7f12b246bdbb&$filter=City/CityId%20eq%20${cityId}&config=eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly93YWJpLXVzLW5vcnRoLWNlbnRyYWwtcmVkaXJlY3QuYW5hbHlzaXMud2luZG93cy5uZXQvIn0%3D`;
        } else {
            return `https://app.powerbi.com/reportEmbed?reportId=d026edcd-3498-4b2e-97f9-0a137c6aecb5&autoAuth=true&ctid=2b42b343-b349-421e-83fc-7f12b246bdbb&&config=eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly93YWJpLXVzLW5vcnRoLWNlbnRyYWwtcmVkaXJlY3QuYW5hbHlzaXMud2luZG93cy5uZXQvIn0%3D`;
        }
    }

    public static getRevenueGridViewReport(cityCode: string | null): string {
        if (!!cityCode) {
            const cityId = CITY_IDS[cityCode];
            return `https://app.powerbi.com/reportEmbed?reportId=599134ff-f7ee-4d7a-bd54-8c6fe9dfe666&autoAuth=true&ctid=2b42b343-b349-421e-83fc-7f12b246bdbb&$filter=City/CityId%20eq%20${cityId}&config=eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly93YWJpLXVzLW5vcnRoLWNlbnRyYWwtcmVkaXJlY3QuYW5hbHlzaXMud2luZG93cy5uZXQvIn0%3D`;
        } else {
            return `https://app.powerbi.com/reportEmbed?reportId=599134ff-f7ee-4d7a-bd54-8c6fe9dfe666&autoAuth=true&ctid=2b42b343-b349-421e-83fc-7f12b246bdbb&&config=eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly93YWJpLXVzLW5vcnRoLWNlbnRyYWwtcmVkaXJlY3QuYW5hbHlzaXMud2luZG93cy5uZXQvIn0%3D`;
        }
    }

    public static getGarageRevenueReport(garageId: string | undefined): string {
        if (!!garageId) {
            return `https://app.powerbi.com/reportEmbed?reportId=c23164b2-aca8-4371-8f22-799cb83ef30a&autoAuth=true&ctid=2b42b343-b349-421e-83fc-7f12b246bdbb&config=eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly93YWJpLXVzLW5vcnRoLWNlbnRyYWwtcmVkaXJlY3QuYW5hbHlzaXMud2luZG93cy5uZXQvIn0%3D&$filter=OffstreetParkingZone/LocationId%20eq%20%27${garageId}%27`;
        }

        return '';
    }

    public static getZoneRevenueReport(zoneId: number | undefined): string {
        if (!!zoneId) {
            return `https://app.powerbi.com/reportEmbed?reportId=883b6312-41ed-4c5d-a0be-03a240feb748&autoAuth=true&ctid=2b42b343-b349-421e-83fc-7f12b246bdbb&config=eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly93YWJpLXVzLW5vcnRoLWNlbnRyYWwtcmVkaXJlY3QuYW5hbHlzaXMud2luZG93cy5uZXQvIn0%3D&$filter=ParkingZone/ParkingZoneId%20eq%20${zoneId}`;
        }

        return '';
    }

    public static getMeterRevenueReport(meterId: number | undefined): string {
        if (!!meterId) {
            return `https://app.powerbi.com/reportEmbed?reportId=883b6312-41ed-4c5d-a0be-03a240feb748&autoAuth=true&ctid=2b42b343-b349-421e-83fc-7f12b246bdbb&config=eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly93YWJpLXVzLW5vcnRoLWNlbnRyYWwtcmVkaXJlY3QuYW5hbHlzaXMud2luZG93cy5uZXQvIn0%3D&$filter=ParkingMeter/ParkingMeterId%20eq%20${meterId}`;
        }

        return '';
    }

    public static getAreaRevenueReport(cityCode: string | null): string {
        if (!!cityCode) {
            const cityId = CITY_IDS[cityCode];
            return `https://app.powerbi.com/reportEmbed?reportId=883b6312-41ed-4c5d-a0be-03a240feb748&autoAuth=true&ctid=2b42b343-b349-421e-83fc-7f12b246bdbb&config=eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly93YWJpLXVzLW5vcnRoLWNlbnRyYWwtcmVkaXJlY3QuYW5hbHlzaXMud2luZG93cy5uZXQvIn0%3D&$filter=City/CityId%20eq%20${cityId}`;
        } else {
            return `https://app.powerbi.com/reportEmbed?reportId=883b6312-41ed-4c5d-a0be-03a240feb748&autoAuth=true&ctid=2b42b343-b349-421e-83fc-7f12b246bdbb&config=eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly93YWJpLXVzLW5vcnRoLWNlbnRyYWwtcmVkaXJlY3QuYW5hbHlzaXMud2luZG93cy5uZXQvIn0%3D&`;
        }
    }

    public static getCameraOverview(cityCode: string | undefined): string {
        if (!!cityCode) {
            const cityId = CITY_IDS[cityCode];
            return `https://app.powerbi.com/reportEmbed?reportId=44efb717-c1c2-45ca-9ce0-57e15453bedf&autoAuth=true&ctid=2b42b343-b349-421e-83fc-7f12b246bdbb&config=eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly93YWJpLXVzLW5vcnRoLWNlbnRyYWwtcmVkaXJlY3QuYW5hbHlzaXMud2luZG93cy5uZXQvIn0%3D&$filter=Parking/City%20eq%20%27${cityId}%27`;
        }

        return '';
    }

    public static getCameraGridView(cityCode: string | undefined): string {
        if (!!cityCode) {
            const cityId = CITY_IDS[cityCode];
            return `https://app.powerbi.com/reportEmbed?reportId=8202a618-3d85-4a19-b861-0971725371e9&autoAuth=true&ctid=2b42b343-b349-421e-83fc-7f12b246bdbb&config=eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly93YWJpLXVzLW5vcnRoLWNlbnRyYWwtcmVkaXJlY3QuYW5hbHlzaXMud2luZG93cy5uZXQvIn0%3D&$filter=Parking/City%20eq%20%27${cityId}%27`;
        }

        return '';
    }

    public static getMeterTransactionsReport(meterId: number | undefined): string {
        if (!!meterId) {
            return `https://app.powerbi.com/reportEmbed?reportId=599134ff-f7ee-4d7a-bd54-8c6fe9dfe666&autoAuth=true&ctid=2b42b343-b349-421e-83fc-7f12b246bdbb&config=eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly93YWJpLXVzLW5vcnRoLWNlbnRyYWwtcmVkaXJlY3QuYW5hbHlzaXMud2luZG93cy5uZXQvIn0%3D&$filter=ParkingMeter/ParkingMeterId%20eq%20${meterId}`;
        }

        return '';
    }
}