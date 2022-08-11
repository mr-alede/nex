import { Pipe, PipeTransform } from '@angular/core';

import moment from 'moment';

@Pipe({ name: 'appDiffMinutes' })
export class DiffMinutesPipe implements PipeTransform {
  transform(start: Date | null, end: Date | null): string | null {
    return this.diffMinutesStr(start, end);
  }

  private diffMinutes(start: Date | null, end: Date | null): number | null {
    if (!start || !end) {
      return null;
    }

    return moment(end).diff(moment(start), 'minutes');
  }

  private diffMinutesStr(start: Date | null, end: Date | null): string {
    const diffMinutes = this.diffMinutes(start, end);
    if (diffMinutes === null) {
      return '';
    }

    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    let parts: Array<string> = [];
    if (hours > 0) {
      parts.push(`${hours}h`);
    }

    if (minutes > 0) {
      parts.push(`${minutes}min`);
    }

    return parts.join(':');
  }
}
