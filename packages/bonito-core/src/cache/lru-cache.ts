import { CacheManager } from "./cache-manager";

class LruEntry {
    key: string;
    next: LruEntry | null;
    prev: LruEntry | null;

    constructor(key: string) {
        this.key = key;
        this.next = null;
        this.prev = null;
    }
}

export class LruCache {
    private _head: LruEntry;

    private _tail: LruEntry;

    private _map: Map<string, LruEntry>;

    constructor(
        public cacheManager: CacheManager,
        public capacity: number
    ) {
        if (capacity <= 0) {
            throw new Error(`Invalid capacity: ${capacity}`);
        }
        this._head = new LruEntry("");
        this._tail = new LruEntry("");
        this._head.next = this._tail;
        this._tail.prev = this._head;
        this._map = new Map();
    }

    private _moveToHead(entry: LruEntry) {
        this._removeEntry(entry);
        this._addEntry(entry);
    }

    private _removeEntry(entry: LruEntry) {
        const prev = entry.prev;
        const next = entry.next;

        if (prev) {
            prev.next = next;
        }

        if (next) {
            next.prev = prev;
        }
    }

    private _addEntry(entry: LruEntry) {
        const next = this._head?.next;
        if (!next) {
            throw new Error("Invalid state: head's next is null");
        }

        this._head.next = entry;
        entry.prev = this._head;

        entry.next = next;
        next.prev = entry;
    }

    private _checkCapacity() {
        if (this._map.size > this.capacity) {
            const toRemove = this._tail.prev;
            if (!toRemove) {
                throw new Error("Invalid state: tail's prev is null");
            }
            this._removeEntry(toRemove);
            this._map.delete(toRemove.key);
            this.cacheManager.remove(toRemove.key);
        }
    }

    recordGet(key: string) {
        const entry = this._map.get(key);
        if (entry) {
            this._moveToHead(entry);
        }
    }

    recordSet(key: string) {
        let entry = this._map.get(key);
        if (entry) {
            this._moveToHead(entry);
            return;
        }
        entry = new LruEntry(key);
        this._addEntry(entry);
        this._map.set(key, entry);
        this._checkCapacity();
    }

    recordRemove(key: string) {
        const entry = this._map.get(key);
        if (entry) {
            this._removeEntry(entry);
            this._map.delete(key);
        }
    }

    recordClear() {
        this._map.clear();
        this._head.next = this._tail;
        this._tail.prev = this._head;
    }

    getHead(): LruEntry | null {
        const head = this._head.next;
        if (!head || head === this._tail) {
            return null;
        }
        return head;
    }

    getSize(): number {
        return this._map.size;
    }
}
