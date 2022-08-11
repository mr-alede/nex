import { Component, Input } from '@angular/core';

import { CameraStatus } from '../../../../../../model';

@Component({
  selector: 'app-camera-status',
  templateUrl: './camera-status.component.html',
  styleUrls: ['./camera-status.component.scss'],
})
export class CameraStatusComponent {
  @Input() status: CameraStatus | null | undefined;

  cameraStatus = CameraStatus;

  constructor() {}
}
