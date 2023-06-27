import { Clock } from "./clock";

export class StandardClock implements Clock {
    now(): Date {
        return new Date();
    }
}
