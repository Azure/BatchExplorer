import * as moment from "moment";

export interface HistoryItem {
    time: Date;
    y: number;
}

export class HistoryDataBase {
    public history: HistoryItem[] = [];

    private _lastTime = null;
    private _historySize = 10;

    public hasTimePassed(time: Date) {
        const passed = !this._lastTime || moment(time).diff(this._lastTime) >= 5 * 1000 - 10;
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
        const maxTime = moment().subtract(this._historySize, "minutes").subtract(1, "seconds");
        const history = this.history;
        // Keep  at least 1
        while (history.length > 1) {
            const data = history.first();
            const diff = moment(data.time).diff(maxTime);
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
