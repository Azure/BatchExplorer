import * as moment from "moment";

export interface HistoryItem {
    x: Date;
    y: number;
}

export class HistoryDataBase {
    public history: HistoryItem[] = [];
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
