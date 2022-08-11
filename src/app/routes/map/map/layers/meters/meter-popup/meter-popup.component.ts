import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MeterType, SelectedItemName } from '../../../../../../model';

import { ISelectedMeter, MapStateService } from '../../../../services';

@Component({
  selector: 'app-meter-popup',
  templateUrl: './meter-popup.component.html',
  styleUrls: ['./meter-popup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MeterPopupComponent {
  @Input() meter: ISelectedMeter | null = null;

  meterType = MeterType;

  constructor(public mapState: MapStateService) { }

  openZone() {
    const zoneId = this.meter?.ZoneId || 0;
    this.mapState.selectEntityOnMap(SelectedItemName.Meter, zoneId);
  }

  moreInfo() {
    this.mapState.openSidebar('meter');
  }
}
