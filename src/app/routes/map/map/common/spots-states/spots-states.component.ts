import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { ISpotState } from "../../../../../services";

@Component({
  selector: 'app-spots-states',
  templateUrl: 'spots-states.component.html',
  styleUrls: ['spots-states.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class SpotsStatesComponent {
  private _spotsStates: ISpotState[]
  @Input() set spotsStates(value: ISpotState[] | undefined) {
    this._spotsStates = value || [];
  }

  get spotsStates() {
    return this._spotsStates;
  }

  constructor() {
  }
}
