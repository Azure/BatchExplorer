import {
    HttpHeaders as PipelineHttpHeaders,
    RawHttpHeaders,
} from "@azure/core-rest-pipeline";
import {
    MapHttpHeaders,
    HttpHeaders as CommonHttpHeaders,
} from "@batch/ui-common/lib/http";

/**
 * HTTP Header implementation that adapts the Shared Library Http Headers
 * to the core-rest-pipeline header interface
 */
export class PipelineHttpHeadersImpl implements PipelineHttpHeaders {
    private _headers: CommonHttpHeaders;

    constructor(httpHeaders: CommonHttpHeaders) {
        this._headers = new MapHttpHeaders();
        httpHeaders.forEach((value: string, key: string) => {
            this.append(key, value);
        });
    }

    append(name: string, value: string): void {
        this._headers.append(name, value);
    }

    get(name: string): string | undefined {
        const headerValue = this._headers.get(name);
        return headerValue ?? undefined;
    }

    has(name: string): boolean {
        return this._headers.has(name);
    }

    set(name: string, value: string | number | boolean): void {
        this._headers.set(name, String(value));
    }

    delete(name: string): void {
        this._headers.delete(name);
    }

    /**
     * Iterate over tuples of header [name, value] pairs.
     */
    [Symbol.iterator](): Iterator<[string, string]> {
        return this.headerIterator();
    }

    *headerIterator(): IterableIterator<[string, string]> {
        for (const [name, value] of this._headers) {
            yield [name, value];
        }
    }

    /**
     * Get the JSON object representation of this HTTP header collection.
     */
    toJSON(options?: { preserveCase?: boolean }): RawHttpHeaders {
        const result: RawHttpHeaders = {};
        for (const [key, value] of this) {
            result[key] = value;
        }

        return result;
    }
}
