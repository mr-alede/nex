import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { IArea } from "../../../../../../services";
import { AreasProcessorService, ISelectedOffstreetZone, MapStateService } from "../../../../services";

@Component({
  selector: 'app-offstreet-zones-popup',
  templateUrl: './offstreet-zones-popup.component.html',
  styleUrls: ['./offstreet-zones-popup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class OffstreetZonesPopupComponent {
  constructor(public mapStateService: MapStateService, private areasProcessor: AreasProcessorService) {
  }
  _offstreetZone: ISelectedOffstreetZone | null;
  @Input() set offstreetZone(value: ISelectedOffstreetZone | null) {
    this._offstreetZone = value;
  }

  moreInfo(): void {
    this.mapStateService.openSidebar('offstreet-zone');
  }
  areaClick(area: IArea | undefined) {
    this.mapStateService.selectAreaOnMap(area, true);
  }
}
