import { DependencyFactories } from "../environment";

export class DiContainer<D extends DependencyFactories = DependencyFactories> {
    private _map: D;
    private _cache: Map<string, unknown> = new Map();

    constructor(dependencyMap: D) {
        this._map = dependencyMap;
    }

    get(dependencyName: string): unknown {
        if (this._cache.has(dependencyName)) {
            return this._cache.get(dependencyName);
        }

        if (!(dependencyName in this._map)) {
            throw new Error(`No dependency found named '${dependencyName}'`);
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dep: unknown = (this._map as any)[dependencyName]?.apply(null);
        if (!dep) {
            throw new Error(`Failed to create dependency '${dependencyName}'`);
        }
        this._cache.set(dependencyName, dep);
        return dep;
    }
}
