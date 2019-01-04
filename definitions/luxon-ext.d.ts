import * as luxon from "luxon";

declare module "luxon" {
    interface DateTime {
        toRelative(params?: { date?: DateTime }): string;
    }
}
