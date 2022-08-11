import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-geo-coordinates',
  templateUrl: './geo-coordinates.component.html',
  styleUrls: ['./geo-coordinates.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GeoCoordinatesComponent {
  private _coordinates: [number, number] | null | undefined;
  get coordinates(): [number, number] | null | undefined {
    return this._coordinates;
  }
  @Input() set coordinates(value: [number, number] | null | undefined) {
    this._coordinates = value;
  }

  constructor() {
  }
}
