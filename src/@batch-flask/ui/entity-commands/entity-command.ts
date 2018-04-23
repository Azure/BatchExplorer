import { exists, nil } from "@batch-flask/utils";
import { Observable } from "rxjs";

export enum EntityCommandNotify {
    Always,
    Never,
    OnFailure,
}

export interface EntityCommandAttributes<TEntity, TOptions = void> {
    label: ((entity: TEntity) => string) | string;
    action: (entity: TEntity, option?: TOptions) => Observable<any> | void;
    enabled?: (entity: TEntity) => boolean;
    multiple?: boolean;
    confirm?: ((entities: TEntity[]) => Observable<TOptions>) | boolean;
    notify?: EntityCommandNotify | boolean;
}

/**
 * Entity command is a commnad available to an entity
 */
export class EntityCommand<TEntity, TOptions = void> {
    public notify: EntityCommandNotify;
    public multiple: boolean;
    public enabled: (entity: TEntity) => boolean;
    public confirm: ((entities: TEntity[]) => Observable<TOptions>) | boolean;

    private _action: (entity: TEntity, option?: TOptions) => Observable<any> | void;
    private _label: ((entity: TEntity) => string) | string;

    constructor(attributes: EntityCommandAttributes<TEntity, TOptions>) {
        this._label = attributes.label;
        this._action = attributes.action;
        this.multiple = exists(attributes.multiple) ? attributes.multiple : true;
        this.enabled = attributes.enabled || (() => true);
        this.confirm = exists(attributes.confirm) ? attributes.confirm : true;
        if (attributes.notify === true || nil(attributes.notify)) {
            this.notify = EntityCommandNotify.Always;
        } else if (attributes.notify === false) {
            this.notify = EntityCommandNotify.Never;
        } else {
            this.notify = attributes.notify;
        }
    }

    public label(entity: TEntity) {
        return this._label instanceof Function ? this._label(entity) : this._label;
    }

    public execute(entity: TEntity, option: TOptions): Observable<any> {
        const obs = this._action(entity, option);
        if (!obs) {
            return Observable.of(null);
        }
        return obs;
    }
}
