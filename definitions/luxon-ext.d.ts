import * as luxon from "luxon";

declare module "luxon" {
    interface DateTime {
        toRelative(params?: { date?: DateTime }): string;
        readonly isValid: boolean;
    }

    interface Zone {
        readonly isValid: boolean;
        readonly name: string;
        readonly type: string;
    }
}
