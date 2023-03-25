import { Clock } from "./clock";

// 2022-02-02 00:00:00 UTC
const INITIAL_MS = 1643760000000;

export class FakeClock implements Clock {
    private _ms: number = INITIAL_MS;

    now(): Date {
        return new Date(this._ms);
    }

    advance(ms: number) {
        if (ms <= 0) {
            throw new Error("Can't advance clock by zero or a negative number");
        }
        this._ms = ms + this._ms;
    }

    setTime(ms: number) {
        this._ms = ms;
    }
}
