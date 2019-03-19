/**
 * Data store is a generic interface for saving key values
 */
export abstract class DataStore {
    public abstract size: number;

    public abstract setItem<T= string>(key: string, value: T): Promise<void>;

    public abstract getItem<T= string>(key: string): Promise<T | null | undefined>;

    public abstract removeItem(key: string): Promise<void>;

    public abstract clear(): Promise<void>;
}
