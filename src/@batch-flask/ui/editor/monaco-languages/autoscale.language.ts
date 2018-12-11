/**
 * AutoscaleLanguage class defines autoscale formula syntax highlight and keyword autocomplete features in
 * Monaco text editor. Autoscale text editor can be viewed directly in create pool flyout.
 */

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

export class AutoscaleLanguage {
    public static define() {
        monaco.languages.register({ id: "batch-autoscale" });
        monaco.languages.setLanguageConfiguration("batch-autoscale", {
            wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\#\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/g,
            comments: {
                lineComment: "//",
            },
            autoClosingPairs: [
                { open: "(", close: ")", notIn: ["string"] },
                { open: '"', close: '"', notIn: ["string"] },
            ],
        });

        monaco.languages.setMonarchTokensProvider("batch-autoscale", {
            brackets: [
                { open: "[", close: "]", token: "delimiter.square" },
                { open: "(", close: ")", token: "delimiter.parenthesis" },
            ],
            keywords: [...timeInterval, ...types, "true", "false", "null"],
            operators: [
                "-", "+", "*", "=", ">", "<", "!",
            ],

            // we include these common regular expressions
            symbols: /[=><!~?:&|+\-*\/\^%]+/,
            builtinFunctions: [...mathFunc, ...systemFunc],
            builtinVariables: variables,

            tokenizer: {
                root: [
                    // whitespace
                    { include: "@whitespace" },
                    { include: "@numbers" },
                    { include: "@strings" },

                    [/@symbols/, {
                        cases: {
                            "@operators": "delimiter",
                            "@default": "",
                        },
                    }],

                    // numbers
                    [/[;,.]/, "delimiter"],
                    [/[()]/, "@brackets"],
                    [/[\w@#]+/, {
                        cases: {
                            "@keywords": "keyword",
                            "@operators": "operator",
                            "@builtinFunctions": "predefined",
                            "@default": "identifier",
                        },
                    }],
                    [/[\$a-zA-Z_]\w*/, {
                        cases: {
                            "@builtinVariables": "predefined",
                            "@default": "identifier",
                        },
                    }],
                ],
                whitespace: [
                    [/[ \t\r\n]+/, ""],
                    [/\/\*/, "comment", "@comment"],
                    [/\/\/.*$/, "comment"],
                ],
                comment: [
                    [/[^\/*]+/, "comment"],
                    [/[\/*]/, "comment"],
                ],
                numbers: [
                    [/0[xX][0-9a-fA-F]*/, "number"],
                    [/0x[a-f\d]+|[-+]?(?:\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/i, "number"],
                ],
                strings: [
                    [/N"/, { token: "string", next: "@string" }],
                    [/"/, { token: "string", next: "@string" }],
                ],
                string: [
                    [/[^']+/, "string"],
                    [/""/, "string"],
                    [/"/, { token: "string", next: "@pop" }],
                ],
            },
        } as any);

        // Register a completion item provider for the new language
        monaco.languages.registerCompletionItemProvider("batch-autoscale", {
            provideCompletionItems: (editor, position) => {
                const list: monaco.languages.CompletionList =  {
                    suggestions: [
                        ...[...variables, ...timeInterval].map((x) => {
                            return {
                                label: x,
                                insertText: x,
                                kind: monaco.languages.CompletionItemKind.Variable,
                            };
                        }),
                        ...[...mathFunc, ...systemFunc].map((x) => {
                            return {
                                label: x,
                                insertText: x,
                                kind: monaco.languages.CompletionItemKind.Function,
                            };
                        }),
                        ...types.map((x) => {
                            return {
                                label: x,
                                insertText: x,
                                kind: monaco.languages.CompletionItemKind.Keyword,
                            };
                        }),
                    ],
                };

                return list;
            },
        });

    }
}
