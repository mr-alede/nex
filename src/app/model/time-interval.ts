import * as moment from 'moment';

export class TimeInterval {
    public static diffMinutes(start: Date | null, end: Date | null): number | null {
        if (!start || !end) {
            return null;
        }

        return moment(end).diff(moment(start), 'minutes');
    }

    public static diffMinutesStr(start: Date | null, end: Date | null): string {
        const diffMinutes = TimeInterval.diffMinutes(start, end);
        if (diffMinutes === null) {
            return '';
        }

        const hours = Math.floor(diffMinutes / 60);
        const minutes = diffMinutes % 60;
        return minutes > 0 ? `${hours}h:${minutes}min` : `${hours}h`;
    }
}