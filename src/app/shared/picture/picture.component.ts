import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-picture',
  templateUrl: './picture.component.html',
  styleUrls: ['./picture.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PictureComponent {
  private _url: string | null | undefined;

  get url(): string | null | undefined {
    return this._url;
  }
  @Input() set url(value: string | null | undefined) {
    this._url = value;
  }

  constructor() {
  }
}
