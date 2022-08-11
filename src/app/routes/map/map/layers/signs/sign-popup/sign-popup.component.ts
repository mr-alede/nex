import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

import * as moment from 'moment';

import { ISelectedSign, MapStateService } from '../../../../services';
import { AppConfigurationService } from '../../../../../../services';
import { SignStatus } from '../../../../../../model';

@Component({
  selector: 'app-sign-popup',
  templateUrl: './sign-popup.component.html',
  styleUrls: ['./sign-popup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignPopupComponent {
  private _sign: ISelectedSign | null;
  get sign(): ISelectedSign | null {
    return this._sign;
  }
  @Input() set sign(value: ISelectedSign | null) {
    this._sign = value;
    this.pictureUrl = !!value ? `{FRONTEND_API}/sign/screen/${this.sign?.ActiveScreenId}` : null;
  }

  pictureUrl: string | null = null;
  ledColor: string = 'Green';

  signStatus = SignStatus;

  constructor(public mapStateService: MapStateService, private appConfig: AppConfigurationService) { }

  openZone() {

  }

  moreInfo() {
    this.mapStateService.openSidebar('sign');
  }
}
