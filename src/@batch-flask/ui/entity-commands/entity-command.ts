import { Injector } from "@angular/core";
import { ServerError } from "@batch-flask/core";
import { BackgroundTaskService } from "@batch-flask/ui/background-task";
import { DialogService } from "@batch-flask/ui/dialogs";
import { NotificationService } from "@batch-flask/ui/notifications";
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
    action: (entity: TEntity, option?: TOptions) => Observable<any> | void;
    enabled?: (entity: TEntity) => boolean;
    multiple?: boolean;
    confirm?: ((entities: TEntity[]) => Observable<TOptions>) | boolean;
    notify?: EntityCommandNotify | boolean;
}

/**
 * Entity command is a commnad available to an entity
 */
export class EntityCommand<TEntity extends ActionableEntity, TOptions = void> {
    public notify: EntityCommandNotify;
    public multiple: boolean;
    public enabled: (entity: TEntity) => boolean;
    public confirm: ((entities: TEntity[]) => Observable<TOptions>) | boolean;
    public definition: EntityCommands<TEntity>;

    private _action: (entity: TEntity, option?: TOptions) => Observable<any> | void;
    private _label: ((entity: TEntity) => string) | string;

    // Services
    private dialogService: DialogService;
    private notificationService: NotificationService;
    private backgroundTaskService: BackgroundTaskService;

    constructor(injector: Injector, attributes: EntityCommandAttributes<TEntity, TOptions>) {
        this.notificationService = injector.get(NotificationService);
        this.dialogService = injector.get(DialogService);
        this.backgroundTaskService = injector.get(BackgroundTaskService);

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
        this.backgroundTaskService.startTask("", (task) => {
            const obs = Observable.from(enabledEntities)
                .concatMap((entity, index) => {
                    task.name.next(`${label} (${index + 1}/${entities.length})`);
                    return this.performAction(entity, options).map(x => ({ entity, index }));
                }).share();

            obs.subscribe({
                next: ({ entity, index }) => {
                    task.progress.next((index + 1) / entities.length * 100);
                    this.definition.get((entity as any).id).subscribe();
                },
                error: (e: ServerError) => {
                    log.error(`Failed to execute command ${label}`, e);
                },
            });

            return obs;
        }).subscribe(() => {
            this._notifySuccess(`${label} was successfull.`,
                `${enabledEntities.length}/${entities.length}`);
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
