import * as CodeMirror from "codemirror";

const variables = [
    "$ActiveTasks", "$CPUPercent", "$CurrentDedicated", "$DiskBytes",
    "$DiskReadBytes", "$DiskReadOps", "$DiskWriteBytes", "$DiskWriteOps",
    "$FailedTasks", "$MemoryBytes", "$NetworkInBytes", "$NetworkOutBytes",
    "$PendingTasks", "$RunningTasks", "$SampleNodeCount", "$SucceededTasks",
    "$TargetDedicatedNodes", "$TargetLowPriorityNodes", "$WallClockSeconds",
    "$NodeDeallocationOption",
];

const mathFunc = [
    "avg", "len", "lg", "ln", "log", "max", "min", "norm",
    "percentile", "rand", "range", "std", "stop", "sum", "time", "val",
];

const systemFunc = [
    "GetSamplePeriod", "GetSamplePercent", "GetSample", "Count", "HistoryBeginTime",
];

const types = [
    "doubleVecList", "doubleVec", "double", "string", "timestamp",
];

const timeInterval = [
    "TimeInterval_Zero", "TimeInterval_100ns", "TimeInterval_Microsecond",
    "TimeInterval_Millisecond", "TimeInterval_Second", "TimeInterval_Minute",
    "TimeInterval_Hour", "TimeInterval_Day", "TimeInterval_Week", "TimeInterval_Year",
];

const mappedKeywords = variables.map((keyword) => `\\$\\b${keyword.substring(1)}\\b`);
const keywordRegex = new RegExp(mappedKeywords.join("|"));

const mappedMath = mathFunc.map((math) => `\\b${math}\\b`);
const mathRegex = new RegExp(mappedMath.join("|"));

const mappedSystemFunc = systemFunc.map((sf) => `\\b${sf}\\b`);
const obtainRegex = new RegExp(mappedSystemFunc.join("|"));

const mappedTypes = types.map((type) => `\\b${type}\\b`);
const typesRegex = new RegExp(mappedTypes.join("|"));

const mappedInterval = timeInterval.map((interval) => `\\b${interval}\\b`);
const intervalRegex = new RegExp(mappedInterval.join("|"));

const atomRegex = /\b(true|false|null)\b/;
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
            } else if (stream.match(mathRegex)) {
                return "functions";
            } else if (stream.match(obtainRegex)) {
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
    while (end < curLine.length && /[\w$]+/.test(curLine.charAt(end))) { ++end; }
    while (start && /[\w$]+/.test(curLine.charAt(start - 1))) { --start; }
    let curWord = start !== end && curLine.slice(start, end).replace("$", "\\$");
    let regex = new RegExp("^" + curWord, "i");
    const results = variables.filter((item) => {
        return item.match(regex);
    }).concat(mathFunc.filter((item) => {
        return item.match(regex);
    })).concat(systemFunc.filter((item) => {
        return item.match(regex);
    })).concat(types.filter((item) => {
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
