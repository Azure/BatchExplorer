/**
 * Data store is a generic interface for saving key values
 */
export interface DataStore {
    size: number;

    setItem<T= string>(key: string, value: T): Promise<void>;

    getItem<T= string>(key: string): Promise<T>;

    removeItem(key: string): Promise<void>;

    clear(): Promise<void>;
}
