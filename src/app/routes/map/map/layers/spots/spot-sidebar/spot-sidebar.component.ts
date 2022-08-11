import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { finalize, Subscription } from 'rxjs';
import { ISelectedSpot, MapStateService, SelectedItemsService } from '../../../../services';
import { FrontendApiCamerasService, ICameraEvent, IScheduleItem } from '../../../../../../services';
import { DayOfWeekId, SelectedItemName, SignStatus, SpotPolicyType, SpotTypesCalculator, WeekDaysSchedule } from "../../../../../../model";
import * as moment from "moment";
import * as underscore from "underscore";

@Component({
  selector: 'app-spot-sidebar',
  templateUrl: './spot-sidebar.component.html',
  styleUrls: ['./spot-sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpotSidebarComponent implements OnInit, OnDestroy {
  event: ICameraEvent | null = null;
  eventDuration: number;
  eventsPanelExpanded = false;
  busy = false;
  geoPositions: string[] = [];

  weekDaysSchedule: typeof WeekDaysSchedule = WeekDaysSchedule;
  spotTypesCalculator: typeof SpotTypesCalculator = SpotTypesCalculator;

  sidebarVisible = false;
  subscriptions = new Array<Subscription>();

  spot: ISelectedSpot | null;
  signStatus = SignStatus;
  spotPolicyType = SpotPolicyType;
  cameraPictureUrl: string | null = null;
  signPictureUrl: string | null = null;
  policyTypeNameAndColor: { name: string, color: string } | null = null

  uniqRegulations: any[];

  _moment: any = moment;

  constructor(
    public mapState: MapStateService,
    private selectedItemsService: SelectedItemsService,
    private camerasService: FrontendApiCamerasService) {
  }

  ngOnInit(): void {
    this.subscriptions.push(
      this.mapState.sidebarVisible$
        .subscribe(visible => this.sidebarVisible = visible === 'spot')
    );


    this.subscriptions.push(
      this.selectedItemsService.items$
        .subscribe(items => {
          if (!items.spot?.item) {
            this.spot = null;
          }
          this.spot = items.spot?.item || null;

          if (!!this.spot) {
            this.geoPositions = String(this.spot?.Position).split(',');
            this.cameraPictureUrl = this.spot.camera ? `{FRONTEND_API}/camera/${this.spot.camera?.Id}/snapshot` : null;
            this.signPictureUrl = this.spot.signState ? `{FRONTEND_API}/sign/screen/${this.spot.signState?.ActiveScreenId}` : null;
            this.policyTypeNameAndColor = this.spotTypesCalculator.getPolicyTypeNameAndColor(this.spot.PolicyType);

            if (this.spot?.camera) {
              this.camerasService.getCameraEvents(this.spot?.camera?.Id || 0)
                .pipe(
                  finalize(() => this.busy = false)
                )
                .subscribe(events => {
                  this.event = events[events.length - 1];
                });
            }

            this.prepareRegulationWeekOfDay();
          }
        })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(x => x.unsubscribe());
    this.subscriptions = [];
  }

  prepareRegulationWeekOfDay() {

    if (this.spot?.regulation && this.spot?.regulation?.Schedules) {
      this.uniqRegulations = this.spot?.regulation?.Schedules.map((schedule, indexSh) => {
        return underscore.uniq(schedule.Items.map((item) => {
          return {
            Time: item.FromTime + '&' + item.ToTime,
            FromTime: item.FromTime,
            ToTime: item.ToTime,
            Rates: item.Rates,
            DayOfWeekId: item.DayOfWeekId,
            TimeLimitMinutes: item.TimeLimitMinutes,
            ScheduleNumber: indexSh,
            ScheduleType: schedule.ScheduleType,
          }
        }), 'Time')
      })
    }

  }

  sumDays(scheduleNumber: number, currentTime: string): string {
    if (this.spot?.regulation && this.spot?.regulation?.Schedules && this.spot?.regulation?.Schedules[scheduleNumber]) {
      const weekDays: (DayOfWeekId | undefined)[] = this.spot?.regulation?.Schedules[scheduleNumber].Items.map((value: IScheduleItem) => {
        if (currentTime === (value.FromTime + '&' + value.ToTime)) {
          return value.DayOfWeekId
        }
        return undefined;
      })

      const uniqWeekDays: DayOfWeekId[] = weekDays.filter((x) => x !== undefined).map(x => x as DayOfWeekId);

      let weekDayString = '';

      if (uniqWeekDays.length > 1) {
        weekDayString = this.weekDaysSchedule.getScheduledWeekDaysString(Object.values(DayOfWeekId)[Math.min(...uniqWeekDays.map(x => Object.keys(DayOfWeekId).indexOf(x)))])
          + ' - '
          + this.weekDaysSchedule.getScheduledWeekDaysString(Object.values(DayOfWeekId)[Math.max(...uniqWeekDays.map(x => Object.keys(DayOfWeekId).indexOf(x)))]);
      }

      if (uniqWeekDays.length === 1) {
        weekDayString = this.weekDaysSchedule.getScheduledWeekDaysString(uniqWeekDays[0]);
      }

      return weekDayString;
    }
    return '';
  }

  close() {
    this.mapState.closeSidebar();
  }

  mapView() {
    const spotId = this.spot?.Id || 0;
    this.mapState.selectEntityOnMap(SelectedItemName.Spot, spotId);
  }

  eventsExpanded(expanded: boolean) {
    this.eventsPanelExpanded = expanded;
    if (expanded && !this.event && (this.spot?.camera?.Id || 0 > 0)) {
      this.busy = true;
      this.camerasService.getCameraEvents(this.spot?.camera?.Id || 0)
        .pipe(
          finalize(() => this.busy = false)
        )
        .subscribe(events => {
          this.event = events[events.length - 1];
        });
    }
  }

  openZone() {
    const zoneId = this.spot?.zone?.Id || 0;
    this.mapState.selectEntityOnMap(SelectedItemName.Zone, zoneId);
  }

  openArea() {
    const areaId = this.spot?.area?.Id || 0;
    const areaTypeId = this.spot?.area?.TypeId || 0;
    this.mapState.selectEntityOnMap(SelectedItemName.Area, areaId, areaTypeId);
  }

  openCamera() {
    const cameraId = this.spot?.camera?.Id || 0;
    this.mapState.selectEntityOnMap(SelectedItemName.Camera, cameraId);
  }

  openMeter(id: number) {
    this.mapState.selectEntityOnMap(SelectedItemName.Meter, id)
  }

  moreInfoCamera(): void {

  }

  moreInfoSign(): void {

  }

}
