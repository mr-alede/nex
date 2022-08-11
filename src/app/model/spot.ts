import { ICameraWithSpots, ISpotState } from '../services';

export enum OccupancyStatus {
  Unknown = 'Unknown',
  Vacant = 'Vacant',
  Occupied = 'Occupied',
  Booked = 'Booked',
}

export enum SpotPolicyType {
  Unknown = 'Unknown',
  /// <summary>
  /// Gray.
  /// </summary>
  General = 'General',

  /// <summary>
  /// Yellow.
  /// </summary>
  Commercial = 'Commercial',

  /// <summary>
  /// Green.
  /// </summary>
  ShortTerm = 'ShortTerm',

  /// <summary>
  /// Black.
  /// </summary>
  Motorcycle = 'Motorcycle',

  /// <summary>
  /// Brown.
  /// </summary>
  TourBus = 'TourBus',

  /// <summary>
  /// Red.
  /// </summary>
  SixWheeled = 'SixWheeled',

  /// <summary>
  /// Violet.
  /// </summary>
  BoatTrailer = 'BoatTrailer',
}

export enum DayOfWeekId {
  Monday = "Monday",
  Tuesday = "Tuesday",
  Wednesday = "Wednesday",
  Thursday = "Thursday",
  Friday = "Friday",
  Saturday = "Saturday",
  Sunday = "Sunday",
}

export enum ScheduleType {
  /// <summary>
  /// Unknown.
  /// </summary>
  Unknown = 'Unknown',

  /// <summary>
  /// General paid schedule type.
  /// </summary>
  OP = 'OP',

  /// <summary>
  /// Unpaid schedule.
  /// </summary>
  FREE = 'FREE',

  /// <summary>
  /// Tow-away schedule, unpaid.
  /// </summary>
  TOW = 'TOW',

  /// <summary>
  /// Early morning unpaid schedule.
  /// </summary>
  PRE = 'PRE',

  /// <summary>
  /// Alternative schedule, can be both paid and unpaid.
  /// </summary>
  ALT = 'ALT',
};

export class SpotCalculator {
  public static getColor(occupancy?: OccupancyStatus | undefined): string {
    switch (occupancy) {
      case OccupancyStatus.Vacant:
        return '#00B62D';

      case OccupancyStatus.Booked:
        return '#cccc00';

      case OccupancyStatus.Occupied:
        return 'red';

      default:
        return '#A4A6AA';
    }
  }

  public static getCountSpotStatuses(spotStates: ISpotState[]) {
    let countVacant = 0;
    let countBooked = 0;
    let countOccupied = 0;
    for (let state of spotStates) {
      if (state.Status === OccupancyStatus.Vacant) countVacant++;
      if (state.Status === OccupancyStatus.Booked) countBooked++;
      if (state.Status === OccupancyStatus.Occupied) countOccupied++;
    }
    return {
      vacant: countVacant,
      booked: countBooked,
      occupied: countOccupied,
    };
  }

  public static getSpotStatesWithCamera(
    camerasIds: Array<ICameraWithSpots>,
    spotsStates: Array<ISpotState>
  ): Array<ISpotState> {
    const spotsIds: number[] = camerasIds.map((x) => {
      return x.SpotIds.reduce((y: number) => {
        return y;
      });
    });
    return spotsStates.filter((x: ISpotState) => {
      return spotsIds.includes(x.SpotId);
    });
  }
}

export class WeekDaysSchedule {
  public static getScheduledWeekDaysString(dayOfWeekId: DayOfWeekId): string {
    switch (dayOfWeekId) {
      case DayOfWeekId.Monday:
        return 'Mon';

      case DayOfWeekId.Tuesday:
        return 'Tue';

      case DayOfWeekId.Wednesday:
        return 'Wed';

      case DayOfWeekId.Thursday:
        return 'Thu';

      case DayOfWeekId.Friday:
        return 'Fri';

      case DayOfWeekId.Saturday:
        return 'Sat';

      case DayOfWeekId.Sunday:
        return 'Sun';

      default:
        return 'Mon - Sun';
    }
  }

  public static getAmericanHour(stringHour: string): string {
    const hour: number = Number(stringHour.split(':')[0]);
    const minutes: number = Number(stringHour.split(':')[1]);
    const preparedMinutes: string = minutes === 0 ? '' : ':' + String(minutes);

    if (hour === 0) {
      return '12AM';
    }

    if (stringHour === '23:59' || hour === 24) {
      return '12PM';
    }

    if (hour === 12) {
      return hour + preparedMinutes + 'AM';
    }

    if (hour > 12) {
      return hour - 12 + preparedMinutes + 'PM';
    }
    return hour + preparedMinutes + ' AM';
  }

  public static diffHourDescription(from: string, to: string): string {
    if (from) {
      let hourFrom: number;
      let hourTo: number;
      let minutesFrom: number;
      let minutesTo: number;

      hourFrom = Number(from.split(':')[0]);
      hourTo = to ? Number(to.split(':')[0]) : 0;

      minutesFrom = Number(from.split(':')[1]);
      minutesTo = to ? Number(to.split(':')[1]) : 0;

      const diffHour: number = hourTo !== 0 ? hourTo - hourFrom : hourFrom;
      const diffMinutes: number = minutesTo - minutesFrom;
      const prefix: string = hourFrom === 0 ? 'first' : '';
      const suffix: string = hourTo === 0 ? '+' : '';

      const descriptionHour = diffHour > 1 ? ' hours' : ' hour';
      const descriptionMinutes: string =
        diffMinutes !== 0 ? ' and ' + diffMinutes + 'minutes' : '';

      return (
        prefix +
        String(diffHour) +
        descriptionHour +
        descriptionMinutes +
        suffix
      );
    }
    return '';
  }
}

export class SpotTypesCalculator {
  public static getPolicyTypeNameAndColor(spotPolicyType: SpotPolicyType): {
    name: string;
    color: string;
  } {
    switch (spotPolicyType) {
      case SpotPolicyType.General:
        return { name: 'General', color: 'Gray' };
      case SpotPolicyType.Commercial:
        return { name: 'Commercial', color: 'Yellow' };
      case SpotPolicyType.ShortTerm:
        return { name: 'ShortTerm', color: 'Green' };
      case SpotPolicyType.Motorcycle:
        return { name: 'Motorcycle', color: 'Black' };
      case SpotPolicyType.TourBus:
        return { name: 'Tour Bus', color: 'Brown' };
      case SpotPolicyType.SixWheeled:
        return { name: 'Six Wheeled', color: 'Red' };
      case SpotPolicyType.BoatTrailer:
        return { name: 'Boat Trailer', color: 'Violet' };
      default:
        return { name: '', color: 'gray' };
    }
  }

  public static getScheduleTypeName(scheduleType: ScheduleType): string {
    switch (scheduleType) {
      case ScheduleType.Unknown:
        return '';
      case ScheduleType.OP:
        return 'OP';
      case ScheduleType.PRE:
        return 'PRE';
      case ScheduleType.FREE:
        return 'FREE';
      case ScheduleType.TOW:
        return 'TOW';
      case ScheduleType.ALT:
        return 'ALT';

      default:
        return '';
    }
  }
}
