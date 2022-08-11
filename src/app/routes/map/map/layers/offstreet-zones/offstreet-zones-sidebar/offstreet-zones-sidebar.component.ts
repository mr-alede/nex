import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import { ISelectedOffstreetZone, MapStateService, SelectedItemsService } from "../../../../services";
import { IArea } from "../../../../../../services";
import { SelectedItemName } from "../../../../../../model";

@Component({
  selector: 'app-offstreet-zones-sidebar',
  templateUrl: 'offstreet-zones-sidebar.component.html',
  styleUrls: ['offstreet-zones-sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class OffstreetZonesSidebarComponent implements OnInit, OnDestroy {
  subscriptions = new Array<Subscription>();
  sidebarVisible = false;

  public offstreetZone: ISelectedOffstreetZone | null;

  constructor(public mapStateService: MapStateService,
    private selectedItemsService: SelectedItemsService) {
  }

  ngOnInit(): void {
    this.subscriptions.push(
      this.mapStateService.sidebarVisible$
        .subscribe(visible => this.sidebarVisible = visible === 'offstreet-zone')
    );

    this.subscriptions.push(
      this.selectedItemsService.items$
        .subscribe(items => {
          this.offstreetZone = items.offstreetZone?.item || null;
        })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(x => x.unsubscribe());
    this.subscriptions = [];
  }

  mapView(): void {
    const id = this.offstreetZone?.Id || 0;
    this.mapStateService.selectEntityOnMap(SelectedItemName.OffstreetZone, id);
  }

  close() {
    this.mapStateService.closeSidebar();
  }

  areaClick(area: IArea | undefined) {
    this.mapStateService.selectAreaOnMap(area, true);
  }
}
