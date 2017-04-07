(function(mod) {
    if (typeof exports === "object" && typeof module === "object") {
        mod(require("node_modules/codemirror/lib/codemirror")); // CommonJS
    } else if (typeof define === "function" && define.amd) {
        define(["node_modules/codemirror/lib/codemirror"], mod); // AMD
    } else {
        mod(CodeMirror); // Plain browser env
    }
})(function(CodeMirror) {
    "use strict";
    // tslint:disable-next-line:max-line-length
    var variables = [
        "ActiveTasks", "CPUPercent", "CurrentDedicated", "DiskBytes",
        "DiskReadBytes", "DiskReadOps", "DiskWriteBytes", "DiskWriteOps",
        "FailedTasks", "MemoryBytes", "NetworkInBytes", "NetworkOutBytes",
        "PendingTasks", "RunningTasks", "SampleNodeCount", "SucceededTasks",
        "TargetDedicated", "$WallClockSeconds",
    ];

    // tslint:disable-next-line:max-line-length
    var keywordRegex = /\$CPUPercent|\$WallClockSeconds|\$MemoryBytes|\$DiskBytes|\$DiskReadBytes\$DiskWriteBytes|\$DiskReadOps|\$DiskWriteOps|\$NetworkInBytes|\$NetworkOutBytes|\$SampleNodeCount|\$ActiveTasks|\$RunningTasks|\$PendingTasks|\$SucceededTasks|\$FailedTasks|\$CurrentDedicated|\$TargetDedicated/;
    var functionsRegex = /avg|len|lg|ln|log|max|min|norm|percentile|rand|range|std|stop|sum|time|val/;
    var obtainRegex = /GetSample|GetSamplePeriod|Count|HistoryBeginTime|GetSamplePercent/;
    var atomRegex = /true|false|null/;
    var numberRegex = /0x[a-f\d]+|[-+]?(?:\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/i;
    var operatorRegex = /[-+\/*=<>!]+/;

    CodeMirror.defineMode("autoscale", function() {
        return {
            token: function(stream, state) {
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
            }
        };
    });

    //Register an array of completion words for this mode
    CodeMirror.registerHelper("hintWords", "autoscale", variables);
});
