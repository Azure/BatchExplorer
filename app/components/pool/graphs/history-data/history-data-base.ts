import * as moment from "moment";

export interface HistoryItem {
    x: Date;
    y: number;
}

export class HistoryDataBase {
    public history: HistoryItem[] = [];

    private _lastTime = null;

    public hasTimePassed(time: Date) {
        const passed = !this._lastTime || moment(time).diff(this._lastTime) >= 5 * 1000 - 10;
        if (passed) {
            this._lastTime = time;
            return true;
        } else {
            return false;
        }
    }

    public cleanup() {
        const maxTime = moment().subtract(10, "minutes");
        while (true) {
            const data = this.history.first();
            const diff = moment(data.x).diff(maxTime);
            if (diff < 0) {
                this.history.shift();
            } else {
                break;
            }
        }
    }
}
