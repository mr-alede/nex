import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { ISelectedZone, MapStateService } from '../../../../services';
import {
  AppConfigurationService,
  FrontendApiCamerasService,
  ICameraState,
  ICameraStateWithPictureUrl,
  ICameraWithSpots,
  ISignState,
  ISignStateWithPictureUrl,
  ISpotState,
  SignsService,
} from "../../../../../../services";
import { forkJoin, map, Observable } from "rxjs";
import { CameraStatus, SignStatus, SpotCalculator, SelectedItemName } from "../../../../../../model";

@Component({
  selector: 'app-zone-popup',
  templateUrl: './zone-popup.component.html',
  styleUrls: ['./zone-popup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})


export class ZonePopupComponent {
  spotsStatesWithAttachmentCamera: Array<ISpotState> = [];
  spotsIdsWithoutCameras: Array<number> = [];
  cameraStatesWithPictureUrl$: Observable<ICameraStateWithPictureUrl[]>;
  signsWithPictureUrl$: Observable<ISignStateWithPictureUrl[]>;
  camerasObs: Array<Observable<ICameraState>> | null
  signsObs: Array<Observable<ISignState>> | null

  cameraStstus = CameraStatus;

  private _zone: ISelectedZone | null;

  @Input() set zone(value: ISelectedZone | null) {
    this._zone = value;
    this.collectDataForView(value);
  }

  get zone(): ISelectedZone | null {
    return this._zone;
  }

  public signStatus = SignStatus;

  spotsCountsByState: { vacant: number, occupied: number, booked: number } = { vacant: 0, occupied: 0, booked: 0 };

  constructor(public mapState: MapStateService,
    private appConfig: AppConfigurationService,
    private signsService: SignsService,
    private camerasService: FrontendApiCamerasService) { }


  openArea() {
    this.mapState.selectAreaOnMap(this.zone?.area, true);
  }

  openMeter(id: number) {
    this.mapState.selectEntityOnMap(SelectedItemName.Meter, id)
  }

  openCamera(cameraId: number) {
    this.mapState.selectEntityOnMap(SelectedItemName.Camera, cameraId);
  }

  moreInfo() {
    this.mapState.openSidebar('zone');
  }

  private collectDataForView(value: ISelectedZone | null): void {
    if (value) {
      const signsObs: Array<Observable<ISignState>> | null = !!value ? value.signsIds
        .map(id => this.signsService.getSignState(id)) : null;
      const camerasObs: Array<Observable<ICameraState>> | null = !!value ? value.camerasIdsWithSpotIds
        .map(id => this.camerasService.getCameraState(id.CameraId)) : null;

      if (signsObs) {
        this.signsWithPictureUrl$ = forkJoin(signsObs).pipe(map((res: ISignState[]) => {
          return res.map((signState: ISignState) => {
            return {
              SignId: signState.SignId,
              ActiveScreenId: signState.ActiveScreenId,
              LastUpdated: signState.LastUpdated,
              Status: signState.Status,
              PictureUrl: `{FRONTEND_API}/sign/screen/${signState?.ActiveScreenId}`
            }
          })

        }))
      }

      if (camerasObs) {
        this.cameraStatesWithPictureUrl$ = forkJoin(camerasObs).pipe(map((res: ICameraState[]) => {
          return res.map((cameraState: ICameraState) => {
            const spotsIds: number[] | undefined = value.camerasIdsWithSpotIds.find((x: ICameraWithSpots) => x.CameraId === cameraState.CameraId)?.SpotIds;

            return {
              CameraId: cameraState.CameraId,
              LastUpdated: cameraState.LastUpdated,
              Status: cameraState.Status,
              PictureUrl: `{FRONTEND_API}/camera/${cameraState.CameraId}/snapshot`,
              SpotsIds: spotsIds || []
            }
          })
        }))
      }

      if (this.zone?.spotsStates && this.zone?.camerasIdsWithSpotIds) {
        this.spotsStatesWithAttachmentCamera = SpotCalculator.getSpotStatesWithCamera(this.zone?.camerasIdsWithSpotIds, this.zone?.spotsStates)
        this.spotsCountsByState = SpotCalculator.getCountSpotStatuses(this.zone.spotsStates)
        const spotsStatesWithoutCameras = this.zone.spotsStates.filter((x) => !this.spotsStatesWithAttachmentCamera.includes(x))
        this.spotsIdsWithoutCameras = spotsStatesWithoutCameras.map((spotState) => spotState.SpotId)
      }
    }



  }
}
