
import { Stream } from "stream";
import { format } from "util";

const colors = {
    bold: [1, 22],
    italic: [3, 23],
    underline: [4, 24],
    inverse: [7, 27],
    white: [37, 39],
    grey: [90, 39],
    black: [30, 39],
    blue: [34, 39],
    cyan: [36, 39],
    green: [32, 39],
    magenta: [35, 39],
    red: [31, 39],
    yellow: [33, 39],
};

const defaultOptions = {
    useColor: true,
};

const config = defaultOptions;

const levelFromName = {
    trace: 10,
    debug: 20,
    info: 30,
    warn: 40,
    error: 50,
    fatal: 60,
};

const colorFromLevel = {
    10: "grey",     // TRACE
    20: "grey",     // DEBUG
    30: "cyan",     // INFO
    40: "magenta",  // WARN
    50: "red",      // ERROR
    60: "inverse",  // FATAL
};

const nameFromLevel = {};
const upperNameFromLevel = {};
const upperPaddedNameFromLevel = {};
Object.keys(levelFromName).forEach((name) => {
    const lvl = levelFromName[name];
    nameFromLevel[lvl] = name;
    upperNameFromLevel[lvl] = name.toUpperCase();
    upperPaddedNameFromLevel[lvl] = (name.length === 4 ? " " : "") + name.toUpperCase();
});

function stylize(str, color = "white") {
    if (!str) {
        return "";
    }

    if (!config.useColor) {
        return str;
    }

    const codes = colors[color];
    if (codes) {
        return "\x1B[" + codes[0] + "m" + str +
            "\x1B[" + codes[1] + "m";
    }
    return str;
}

function indent(s) {
    return "    " + s.split(/\r?\n/).join("\n    ");
}

function extractTime(rec) {
    const time = (typeof rec.time === "object") ? rec.time.toISOString() : rec.time;

    return stylize(time.substr(11));
}

function extractLevel(rec) {
    const level = (upperPaddedNameFromLevel[rec.level] || "LVL" + rec.level);
    return stylize(level, colorFromLevel[rec.level]);
}

function isSingleLineMsg(rec) {
    return rec.msg.indexOf("\n") === -1;
}

function extractMsg(rec) {
    return stylize(rec.msg, "cyan");
}

function extractError(rec) {
    if (rec.err && rec.err.stack) {
        return rec.err.stack;
    }
}

function extractCustomDetails(rec) {
    const skip = new Set(["name", "hostname", "pid", "level", "component", "msg",
        "time", "v", "src", "err", "client_req", "client_res", "req", "res"]);

    const details = [];
    const extras = {};

    for (const key of Object.keys(rec)) {
        if (skip.has(key)) { continue; }
        let value = rec[key];
        if (typeof value === "undefined") { value = ""; }
        let stringified = false;
        if (typeof value !== "string") {
            value = JSON.stringify(value, null, 2);
            stringified = true;
        }
        if (value.indexOf("\n") !== -1 || value.length > 50) {
            details.push(key + ": " + value);
        } else if (!stringified && (value.indexOf(" ") !== -1 || value.length === 0)) {
            extras[key] = JSON.stringify(value);
        } else {
            extras[key] = value;
        }
    }

    return {
        details: details,
        extras: extras,
    };
}

function applyDetails(results, details, extras) {
    if (!results) { return; }
    for (const detail of results.details) {
        details.push(indent(detail));
    }
    for (const key of Object.keys(results.extras)) {
        extras.push(key + "=" + results.extras[key]);
    }
}

export class PrettyStream extends Stream {
    constructor(opts = {}) {
        super();
        const options = {};

        if (opts) {
            Object.keys(opts).forEach((key) => {
                options[key] = {
                    value: opts[key],
                    enumerable: true,
                    writable: true,
                    configurable: true,
                };
            });
        }

        // let config = Object.create(defaultOptions, options);

        (this as any).readable = true;
        (this as any).writable = true;
    }

    public write(data) {
        if (typeof data === "string") {
            this.emit("data", this.formatRecord(JSON.parse(data)));
        } else if (typeof data === "object") {
            this.emit("data", this.formatRecord(data));
        }
        return true;
    }

    public end() {
        this.emit("end");
        return true;
    }

    private formatRecord(rec) {
        let details = [];
        let extras = [];

        const time = extractTime(rec);
        const level = extractLevel(rec);
        const component = rec.name;

        const msg = isSingleLineMsg(rec) ? extractMsg(rec) : "";
        if (!msg) {
            details.push(indent(extractMsg(rec)));
        }

        const error = extractError(rec);
        if (error) {
            details.push(indent(error));
        }

        applyDetails(extractCustomDetails(rec), details, extras);

        extras = stylize(
            (extras.length ? " (" + extras.join(", ") + ")" : ""), "grey");
        details = stylize(
            (details.length ? details.join("\n    --\n") + "\n" : ""), "grey");

        return format("[%s] %s: %s: %s%s\n%s",
            time,
            level,
            component,
            msg,
            extras,
            details);

    }
}
