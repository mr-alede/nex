import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from "@angular/core";
import { ISelectedSpot, MapStateService } from "../../../../services";
import { AreasService, ISignState } from "../../../../../../services";
import { SelectedItemName, SignStatus, SpotTypesCalculator } from "../../../../../../model";

@Component({
  selector: 'app-spot-popup',
  templateUrl: './spot-popup.component.html',
  styleUrls: ['./spot-popup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpotPopupComponent {

  signStatus = SignStatus;
  signState: ISignState;
  _spot: ISelectedSpot | null;

  spotPictureUrl: string | null = null;
  signPictureUrl: string | null = null;
  policyTypeNameAndColor: { name: string, color: string } | null = null

  get spot(): ISelectedSpot | null {
    return this._spot;
  }

  @Input() set spot(value: ISelectedSpot | null) {
    this._spot = value;

    if (!!value) {
      this.spotPictureUrl = value.camera ? `{FRONTEND_API}/spot/${value.Id}/snapshot` : null;
      this.signPictureUrl = value.signState ? `{FRONTEND_API}/Sign/screen/${value.signState.ActiveScreenId}` : null;
      this.policyTypeNameAndColor = SpotTypesCalculator.getPolicyTypeNameAndColor(value.PolicyType);
    }
  }

  constructor(
    private cdRef: ChangeDetectorRef,
    public mapState: MapStateService, public areasService: AreasService) {
  }

  openCamera() {
    const cameraId = this.spot?.camera?.Id || 0;
    this.mapState.selectEntityOnMap(SelectedItemName.Camera, cameraId);
  }

  openZone() {
    const zoneId = this.spot?.zone?.Id || 0;
    this.mapState.selectEntityOnMap(SelectedItemName.Zone, zoneId);
  }

  openArea() {
    const areaId = this.spot?.area?.Id || 0;
    const areaTypeId = this.spot?.area?.TypeId || 0;
    this.mapState.selectEntityOnMap(SelectedItemName.Area, areaId, areaTypeId);
  }

  moreInfo() {
    this.mapState.openSidebar('spot');
  }

  openMeter(id: number) {
    this.mapState.selectEntityOnMap(SelectedItemName.Meter, id)
  }
}
