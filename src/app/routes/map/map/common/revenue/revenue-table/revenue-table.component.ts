import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { RevenueType } from "src/app/model";
import { IRevenueWithChange } from "../../../../../../services/services/frontend-api/revenue.service";
import { IRevenueItem } from "../../../../../../services/services/frontend-api/zones.service";

@Component({
  selector: 'app-revenue-table',
  templateUrl: 'revenue-table.component.html',
  styleUrls: ['revenue-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class RevenueTableComponent {
  constructor() { }

  private _revenue: Array<IRevenueItem>;
  get revenue(): Array<IRevenueItem> | undefined {
    return this._revenue;
  }
  @Input() set revenue(value: Array<IRevenueItem> | undefined) {
    this._revenue = value || [];

    this.revenueTable = this.revenue?.sort((a, b) => Object.keys(RevenueType).indexOf(a.Period)  - Object.keys(RevenueType).indexOf(b.Period)).map(x => ({
      revenue: x,
      name: x.Period === RevenueType.Day && 'Day'
        || x.Period === RevenueType.Week && 'Week'
        || x.Period === RevenueType.Month && 'Month'
        || x.Period === RevenueType.Quarter && 'Quarter'
        || ''
    })) || [];
  }

  @Input() revenueTable: Array<{ revenue: IRevenueItem, name: string }>;

  public changeCalculator(change: number | null | undefined): string {
    return change ? (change * 100).toFixed(2) : '0';
  }
}
