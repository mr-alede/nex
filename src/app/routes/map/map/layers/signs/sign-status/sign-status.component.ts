import { Component, Input } from '@angular/core';

import { SignStatus } from '../../../../../../model';

@Component({
  selector: 'app-sign-status',
  templateUrl: './sign-status.component.html',
  styleUrls: ['./sign-status.component.scss']
})
export class SignStatusComponent {
  @Input() status: SignStatus | null | undefined;
  signStatus = SignStatus;
  constructor() { }
}
