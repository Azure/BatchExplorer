import * as CodeMirror from "codemirror";

const variables = [
    "ActiveTasks", "CPUPercent", "CurrentDedicated", "DiskBytes",
    "DiskReadBytes", "DiskReadOps", "DiskWriteBytes", "DiskWriteOps",
    "FailedTasks", "MemoryBytes", "NetworkInBytes", "NetworkOutBytes",
    "PendingTasks", "RunningTasks", "SampleNodeCount", "SucceededTasks",
    "TargetDedicated", "$WallClockSeconds",
];

// tslint:disable-next-line:max-line-length
const keywordRegex = /\$CPUPercent|\$WallClockSeconds|\$MemoryBytes|\$DiskBytes|\$DiskReadBytes\$DiskWriteBytes|\$DiskReadOps|\$DiskWriteOps|\$NetworkInBytes|\$NetworkOutBytes|\$SampleNodeCount|\$ActiveTasks|\$RunningTasks|\$PendingTasks|\$SucceededTasks|\$FailedTasks|\$CurrentDedicated|\$TargetDedicated/;
const functionsRegex = /avg|len|lg|ln|log|max|min|norm|percentile|rand|range|std|stop|sum|time|val/;
const obtainRegex = /GetSample|GetSamplePeriod|Count|HistoryBeginTime|GetSamplePercent/;
const atomRegex = /true|false|null/;
const numberRegex = /0x[a-f\d]+|[-+]?(?:\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/i;
const operatorRegex = /[-+\/*=<>!]+/;

CodeMirror.defineMode("autoscale", () => {
    return {
        token: (stream, state) => {
            if (stream.match(keywordRegex) ) {
                return "keyword";
            } else if (stream.match(functionsRegex) || stream.match(obtainRegex)) {
                return "string";
            } else if (stream.match(atomRegex)) {
                return "atom";
            } else if (stream.match(numberRegex)) {
                return "number";
            } else if (stream.match(operatorRegex)) {
                return "operator";
            } else {
                stream.next();
                return null;
            }
        },
    };
});

CodeMirror.registerHelper("hintWords", "autoscale", variables);
