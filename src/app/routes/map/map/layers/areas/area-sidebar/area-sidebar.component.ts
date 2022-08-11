import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";

import {
  AreasProcessorService,
  IAreaTypeNameById,
  ISelectedArea,
  MapStateService,
  SelectedItemsService
} from "../../../../services";
import { Subscription } from "rxjs";
import { collectAreasByTypeId, IAreaCounts } from "../collect-areas-by-type-id.helper";
import { SelectedItemName } from "../../../../../../model";

@Component({
  selector: 'app-area-sidebar',
  templateUrl: './area-sidebar.component.html',
  styleUrls: ['./area-sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AreaSidebarComponent implements OnInit {
  sidebarVisible = false;
  subscriptions = new Array<Subscription>();
  area: ISelectedArea | null;
  areaCounts: IAreaCounts[] = [];
  isInitRevenueTable: boolean = false;
  areaTypes: IAreaTypeNameById | null;

  public isNotEmptyChildren = false;

  constructor(public mapState: MapStateService,
    private areasProcessorService: AreasProcessorService,
    private selectedItemsService: SelectedItemsService) {
  }

  ngOnInit(): void {
    this.subscriptions.push(
      this.mapState.sidebarVisible$
        .subscribe(visible => this.sidebarVisible = visible === 'area')
    );


    this.subscriptions.push(
      this.selectedItemsService.items$
        .subscribe(items => {
          if (!items.zone?.item) {
            this.area = null;
          }
          this.area = items.area?.item || null;

          if (!!this.area) {
            this.areasProcessorService.getTypes().subscribe((res) => {
              this.areaTypes = res;
              this.areaCounts = collectAreasByTypeId(this.area);
              this.checkChildren();
            });
          }
        })
    );
  }

  mapView(): void {
    this.mapState.selectAreaOnMap(this.area);
  }

  close() {
    this.mapState.closeSidebar();
  }

  openZone(zoneId: number) {
    this.mapState.selectEntityOnMap(SelectedItemName.Zone, zoneId);
  }

  private checkChildren() {
    this.isNotEmptyChildren = !!this.areaCounts.find((area) => this.areaTypes && !!this.areaTypes[area.typeId]);
  }


}
