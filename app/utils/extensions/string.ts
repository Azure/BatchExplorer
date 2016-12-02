
interface String {
    /**
     * Format a string 
     */
    format(...args);
}

// First, checks if it isn't implemented yet.
if (!String.prototype.format) {
    String.prototype.format = function (...args) {
        return this.replace(/{(\d+)}/g, (match, i) => {
            return typeof args[i] !== "undefined" ? args[i] : match;
        });
    };
}
