// tslint:disable:only-arrow-functions
interface String {
    /**
     * Format a string
     */
    format(...args);

    /**
     * Remove the whitespace from the string
     * @example " This is a   string ".clearWhitespace(); //=> "Thisisastring"
     */
    clearWhitespace();

    /**
     * Add padding to the start of a string so that is in N characters long.
     * '1'.padStart(5, '0') = 00001
     */
    padStart(maxLength: number, padString: string);
}

// First, checks if it isn't implemented yet.
if (!String.prototype.format) {
    String.prototype.format = function (...args) {
        return this.replace(/{(\d+)}/g, (match, i) => {
            return typeof args[i] !== "undefined" ? args[i] : match;
        });
    };
}

if (!String.prototype.clearWhitespace) {
    String.prototype.clearWhitespace = function () {
        return this.replace(/\s/g, "");
    };
}

if (!String.prototype.padStart) {
    String.prototype.padStart = function (maxLength: number, padString: string) {
        padString = String(padString);
        if (padString.length === 0) {
            padString = " ";
        }

        const str = String(this);
        let fillLen = maxLength - str.length;
        if (fillLen > 0) {
            let timesToRepeat = Math.ceil(fillLen / padString.length);
            let truncatedStringFiller = padString
                .repeat(timesToRepeat)
                .slice(0, fillLen);

            return truncatedStringFiller + str;
        }

        return str;
    };
}
