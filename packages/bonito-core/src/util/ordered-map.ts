export class OrderedMap<K, V> implements Map<K, V> {
    protected _keys: K[] = [];
    protected _valueMap: Map<K, V> = new Map();

    get size(): number {
        return this._valueMap.size;
    }

    get [Symbol.toStringTag](): string {
        return `[OrderedMap size=${this._valueMap.size}]`;
    }

    clear(): void {
        this._keys = [];
        this._valueMap.clear();
    }

    delete(key: K): boolean {
        const targetIndex = this._getIndexForKey(key);
        if (targetIndex != null) {
            this._keys.splice(targetIndex, 1);
        }
        return this._valueMap.delete(key);
    }

    forEach(
        callbackfn: (value: V, key: K, map: Map<K, V>) => void,
        thisArg?: unknown
    ): void {
        for (const k of this._keys) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            callbackfn.call(thisArg, this._valueMap.get(k)!, k, this);
        }
    }

    get(key: K): V | undefined {
        return this._valueMap.get(key);
    }

    /**
     * Gets a value from the map, or throws an error if the value isn't defined
     * @param key The lookup key
     * @returns The value matching the given key
     */
    getRequired(key: K): V {
        const value = this.get(key);
        if (value == null) {
            throw new Error(
                `Unable to find an entry with a key of "${key}" in the map`
            );
        }
        return value;
    }

    has(key: K): boolean {
        return this._valueMap.has(key);
    }

    set(key: K, value: V): this {
        if (this._valueMap.has(key)) {
            // Update
            this._valueMap.set(key, value);
        } else {
            // Insert
            this._keys.push(key);
            this._valueMap.set(key, value);
        }

        return this;
    }

    insertAtIndex(index: number, key: K, value: V): this {
        if (this._valueMap.has(key)) {
            throw new Error(`Map already contains key ${key}`);
        }
        if (index > this._keys.length) {
            throw new Error(
                `Failed to insert at index ${index}: Map has a length of ${this._keys.length}.`
            );
        }
        this._keys.splice(index, 0, key);
        this._valueMap.set(key, value);
        return this;
    }

    insertAfter(afterKey: K, key: K, value: V): this {
        if (this._valueMap.has(key)) {
            throw new Error(`Map already contains key ${key}`);
        }
        const targetIndex = this._getIndexForKey(afterKey);
        if (targetIndex == null) {
            throw new Error(
                `Cannot insert: key ${afterKey} was not found in the map.`
            );
        }
        return this.insertAtIndex(targetIndex + 1, key, value);
    }

    insertBefore(beforeKey: K, key: K, value: V): this {
        if (this._valueMap.has(key)) {
            throw new Error(`Map already contains key ${key}`);
        }
        const targetIndex = this._getIndexForKey(beforeKey);
        if (targetIndex == null) {
            throw new Error(
                `Cannot insert: key ${beforeKey} was not found in the map.`
            );
        }
        return this.insertAtIndex(targetIndex, key, value);
    }

    entries(): IterableIterator<[K, V]> {
        let idx = 0;
        const keys = this._keys;
        const map = this._valueMap;
        return {
            *[Symbol.iterator](): IterableIterator<[K, V]> {
                let result = this.next();
                while (!result.done) {
                    yield result.value;
                    result = this.next();
                }
            },

            next(): IteratorResult<[K, V]> {
                if (idx < keys.length) {
                    const k = keys[idx++];
                    return {
                        done: false,
                        value: [k, map.get(k) as V],
                    };
                } else {
                    return {
                        done: true,
                        value: null,
                    };
                }
            },
        };
    }

    keys(): IterableIterator<K> {
        let idx = 0;
        const keys = this._keys;
        return {
            *[Symbol.iterator](): IterableIterator<K> {
                let result = this.next();
                while (!result.done) {
                    yield result.value;
                    result = this.next();
                }
            },

            next(): IteratorResult<K> {
                if (idx < keys.length) {
                    const k = keys[idx++];
                    return {
                        done: false,
                        value: k,
                    };
                } else {
                    return {
                        done: true,
                        value: null,
                    };
                }
            },
        };
    }

    values(): IterableIterator<V> {
        let idx = 0;
        const keys = this._keys;
        const map = this._valueMap;
        return {
            *[Symbol.iterator](): IterableIterator<V> {
                let result = this.next();
                while (!result.done) {
                    yield result.value;
                    result = this.next();
                }
            },

            next(): IteratorResult<V> {
                if (idx < keys.length) {
                    const k = keys[idx++];
                    return {
                        done: false,
                        value: map.get(k) as V,
                    };
                } else {
                    return {
                        done: true,
                        value: null,
                    };
                }
            },
        };
    }

    [Symbol.iterator](): IterableIterator<[K, V]> {
        return this.entries();
    }

    private _getIndexForKey(key: K): number | null {
        let targetIndex: number | null = null;
        for (let i = 0; i < this._keys.length; i++) {
            if (this._keys[i] === key) {
                targetIndex = i;
                break;
            }
        }
        return targetIndex;
    }
}
