import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

import { ISelectedCamera, MapStateService } from '../../../../services';
import { CameraStatus } from '../../../../../../model';

@Component({
  selector: 'app-camera-popup',
  templateUrl: './camera-popup.component.html',
  styleUrls: ['./camera-popup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CameraPopupComponent {
  private _camera: ISelectedCamera | null;
  get camera(): ISelectedCamera | null {
    return this._camera;
  }
  @Input() set camera(value: ISelectedCamera | null) {
    this._camera = value;
    this.pictureUrl = !!value ? `{FRONTEND_API}/camera/${this.camera?.Id}/snapshot` : null;
  }

  pictureUrl: string | null = null;

  cameraStatus = CameraStatus;

  constructor(
    public mapStateService: MapStateService) { }

  openZone() {

  }

  moreInfo() {
    this.mapStateService.openSidebar('camera');
  }
}