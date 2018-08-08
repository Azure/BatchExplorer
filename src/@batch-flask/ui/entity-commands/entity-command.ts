import { Injector } from "@angular/core";
import { ServerError } from "@batch-flask/core";
import { DialogService } from "@batch-flask/ui/dialogs";
import { NotificationService } from "@batch-flask/ui/notifications";
import { Permission } from "@batch-flask/ui/permission";
import { WorkspaceService } from "@batch-flask/ui/workspace";
import { exists, log, nil } from "@batch-flask/utils";
import * as inflection from "inflection";
import { Observable, of } from "rxjs";

import { Activity, ActivityService } from "@batch-flask/ui/activity-monitor";
import { ActionableEntity, EntityCommands } from "./entity-commands";

export enum EntityCommandNotify {
    Always,
    Never,
    OnFailure,
}

export interface EntityCommandAttributes<TEntity extends ActionableEntity, TOptions = void> {
    /**
     * Name is to be used by feature to show buttons. Or to define keyboard shortcuts
     */
    name: string;
    label: ((entity: TEntity) => string) | string;
    icon?: ((entity: TEntity) => string) | string;
    action: (entity: TEntity, option?: TOptions) => Observable<any> | void;
    enabled?: (entity: TEntity) => boolean;
    visible?: (entity: TEntity) => boolean;
    multiple?: boolean;
    confirm?: ((entities: TEntity[]) => Observable<TOptions>) | boolean;
    notify?: EntityCommandNotify | boolean;
    permission?: Permission;
}

/**
 * Entity command is a commnad available to an entity
 */
export class EntityCommand<TEntity extends ActionableEntity, TOptions = void> {
    public name: string;
    public notify: EntityCommandNotify;
    public multiple: boolean;
    public enabled: (entity: TEntity) => boolean;
    public confirm: ((entities: TEntity[]) => Observable<TOptions>) | boolean;
    public definition: EntityCommands<TEntity>;
    public permission: Permission;
    public feature: string;

    private _action: (entity: TEntity, option?: TOptions) => Observable<any> | void;
    private _label: ((entity: TEntity) => string) | string;
    private _icon: ((entity: TEntity) => string) | string;
    private _visible: (entity: TEntity) => boolean;

    // Services
    private dialogService: DialogService;
    private notificationService: NotificationService;
    private activityService: ActivityService;
    private workspaceService: WorkspaceService;

    constructor(injector: Injector, attributes: EntityCommandAttributes<TEntity, TOptions>) {
        this.notificationService = injector.get(NotificationService);
        this.dialogService = injector.get(DialogService);
        this.activityService = injector.get(ActivityService);
        this.workspaceService = injector.get(WorkspaceService);

        this.name = attributes.name;
        this._label = attributes.label;
        this._icon = attributes.icon || "fa fa-question";
        this._action = attributes.action;
        this.multiple = exists(attributes.multiple) ? attributes.multiple : true;
        this.enabled = attributes.enabled || (() => true);
        this._visible = attributes.visible || (() => true);
        this.confirm = exists(attributes.confirm) ? attributes.confirm : true;
        this.permission = attributes.permission || Permission.Read;
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
        return !this.enabled(entity);
    }

    public visible(entity: TEntity) {
        return this._visible(entity) && this._isFeatureEnabled();
    }

    public performAction(entity: TEntity, option: TOptions): Observable<any> {
        const obs = this._action(entity, option);
        if (!obs) {
            return of(null);
        }
        return obs;
    }

    public performActionAndRefresh(entity: TEntity, option: TOptions): Observable<any> {
        const obs = this.performAction(entity, option);
        obs.subscribe({
            complete: () => {
                this.definition.get(entity.id).subscribe({
                    error: () => null,
                });
            },
            error: () => {
                this.definition.get(entity.id).subscribe({
                    error: () => null,
                });
            },
        });
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
                this.dialogService.confirm(`Are you sure you want to ${label.toLowerCase()} this ${type}`, {
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
                    `Are you sure you want to ${label.toLowerCase()} these ${entities.length} ${type}s`,
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
        this.performActionAndRefresh(entity, options).subscribe({
            next: () => {
                this._notifySuccess(`${label} was successful.`, `${entity.id}`);
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

        // create an activity that creates a list of subactivities
        const activity = new Activity(`${label} ${type}`, () => {
            // create a subactivity for each enabled entity
            const subActivities = enabledEntities.map((entity) => {
                return new Activity(`${label} ${entity.id}`, () => {
                    // each subactivity should perform an action and refresh
                    return this.performActionAndRefresh(entity, options);
                });
            });
            return of(subActivities);
        });

        // notify success after the parent activity completes
        activity.done.subscribe((result) => {
            this._notifySuccess(`${label} was successful.`, "");
        });

        // run the parent activity
        this.activityService.loadAndRun(activity);
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

    private _isFeatureEnabled(): boolean {
        const feature = this.definition.config.feature;
        if (!feature) {return true; }
        return this.workspaceService.isFeatureEnabled(`${feature}.${this.name}`);
    }
}
