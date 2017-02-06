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
