import { HttpParams } from "@angular/common/http";

export class Utils {
    public static GetParams(object: any): HttpParams {
        let result = new HttpParams();

        if (!object) { return result; }

        const properties = Object.getOwnPropertyNames(object);

        Object.getOwnPropertyNames(object).forEach(name => {
            let value = object[name];

            result = result.set(name, !!value ? value.toString() : null);
        });

        return result;
    }

    public static dateToString(date: Date): string {
        return date.toISOString().substring(0, 10);
    }
}