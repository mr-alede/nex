import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { forkJoin, map, Observable, Subscription } from 'rxjs';
import { ISelectedZone, MapStateService, SelectedItemsService } from '../../../../services';
import {
  AppConfigurationService, AreasService,
  FrontendApiCamerasService,
  ICameraState, ICameraStateWithPictureUrl, ICameraWithSpots,
  ISignState,
  ISignStateWithPictureUrl, ISpotState,
  SignsService
} from '../../../../../../services';
import { ZonesService } from "../../../../../../services/services/frontend-api/zones.service";
import { CameraStatus, SelectedItemName, SignStatus, SpotCalculator } from "../../../../../../model";

@Component({
  selector: 'app-zone-sidebar',
  templateUrl: './zone-sidebar.component.html',
  styleUrls: ['./zone-sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ZoneSidebarComponent implements OnInit, OnDestroy {
  spotsIdsWithoutCameras: Array<number> = [];
  spotsStatesWithAttachmentCamera: Array<ISpotState> = [];
  cameraStatesWithPictureUrl$: Observable<ICameraStateWithPictureUrl[]>;
  signsWithPictureUrl$: Observable<ISignStateWithPictureUrl[]>;
  camerasObs: Array<Observable<ICameraState>> | null;
  signsObs: Array<Observable<ISignState>> | null;

  cameraStatus = CameraStatus;
  signStatus = SignStatus;

  signsWithPictureUrl: ISignStateWithPictureUrl[] = [];
  camerasStates: Array<ICameraState> = [];
  signsStates: Array<ISignState> = [];

  sidebarVisible = false;
  popupVisible = false;
  subscriptions = new Array<Subscription>();
  cameraStatesWithPictureUrl: ICameraStateWithPictureUrl[] = []

  zone: ISelectedZone | null = null;

  spotsCountsByState: { vacant: number, occupied: number, booked: number } = { vacant: 0, occupied: 0, booked: 0 };

  constructor(
    public mapState: MapStateService,
    private selectedItemsService: SelectedItemsService,
    private zonesService: ZonesService,
    private areasService: AreasService,
    private appConfig: AppConfigurationService,
    private signsService: SignsService,
    private camerasService: FrontendApiCamerasService) { }

  ngOnInit(): void {
    this.subscriptions.push(
      this.mapState.sidebarVisible$
        .subscribe(visible => this.sidebarVisible = visible === 'zone')
    );

    this.subscriptions.push(
      this.selectedItemsService.items$
        .subscribe(items => {
          if (!items.zone?.item) {
            this.zone = null;
          }
          this.zone = items.zone?.item || null;

          if (!!this.zone) {
            this.collectDataForView(this.zone);
          }

        })
    );

  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(x => x.unsubscribe());
    this.subscriptions = [];
  }

  close() {
    this.mapState.closeSidebar();
  }

  mapView() {
    const zoneId = this.zone?.Id || 0;
    this.mapState.selectEntityOnMap(SelectedItemName.Zone, zoneId);
  }

  openCamera(cameraId: number) {
    this.mapState.selectEntityOnMap(SelectedItemName.Camera, cameraId);
  }

  openArea() {
    this.mapState.selectAreaOnMap(this.zone?.area, true);
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
