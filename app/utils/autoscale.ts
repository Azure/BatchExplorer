import * as CodeMirror from "codemirror";

const variables = [
    "$ActiveTasks", "$CPUPercent", "$CurrentDedicated", "$DiskBytes",
    "$DiskReadBytes", "$DiskReadOps", "$DiskWriteBytes", "$DiskWriteOps",
    "$FailedTasks", "$MemoryBytes", "$NetworkInBytes", "$NetworkOutBytes",
    "$PendingTasks", "$RunningTasks", "$SampleNodeCount", "$SucceededTasks",
    "$TargetDedicated", "$WallClockSeconds",
];

const mathFunc = [
    "avg", "len", "lg", "ln", "log", "max", "min", "norm",
    "percentile", "rand", "range", "std", "stop", "sum", "time", "val",
];

const systemFunc = [
    "GetSample", "GetSamplePeriod", "Count", "HistoryBeginTime", "GetSamplePercent",
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

CodeMirror.registerHelper("hint", "autoscale", (editor) => {
    let cur = editor.getCursor();
    let curLine = editor.getLine(cur.line);
    let start = cur.ch;
    let end = start;
    while (end < curLine.length && /[\w$]+/.test(curLine.charAt(end))) { ++end; };
    while (start && /[\w$]+/.test(curLine.charAt(start - 1))) { --start; };
    let curWord = start !== end && curLine.slice(start, end).replace("$", "\\$");
    let regex = new RegExp("^" + curWord, "i");
    const results = variables.filter((item) => {
        return item.match(regex);
    }).concat(mathFunc.filter((item) => {
        return item.match(regex);
    })).concat(systemFunc.filter((item) => {
        return item.match(regex);
    }));
    return {
        list: (!curWord ? [] : results).sort(),
        from: CodeMirror.Pos(cur.line, start),
        to: CodeMirror.Pos(cur.line, end),
    };
});
