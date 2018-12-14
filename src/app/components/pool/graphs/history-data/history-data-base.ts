import { DateTime } from "luxon";

export interface HistoryItem {
    time: Date;
    y: number;
}

export class HistoryDataBase {
    public history: HistoryItem[] = [];

    private _lastTime = null;
    private _historySize = 10;

    public hasTimePassed(time: Date) {
        const passed = !this._lastTime || DateTime.fromJSDate(time)
            .diff(DateTime.fromJSDate(this._lastTime)).as("milliseconds") >= 5 * 1000 - 10;
        if (passed) {
            this._lastTime = time;
            return true;
        } else {
            return false;
        }
    }

    public addPoint(value: number) {
        const time = new Date();
        const history = this.history;
        // Remove the element if it is the same value
        if (this._areLast2SameAs(value)) {
            history.pop();
        }

        history.push({
            time: time,
            y: value,
        });
        this.history = history;
    }

    public setHistorySize(minutes: number) {
        this._historySize = minutes;
        this.cleanup();
    }

    public cleanup() {
        const maxTime = DateTime.local().minus({ minutes: this._historySize, seconds: 1 });
        const history = this.history;
        // Keep  at least 1
        while (history.length > 1) {
            const data = history.first();
            const diff = DateTime.fromJSDate(data.time).diff(maxTime).as("millisecond");
            if (diff < 0) {
                history.shift();
            } else {
                break;
            }
        }
        this.history = history;
    }

    public reset() {
        this.history = [];
    }

    /**
     * Check the last 2 points in history are equal so we can update the last one time
     * @param value Value to compare
     */
    private _areLast2SameAs(value) {
        if (this.history.length < 2) {
            return false;
        }
        const last = this.history[this.history.length - 1];
        const prev = this.history[this.history.length - 2];

        return last.y === prev.y && last.y === value;
    }
}
