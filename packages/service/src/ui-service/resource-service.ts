export interface ResourceService<T> {
    list(subscriptionId?: string): Promise<T[]>;
    get(id: string): Promise<T | null>;
    create(resource: T): Promise<void>;
    remove(resource: T): Promise<void>;
    update(resource: T): Promise<void>;
}
