import { HttpHeaders } from "./http-client";
import { isHttpHeaders } from "./http-util";

/**
 * HTTP header implementation backed by an in-memory map
 */
export class MapHttpHeaders implements HttpHeaders {
    private _map: Record<string, string[]> = {};

    constructor(headers?: HttpHeaders | Record<string, string>) {
        if (isHttpHeaders(headers)) {
            headers.forEach((value, key) => {
                this.append(key, value);
            });
        } else if (headers) {
            for (const [key, value] of Object.entries(headers)) {
                this.append(key, value);
            }
        }
    }

    append(name: string, value: string): void {
        const values = this._map[name] ?? [];
        values.push(value);
        this._map[name] = values;
    }

    delete(name: string): void {
        delete this._map[name];
    }

    get(name: string): string | null {
        const values = this._map[name];
        if (values === null || values === undefined) {
            return null;
        }
        if (values.length > 1) {
            return values.join(", ");
        }
        return values[0];
    }

    has(name: string): boolean {
        return this._map[name] !== null && this._map[name] !== undefined;
    }

    set(name: string, value: string): void {
        this._map[name] = [value];
    }

    forEach(
        callback: (value: string, key: string, parent: HttpHeaders) => void
    ): void {
        for (const key of Object.keys(this._map)) {
            const value = this.get(key);
            if (value !== null && value !== undefined) {
                callback(value, key, this);
            }
        }
    }
}
