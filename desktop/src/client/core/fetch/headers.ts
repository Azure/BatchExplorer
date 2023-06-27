const invalidTokenRegex = /[^\^_`a-zA-Z\-0-9!#$%&'*+.|~]/;
const invalidHeaderCharRegex = /[^\t\x20-\x7e\x80-\xff]/;

/* eslint-disable @typescript-eslint/naming-convention,no-underscore-dangle,id-blacklist,id-match */

function validateName(name) {
    name = `${name}`;
    if (invalidTokenRegex.test(name)) {
        throw new TypeError(`${name} is not a legal HTTP header name`);
    }
}

function validateValue(value) {
    value = `${value}`;
    if (invalidHeaderCharRegex.test(value)) {
        throw new TypeError(`${value} is not a legal HTTP header value`);
    }
}

/**
 * Find the key in the map object given a header name.
 *
 * Returns undefined if not found.
 *
 * @param   String  name  Header name
 * @return  String|Undefined
 */
function find(map, name) {
    name = name.toLowerCase();
    for (const key in map) {
        if (key.toLowerCase() === name) {
            return key;
        }
    }
    return undefined;
}

const MAP = Symbol("map");

export class Headers {
    constructor(init?) {
        this[MAP] = Object.create(null);

        if (init instanceof Headers) {
            const rawHeaders = init.raw();
            const headerNames = Object.keys(rawHeaders);

            for (const headerName of headerNames) {
                for (const value of rawHeaders[headerName]) {
                    this.append(headerName, value);
                }
            }

            return;
        }

        // We don't worry about converting prop to ByteString here as append()
        // will handle it.
        if (init == null) {
            // no op
        } else if (typeof init === "object") {
            const method = init[Symbol.iterator];
            if (method != null) {
                if (typeof method !== "function") {
                    throw new TypeError("Header pairs must be iterable");
                }

                // sequence<sequence<ByteString>>
                // Note: per spec we have to first exhaust the lists then process them
                const pairs: any[] = [];
                for (const pair of init) {
                    if (typeof pair !== "object" || typeof pair[Symbol.iterator] !== "function") {
                        throw new TypeError("Each header pair must be iterable");
                    }
                    pairs.push(Array.from(pair));
                }

                for (const pair of pairs) {
                    if (pair.length !== 2) {
                        throw new TypeError("Each header pair must be a name/value tuple");
                    }
                    this.append(pair[0], pair[1]);
                }
            } else {
                // record<ByteString, ByteString>
                for (const key of Object.keys(init)) {
                    const value = init[key];
                    this.append(key, value);
                }
            }
        } else {
            throw new TypeError("Provided initializer must be an object");
        }
    }

    public get(name) {
        name = `${name}`;
        validateName(name);
        const key = find(this[MAP], name);
        if (key === undefined) {
            return null;
        }

        return this[MAP][key].join(", ");
    }

    public forEach(callback, thisArg?) {
        let pairs = getHeaders(this);
        let i = 0;
        while (i < pairs.length) {
            const [name, value] = pairs[i];
            callback.call(thisArg, value, name, this);
            pairs = getHeaders(this);
            i++;
        }
    }

    public set(name, value) {
        name = `${name}`;
        value = `${value}`;
        validateName(name);
        validateValue(value);
        const key = find(this[MAP], name);
        this[MAP][key !== undefined ? key : name] = [value];
    }

    public append(name, value) {
        name = `${name}`;
        value = `${value}`;
        validateName(name);
        validateValue(value);
        const key = find(this[MAP], name);
        if (key !== undefined) {
            this[MAP][key].push(value);
        } else {
            this[MAP][name] = [value];
        }
    }

    public has(name) {
        name = `${name}`;
        validateName(name);
        return find(this[MAP], name) !== undefined;
    }

    public delete(name) {
        name = `${name}`;
        validateName(name);
        const key = find(this[MAP], name);
        if (key !== undefined) {
            delete this[MAP][key];
        }
    }

    public raw() {
        return this[MAP];
    }

    public keys() {
        return createHeadersIterator(this, "key");
    }

    public values() {
        return createHeadersIterator(this, "value");
    }

    public [Symbol.iterator]() {
        return createHeadersIterator(this, "key+value");
    }
}

Object.defineProperty(Headers.prototype, Symbol.toStringTag, {
    value: "Headers",
    writable: false,
    enumerable: false,
    configurable: true,
});

Object.defineProperties(Headers.prototype, {
    get: { enumerable: true },
    forEach: { enumerable: true },
    set: { enumerable: true },
    append: { enumerable: true },
    has: { enumerable: true },
    delete: { enumerable: true },
    keys: { enumerable: true },
    values: { enumerable: true },
    entries: { enumerable: true },
});

function getHeaders(headers, kind = "key+value") {
    const keys = Object.keys(headers[MAP]).sort();
    return keys.map(
        kind === "key" ?
            k => k.toLowerCase() :
            kind === "value" ?
                k => headers[MAP][k].join(", ") :
                k => [k.toLowerCase(), headers[MAP][k].join(", ")],
    );
}

const INTERNAL = Symbol("internal");

function createHeadersIterator(target, kind) {
    const iterator = Object.create(HeadersIteratorPrototype);
    iterator[INTERNAL] = {
        target,
        kind,
        index: 0,
    };
    return iterator;
}

const HeadersIteratorPrototype = Object.setPrototypeOf({
    next() {
        // istanbul ignore if
        if (!this ||
            Object.getPrototypeOf(this) !== HeadersIteratorPrototype) {
            throw new TypeError("Value of `this` is not a HeadersIterator");
        }

        const {
            target,
            kind,
            index,
        } = this[INTERNAL];
        const values = getHeaders(target, kind);
        const len = values.length;
        if (index >= len) {
            return {
                value: undefined,
                done: true,
            };
        }

        this[INTERNAL].index = index + 1;

        return {
            value: values[index],
            done: false,
        };
    },
}, Object.getPrototypeOf(
    Object.getPrototypeOf([][Symbol.iterator]()),
    ));

Object.defineProperty(HeadersIteratorPrototype, Symbol.toStringTag, {
    value: "HeadersIterator",
    writable: false,
    enumerable: false,
    configurable: true,
});

/**
 * Export the Headers object in a form that Node.js can consume.
 *
 * @param   Headers  headers
 * @return  Object
 */
export function exportNodeCompatibleHeaders(headers) {
    const obj = Object.assign({ __proto__: null }, headers[MAP]);

    // http.request() only supports string as Host header. This hack makes
    // specifying custom Host header possible.
    const hostHeaderKey = find(headers[MAP], "Host");
    if (hostHeaderKey !== undefined) {
        obj[hostHeaderKey] = obj[hostHeaderKey][0];
    }

    return obj;
}

/**
 * Create a Headers object from an object of headers, ignoring those that do
 * not conform to HTTP grammar productions.
 *
 * @param   Object  obj  Object of headers
 * @return  Headers
 */
export function createHeadersLenient(obj) {
    const headers = new Headers();
    for (const name of Object.keys(obj)) {
        if (invalidTokenRegex.test(name)) {
            continue;
        }
        if (Array.isArray(obj[name])) {
            for (const val of obj[name]) {
                if (invalidHeaderCharRegex.test(val)) {
                    continue;
                }
                if (headers[MAP][name] === undefined) {
                    headers[MAP][name] = [val];
                } else {
                    headers[MAP][name].push(val);
                }
            }
        } else if (!invalidHeaderCharRegex.test(obj[name])) {
            headers[MAP][name] = [obj[name]];
        }
    }
    return headers;
}
