import * as CodeMirror from "codemirror";

const variables = [
    "$ActiveTasks", "$CPUPercent", "$CurrentDedicated", "$DiskBytes",
    "$DiskReadBytes", "$DiskReadOps", "$DiskWriteBytes", "$DiskWriteOps",
    "$FailedTasks", "$MemoryBytes", "$NetworkInBytes", "$NetworkOutBytes",
    "$PendingTasks", "$RunningTasks", "$SampleNodeCount", "$SucceededTasks",
    "$TargetDedicated", "$WallClockSeconds", "$NodeDeallocationOption",
];

const mathFunc = [
    "avg", "len", "lg", "ln", "log", "max", "min", "norm",
    "percentile", "rand", "range", "std", "stop", "sum", "time", "val",
];

const systemFunc = [
    "GetSample", "GetSamplePeriod", "Count", "HistoryBeginTime", "GetSamplePercent",
];

const keywords = [
    "double", "doubleVec", "doubleVecList", "string", "timestamp",
];

const timeInterval = [
    "TimeInterval_Zero",
    "TimeInterval_100ns",
    "TimeInterval_Microsecond",
    "TimeInterval_Millisecond",
    "TimeInterval_Second",
    "TimeInterval_Minute",
    "TimeInterval_Hour",
    "TimeInterval_Day",
    "TimeInterval_Week",
    "TimeInterval_Year",
];

// tslint:disable-next-line:max-line-length
const keywordRegex = /\$\b(CPUPercent|WallClockSeconds|MemoryBytes|DiskBytes|DiskReadBytes\$DiskWriteBytes|DiskReadOps|DiskWriteOps|NetworkInBytes|NetworkOutBytes|SampleNodeCount|ActiveTasks|RunningTasks|PendingTasks|SucceededTasks|FailedTasks|CurrentDedicated|TargetDedicated|NodeDeallocationOption)\b/;
const functionsRegex = /\b(avg|len|lg|ln|log|max|min|norm|percentile|rand|range|std|stop|sum|time|val)\b/;
const obtainRegex = /\b(GetSamplePeriod|GetSample|Count|HistoryBeginTime|GetSamplePercent)\b/;
const atomRegex = /\b(true|false|null)\b/;
const typesRegex = /\b(double|doubleVec|doubleVecList|string|timestamp)\b/;
// tslint:disable-next-line:max-line-length
const intervalRegex = /\b(TimeInterval_Zero|TimeInterval_100ns|TimeInterval_Microsecond|TimeInterval_Millisecond|TimeInterval_Second|TimeInterval_Minute|TimeInterval_Hour|TimeInterval_Hour|TimeInterval_Day|TimeInterval_Week|TimeInterval_Year)\b/;
const numberRegex = /0x[a-f\d]+|[-+]?(?:\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/i;
const operatorRegex = /[-+\/*=<>!]+/;
const commentRegex = /^\/\/(.*)/;
const quoteRegex = /"(.*)"/;
CodeMirror.defineMode("autoscale", () => {
    return {
        token: (stream, state) => {
            if (stream.match(commentRegex)) {
                return "comment";
            } else if (stream.match(quoteRegex)) {
                return "string";
            } else if (stream.match(keywordRegex) || stream.match(intervalRegex)) {
                return "variables";
            } else if (stream.match(functionsRegex)) {
                return "functions";
            } else if ( stream.match(obtainRegex)) {
                return "math";
            } else if (stream.match(typesRegex)) {
                return "builtin";
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
    })).concat(keywords.filter((item) => {
        return item.match(regex);
    })).concat(timeInterval.filter((item) => {
        return item.match(regex);
    }));
    return {
        list: (!curWord ? [] : results).sort(),
        from: CodeMirror.Pos(cur.line, start),
        to: CodeMirror.Pos(cur.line, end),
    };
});
