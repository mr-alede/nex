import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { SpotsService } from 'src/app/services';

import { OccupancyStatus, SelectedItemName, SpotCalculator } from '../../../../../model';
import { MapStateService } from '../../../services';

@Component({
  selector: 'app-spots',
  templateUrl: './spots.component.html',
  styleUrls: ['./spots.component.scss']
})
export class SpotsComponent {
  private _statuses: Array<{ id: number, occupancy: OccupancyStatus }>;

  private _spots: Array<number>;
  @Input() set spots(value: Array<number> | undefined) {
    this._spots = value || [];
    this.loadStates(this._spots);
  }

  spotStates: Array<{ id: number, color: string }> = [];

  constructor(public mapState: MapStateService,
    private spotsService: SpotsService,
    private cdr: ChangeDetectorRef) { }

  spotClick(spotId: number) {
    this.mapState.selectEntityOnMap(SelectedItemName.Spot, spotId);
  }

  private applyColors() {
    const statuses = this._statuses || [];

    this.spotStates = (this._spots || []).map(s => {
      const status = statuses.find(x => x.id === s);
      return {
        id: s,
        color: SpotCalculator.getColor(status?.occupancy)
      };
    });

    this.cdr.detectChanges();
  }

  private loadStates(spots: Array<number>) {
    this._statuses = [];
    if (spots.length === 0) { return; }

    this.spotsService.getSpotsStates(spots)
      .subscribe(states => {
        this._statuses = (states || []).map(x => ({ id: x.SpotId || 0, occupancy: x.Status }));
        this.applyColors();
      });
  }
}
