
/**
 * Used to convert an interface to a make all attributes optional
 *
 * @example
 * // Given this
 * interface Person {
 *   name: string;
 *   age: number;
 *   location: string;
 * }
 *
 * // The next 2 are equivalent
 * interface PartialPerson {
 *   name?: string;
 *   age?: number;
 *   location?: string;
 * }
 *
 * type PartialPerson = Partial<Person>;
 */
export type Partial<T> = {
    [P in keyof T]?: T[P];
};

const UNITS = ["B", "kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

/**
 * Format a number of bytes by addding KB, MB, GB, etc. after
 * @param bytes Number of bytes to prettify
 * @param perecision Number of decimals to keep. @default 2
 */
export function prettyBytes(bytes: number, decimals = 2) {
    if (!Number.isFinite(bytes)) {
        throw new TypeError(`Expected a finite number, got ${typeof bytes}: ${bytes}`);
    }

    const neg = bytes < 0;

    if (neg) {
        bytes = -bytes;
    }

    if (bytes < 1) {
        return (neg ? "-" : "") + bytes + " B";
    }

    const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1000)), UNITS.length - 1);
    const numStr = Number((bytes / Math.pow(1000, exponent)).toPrecision(decimals + 1));
    const unit = UNITS[exponent];

    return (neg ? "-" : "") + numStr + " " + unit;
}
