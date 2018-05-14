import { Injector } from "@angular/core";
import { ServerError } from "@batch-flask/core";
import { BackgroundTaskService } from "@batch-flask/ui/background-task";
import { DialogService } from "@batch-flask/ui/dialogs";
import { NotificationService } from "@batch-flask/ui/notifications";
import { Permission } from "@batch-flask/ui/permission";
import { exists, log, nil } from "@batch-flask/utils";
import * as inflection from "inflection";
import { Observable } from "rxjs";

import { ActionableEntity, EntityCommands } from "./entity-commands";

export enum EntityCommandNotify {
    Always,
    Never,
    OnFailure,
}

export interface EntityCommandAttributes<TEntity extends ActionableEntity, TOptions = void> {
    label: ((entity: TEntity) => string) | string;
    icon?: ((entity: TEntity) => string) | string;
    action: (entity: TEntity, option?: TOptions) => Observable<any> | void;
    enabled?: (entity: TEntity) => boolean;
    visible?: (entity: TEntity) => boolean;
    multiple?: boolean;
    confirm?: ((entities: TEntity[]) => Observable<TOptions>) | boolean;
    notify?: EntityCommandNotify | boolean;
    permission?: Permission;
    tooltipPosition?: string;
}

/**
 * Entity command is a commnad available to an entity
 */
export class EntityCommand<TEntity extends ActionableEntity, TOptions = void> {
    public notify: EntityCommandNotify;
    public multiple: boolean;
    public enabled: (entity: TEntity) => boolean;
    public visible: (entity: TEntity) => boolean;
    public confirm: ((entities: TEntity[]) => Observable<TOptions>) | boolean;
    public definition: EntityCommands<TEntity>;
    public permission: Permission;
    public tooltipPosition: string;

    private _action: (entity: TEntity, option?: TOptions) => Observable<any> | void;
    private _label: ((entity: TEntity) => string) | string;
    private _icon: ((entity: TEntity) => string) | string;

    // Services
    private dialogService: DialogService;
    private notificationService: NotificationService;
    private backgroundTaskService: BackgroundTaskService;

    constructor(injector: Injector, attributes: EntityCommandAttributes<TEntity, TOptions>) {
        this.notificationService = injector.get(NotificationService);
        this.dialogService = injector.get(DialogService);
        this.backgroundTaskService = injector.get(BackgroundTaskService);

        this._label = attributes.label;
        this._icon = attributes.icon || "fa fa-question";
        this._action = attributes.action;
        this.multiple = exists(attributes.multiple) ? attributes.multiple : true;
        this.enabled = attributes.enabled || (() => true);
        this.visible = attributes.visible || (() => true);
        this.confirm = exists(attributes.confirm) ? attributes.confirm : true;
        this.permission = attributes.permission || Permission.Read;
        this.tooltipPosition = attributes.tooltipPosition || "above";
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

    public icon(entity: TEntity) {
        return this._icon instanceof Function ? this._icon(entity) : this._icon;
    }

    public disabled(entity: TEntity) {
        return this.enabled instanceof Function ? !this.enabled(entity) : !this.enabled;
    }

    public isVisible(entity: TEntity) {
        return this.visible instanceof Function ? this.visible(entity) : this.visible;
    }

    public performAction(entity: TEntity, option: TOptions): Observable<any> {
        const obs = this._action(entity, option);
        if (!obs) {
            return Observable.of(null);
        }
        return obs;
    }

    public execute(entity: TEntity) {
        if (this.confirm) {
            if (this.confirm instanceof Function) {
                this.confirm([entity]).subscribe((options) => {
                    this._executeCommand(entity, options);
                });
            } else {
                const label = this.label(entity);
                const type = this.definition.typeName.toLowerCase();
                this.dialogService.confirm(`Are you sure your want to ${label.toLowerCase()} these ${type}`, {
                    description: `You are about to ${label.toLowerCase()} ${entity.id}`,
                    yes: () => {
                        this._executeCommand(entity);
                    },
                });
            }
        } else {
            this._executeCommand(entity);
        }
    }

    public executeMultiple(entities: TEntity[]) {
        if (this.confirm) {
            if (this.confirm instanceof Function) {
                this.confirm(entities).subscribe((options) => {
                    this._executeMultiple(entities, options);
                });
            } else {
                const type = inflection.pluralize(this.definition.typeName.toLowerCase());
                const label = this.label(entities.first());
                this.dialogService.confirm(
                    `Are you sure your want to ${label.toLowerCase()} those ${entities.length} ${type}`,
                    {
                        yes: () => {
                            this._executeMultiple(entities);
                        },
                    });
            }
        } else {
            this._executeMultiple(entities);
        }
    }

    private _executeCommand(entity: TEntity, options?: any) {
        const label = this.label(entity);
        this.performAction(entity, options).subscribe({
            next: () => {
                this._notifySuccess(`${label} was successfull.`, `${entity.id}`);
                this.definition.get((entity as any).id).subscribe({
                    error: () => null,
                });
            },
            error: (e: ServerError) => {
                this._notifyError(`${label} failed.`, `${entity.id} ${e.message}`);
                log.error(`Failed to execute command ${label} for entity ${entity.id}`, e);
            },
        });
    }

    private _executeMultiple(entities: TEntity[], options?: any) {
        const label = this.label(entities[0]);
        const enabledEntities = entities.filter(x => this.enabled(x));
        const type = inflection.pluralize(this.definition.typeName.toLowerCase());
        this.backgroundTaskService.startTasks(`${label} ${type}`, enabledEntities.map((entity) => {
            return {
                name: `${label} ${entity.id}`,
                func: () => this.performAction(entity, options),
            };
        })).subscribe((result) => {
            this._notifySuccess(`${label} was successfull.`,
                `${result.succeeded}/${entities.length}`);
        });
    }

    private _notifySuccess(message: string, description: string) {
        if (this.notify === EntityCommandNotify.Always) {
            this.notificationService.success(message, description);
        }
    }

    private _notifyError(message: string, description: string) {
        if (this.notify !== EntityCommandNotify.Never) {
            this.notificationService.error(message, description);
        }
    }
}
