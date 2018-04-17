// tslint:disable:only-arrow-functions
interface String {
    /**
     * Format a string
     */
    format(args: StringMap<string>);
    format(...args: string[]);

    /**
     * Remove the whitespace from the string
     * @example " This is a   string ".clearWhitespace(); //=> "Thisisastring"
     */
    clearWhitespace();

    /**
     * Add padding to the start of a string so that is in N characters long.
     * '1'.padStart(5, '0') = 00001
     */
    padStart(maxLength: number, padString?: string);

    /**
     * Trims all occurrences of the given set of strings off the end of the input.
     */
    trimEnd(...values: string[]);

    /**
     * Check if a string contains a substring
     */
    contains(substring: string): boolean;

    /**
     * If the given string is just white space
     */
    isBlank(): boolean;
}

// First, checks if it isn't implemented yet.
if (!String.prototype.format) {
    String.prototype.format = function (this: string, ...params) {
        let args;
        if (params.length === 1 && typeof params[0] !== "string") {
            args = params[0];
        } else {
            args = params;
        }
        return this.replace(/{([a-zA-Z0-9_.-]+)}/g, (match, i) => {
            console.log("Match??", args, match, i, args[i]);
            return typeof args[i] !== "undefined" ? args[i] : match;
        });
    };

    // String.prototype.format = function (this: string, ...args) {
    //     return this.replace(/{(\d+)}/g, (match, i) => {
    //         return typeof args[i] !== "undefined" ? args[i] : match;
    //     });
    // };
}

if (!String.prototype.clearWhitespace) {
    String.prototype.clearWhitespace = function (this: string) {
        return this.replace(/\s/g, "");
    };
}

if (!String.prototype.padStart) {
    String.prototype.padStart = function (this: string, maxLength: number, padString?: string) {
        padString = padString ? String(padString) : " ";
        if (padString.length === 0) {
            padString = " ";
        }

        const str = String(this);
        const fillLen = maxLength - str.length;
        if (fillLen > 0) {
            const timesToRepeat = Math.ceil(fillLen / padString.length);
            const truncatedStringFiller = padString
                .repeat(timesToRepeat)
                .slice(0, fillLen);

            return truncatedStringFiller + str;
        }

        return str;
    };
}

if (!String.prototype.trimEnd) {
    String.prototype.trimEnd = function (this: string, ...values: string[]) {
        let input = String(this) || "";
        while (input) {
            const match = values.find((value) => {
                return value && input.endsWith(value);
            });

            if (!match) {
                break;
            }

            input = input.substr(0, input.length - match.length);
        }

        return input;
    };
}

if (!String.prototype.contains) {
    String.prototype.contains = function (this: string, substr: string) {
        return this.indexOf(substr) !== -1;
    };
}

if (!String.prototype.isBlank) {
    String.prototype.isBlank = function (this: string) {
        return (!this || /^\s*$/.test(this));
    };
}
