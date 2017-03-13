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

    public setHistorySize(minutes: number) {
        this._historySize = minutes;
        this.cleanup();
    }

    public cleanup() {
        const maxTime = moment().subtract(this._historySize, "minutes").subtract(10, "seconds");
        while (true) {
            const data = this.history.first();
            const diff = moment(data.time).diff(maxTime);
            if (diff < 0) {
                this.history.shift();
            } else {
                break;
            }
        }
    }
}
