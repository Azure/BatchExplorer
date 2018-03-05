import { List, Record } from "immutable";

import { ObjectUtils } from "@batch-flask/utils";
import { JobAction } from "./job-action";

// tslint:disable:variable-name
const TaskExitConditionsRecord = Record({
    exitCodes: [],
    exitCodeRanges: [],
    failureInfo: null,
    default: null,
});

export class TaskExitConditions extends TaskExitConditionsRecord {
    public exitCodes: List<ExitCodeMapping>;
    public exitCodeRanges: List<ExitCodeRangeMapping>;
    public failureInfo: ExitOptions;
    public default: ExitOptions;

    constructor(data: any = {}) {
        super(Object.assign({}, data, ObjectUtils.compact({
            exitCodes: data.exitCodes && List(data.exitCodes.map(x => new ExitCodeMapping(x))),
            exitCodeRanges: data.exitCodeRanges && List(data.exitCodeRanges.map(x => new ExitCodeRangeMapping(x))),
            failureInfo: new ExitOptions(data.failureInfo),
            default: new ExitOptions(data.default),
        })));
    }
}

const ExitCodeMappingRecord = Record({
    code: null,
    exitOptions: null,
});

export class ExitCodeMapping extends ExitCodeMappingRecord {
    public code: number;
    public exitOptions: ExitOptions;

    constructor(data: any = {}) {
        super(Object.assign({}, data, {
            exitOptions: data.exitOptions && new ExitOptions(data.exitOptions),
        }));
    }
}

const ExitCodeRangeMappingRecord = Record({
    start: null,
    end: null,
    exitOptions: null,
});

export class ExitCodeRangeMapping extends ExitCodeRangeMappingRecord {
    public start: number;
    public end: number;
    public exitOptions: ExitOptions;

    constructor(data: any = {}) {
        super(Object.assign({}, data, {
            exitOptions: data.exitOptions && new ExitOptions(data.exitOptions),
        }));
    }
}

export class ExitOptions extends Record({ jobAction: null }) {
    public jobAction: JobAction;
}
