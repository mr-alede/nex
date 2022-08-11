import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-panel-collapse',
  templateUrl: './panel-collapse.component.html',
  styleUrls: ['./panel-collapse.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PanelCollapseComponent {
  @Input() header: string;
  @Input() static = false;

  private _expanded: boolean = false;
  @Input() set expanded(value: boolean) {
      this._expanded = value;
      this.expandedChange.emit(value);
  };
  get expanded(): boolean {
    return this._expanded;
  }

  @Output() expandedChange: EventEmitter<boolean> = new EventEmitter();

  constructor() { }

  toggle() {
    if (this.static) {
      return;
    }
    this.expanded = !this.expanded;
  }
}
