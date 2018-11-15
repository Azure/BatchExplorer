export class ObjectUtils {
    /**
     * Return the values of an object.
     */
    public static values<T>(obj: { [key: string]: T }): T[];
    public static values(obj: any): any;
    public static values(obj: any): any {
        return Object.keys(obj).map(x => obj[x]);
    }

    /**
     * Return a new object with only the specified keys
     * e.g.
     * slice({a: 1, b:2, c:3}, ['b', 'c']) {b:2, c:3}
     */
    public static slice(obj: { [key: string]: any }, keys: string[]): { [key: string]: any } {
        const out = {};
        for (const key of keys) {
            if (key in obj) {
                out[key] = obj[key];
            }
        }
        return out;
    }

    /**
     * Return a new object without the specified keys
     * e.g.
     * except({a: 1, b:2, c:3}, ['b']) {a: 1, c:3}
     */
    public static except(obj: { [key: string]: any }, keys: string[]): { [key: string]: any } {
        const out = Object.assign({}, obj);
        for (const key of keys) {
            delete out[key];
        }
        return out;
    }

    /**
     * This will remove all the entry in the object which are null or undefined
     * e.g.
     * compact({a: null, b: undefined, c: 1}) => {c: 1}
     */
    public static compact(obj: { [key: string]: any }): { [key: string]: any } {
        const out = {};
        for (const key of Object.keys(obj)) {
            if (obj[key] !== null && obj[key] !== undefined) {
                out[key] = obj[key];
            }
        }
        return out;
    }

    /**
     * Serialize a simple object to a form that is supposed to be always the same.
     */
    public static serialize(obj: { [key: string]: any }) {
        if (!obj) { return ""; }

        return Object.keys(obj)
            .sort()
            .map(x => `${x}:${obj[x]}`).join(",");
    }
}

/**
 * @returns true if obj is NOT null or undefined
 */
export function exists<T>(obj: T | null | undefined): obj is T {
    return obj !== undefined && obj !== null;
}

/**
 * @returns true if obj is null or undefined
 */
export function nil<T>(obj: T | null | undefined): obj is (undefined | null) {
    return !exists<T>(obj);
}
