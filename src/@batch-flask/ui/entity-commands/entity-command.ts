import { exists, nil } from "@batch-flask/utils";
import { Observable } from "rxjs";

export interface EntityCommandAttributes<TEntity> {
    label: ((entity: TEntity) => string) | string;
    action: (entity: TEntity, option?: any) => Observable<any> | void;
    enabled?: (entity: TEntity) => boolean;
    multiple?: boolean;
    confirm?: ((entities: TEntity[]) => Observable<any>) | boolean;
}

/**
 * Entity command is a commnad available to an entity
 */
export class EntityCommand<TEntity> {
    public multiple: boolean;
    public enabled: (entity: TEntity) => boolean;
    public confirm: ((entities: TEntity[]) => Observable<any>) | boolean;

    private _action: (entity: TEntity, option?: any) => Observable<any> | void;
    private _label: ((entity: TEntity) => string) | string;

    constructor(attributes: EntityCommandAttributes<TEntity>) {
        this._label = attributes.label;
        this._action = attributes.action;
        this.multiple = exists(attributes.multiple) ? attributes.multiple : true;
        this.enabled = attributes.enabled || (() => true);
        this.confirm = exists(attributes.confirm) ? attributes.confirm : true;
    }

    public label(entity: TEntity) {
        return this._label instanceof Function ? this._label(entity) : this._label;
    }

    public execute(entity: TEntity, option: any): Observable<any> {
        const obs = this._action(entity, option);
        if (!obs) {
            return Observable.of(null);
        }
        return obs;
    }
}
