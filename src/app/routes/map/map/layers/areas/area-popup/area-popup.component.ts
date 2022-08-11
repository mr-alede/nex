import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { SelectedItemName } from "../../../../../../model";
import { IAreaTypeNameById, ISelectedArea, MapStateService } from "../../../../services";
import { collectAreasByTypeId, IAreaCounts } from "../collect-areas-by-type-id.helper";

@Component({
  selector: 'app-area-popup',
  templateUrl: './area-popup.component.html',
  styleUrls: ['./area-popup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AreaPopupComponent {
  private _area: ISelectedArea | null;

  public isNotEmptyChildren = false;
  public areaCounts: IAreaCounts[] = [];

  @Input() set area(value: ISelectedArea | null) {
    this._area = value;
    this.areaCounts = collectAreasByTypeId(this._area);
    this.checkChildren();
  }

  @Input() areaTypes: IAreaTypeNameById | null;

  get area(): ISelectedArea | null {
    return this._area;
  }

  constructor(public mapState: MapStateService) {
  }

  subDistrictClick(areaId: number, typeId: number): void {
    this.mapState.selectEntityOnMap(SelectedItemName.Area, areaId, typeId)
  }

  moreInfo(): void {
    this.mapState.openSidebar('area');
  }

  openZone(zoneId: number) {
    this.mapState.selectEntityOnMap(SelectedItemName.Zone, zoneId);
  }

  private checkChildren() {
    this.isNotEmptyChildren = !!this.areaCounts.find((area) => this.areaTypes && !!this.areaTypes[area.typeId]);
  }


}
