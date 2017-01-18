import { Record } from "immutable";

// tslint:disable:variable-name object-literal-sort-keys
const StartTaskRecord = Record({
    commandLine: null,
    waitForSuccess: true,
    runElevated: false,
    maxTaskRetryCount: 0,
    resourceFiles: [],
    environmentSettings: [],
});

/**
 * Class for displaying Batch Start Task information.
 */
export class StartTask extends StartTaskRecord {
    public commandLine: string;
    public waitForSuccess: boolean;
    public runElevated: boolean;
    public maxTaskRetryCount: number;
    public resourceFiles: any[];                // ResourceFile
    public environmentSettings: any[];          // EnvironmentSetting
}
