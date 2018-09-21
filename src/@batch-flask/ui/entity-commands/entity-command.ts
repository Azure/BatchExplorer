import { Injector } from "@angular/core";
import { I18nService, ServerError, TelemetryService } from "@batch-flask/core";
import { ListSelection } from "@batch-flask/core/list";
import { Activity, ActivityService, ActivityStatus } from "@batch-flask/ui/activity";
import { DialogService } from "@batch-flask/ui/dialogs";
import { NotificationService } from "@batch-flask/ui/notifications";
import { Permission } from "@batch-flask/ui/permission";
import { WorkspaceService } from "@batch-flask/ui/workspace";
import { exists, log, nil } from "@batch-flask/utils";
import { Constants } from "common";
import * as inflection from "inflection";
import { Observable, forkJoin, of } from "rxjs";
import { map, share } from "rxjs/operators";
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
    private i18n: I18nService;
    private telemetryService: TelemetryService;

    constructor(injector: Injector, attributes: EntityCommandAttributes<TEntity, TOptions>) {
        this.notificationService = injector.get(NotificationService);
        this.dialogService = injector.get(DialogService);
        this.activityService = injector.get(ActivityService);
        this.workspaceService = injector.get(WorkspaceService);
        this.i18n = injector.get(I18nService);
        this.telemetryService = injector.get(TelemetryService);

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

    /**
     * Try to execute the command for the given entity.
     * This will ask for confirmation unless command explicity configured not to
     */
    public execute(entity: TEntity) {
        this._trackAction(1);
        if (this.confirm) {
            if (this.confirm instanceof Function) {
                this.confirm([entity]).subscribe((options) => {
                    this._executeCommand(entity, options);
                });
            } else {
                const label = this.label(entity);
                const type = this.definition.typeName.toLowerCase();
                const message = this.i18n.t("entity-command.confirm.single.title", {
                    action: label.toLowerCase(),
                    type,
                });
                const description = this.i18n.t("entity-command.confirm.single.description", {
                    action: label.toLowerCase(),
                    entityId: entity.id,
                });
                this.dialogService.confirm(message, {
                    description,
                    yes: () => {
                        this._executeCommand(entity);
                    },
                });
            }
        } else {
            this._executeCommand(entity);
        }
    }

    /**
     * Try to execute the command for the given entities.
     * This will ask for confirmation unless command explicity configured not to
     */
    public executeMultiple(entities: TEntity[]) {
        this._trackAction(entities.length);
        if (this.confirm) {
            if (this.confirm instanceof Function) {
                this.confirm(entities).subscribe((options) => {
                    this._executeMultiple(entities, options);
                });
            } else {
                const type = inflection.pluralize(this.definition.typeName.toLowerCase());
                const label = this.label(entities.first());
                const message = this.i18n.t("entity-command.confirm.multiple.title", {
                    action: label.toLowerCase(),
                    count: entities.length,
                    type,
                });
                this.dialogService.confirm(
                    message,
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

    public executeMultipleByIds(ids: string[]) {
        const obs = ids.map(id => this.definition.getFromCache(id));
        return forkJoin(obs).pipe(
            map(entities => this.executeMultiple(entities)),
            share(),
        );
    }

    public executeFromSelection(selection: ListSelection) {
        return this.executeMultipleByIds([...selection.keys]);
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
        activity.done.subscribe((status) => {
            if (status === ActivityStatus.Completed) {
                this._notifySuccess(`${label} was successful.`, "");
            }
        });

        // run the parent activity
        this.activityService.exec(activity);
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
        if (!feature) { return true; }
        return this.workspaceService.isFeatureEnabled(`${feature}.${this.name}`);
    }

    private _trackAction(count: number) {
        this.telemetryService.trackEvent({
            name: Constants.TelemetryEvents.executeAction,
            properties: {
                name: this.name,
                count,
            },
        });
    }
}
