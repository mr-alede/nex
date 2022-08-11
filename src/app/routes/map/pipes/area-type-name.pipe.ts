import { PipeTransform, Pipe } from '@angular/core';
import { map, Observable, of } from 'rxjs';

import { IArea } from '../../../services';
import { AreasProcessorService } from '../services';

@Pipe({ name: 'areaTypeName' })
export class AreaTypeNamePipe implements PipeTransform {
    constructor(private areasProcessor: AreasProcessorService) {
    }

    transform(area: IArea | undefined): Observable<string | null> {
        if (!area) {
            return of(null);
        }

        return this.areasProcessor.getTypes()
            .pipe(
                map(types => types[area.TypeId]),
                map(x => x?.name)
            );
    }
}
