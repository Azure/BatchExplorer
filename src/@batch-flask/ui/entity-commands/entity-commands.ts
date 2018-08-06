import { Injector, Type } from "@angular/core";
import { ListSelection } from "@batch-flask/core/list/list-selection";
import { BackgroundTaskService } from "@batch-flask/ui/background-task";
import { ContextMenu, ContextMenuItem } from "@batch-flask/ui/context-menu";
import { DialogService } from "@batch-flask/ui/dialogs";
import { NotificationService } from "@batch-flask/ui/notifications";
import { log } from "@batch-flask/utils";
import { Observable, forkJoin, of } from "rxjs";
import { map } from "rxjs/operators";
import { EntityCommand, EntityCommandAttributes } from "./entity-command";

export interface ActionableEntity {
    id: string;
}

export interface EntityCommandsConfig {
    feature?: string;
}

/**
 * Entity commands is a wrapper for all actions/commands available to an entity
 */
export abstract class EntityCommands<TEntity extends ActionableEntity, TParams = {}> {
    public dialogService: DialogService;
    public notificationService: NotificationService;
    public backgroundTaskService: BackgroundTaskService;
    public params: TParams = {} as TParams;

    public commands: Array<EntityCommand<TEntity, any>>;

    constructor(private injector: Injector, public typeName: string, public config: EntityCommandsConfig = {}) {
        this.notificationService = injector.get(NotificationService);
        this.dialogService = injector.get(DialogService);
        this.backgroundTaskService = injector.get(BackgroundTaskService);
    }

    public abstract get(id: string): Observable<TEntity>;
    public abstract getFromCache(id: string): Observable<TEntity>;

    public contextMenuFromSelection(selection: ListSelection): Observable<ContextMenu> {
        if (selection.hasMultiple()) {
            return this.contextMenuFromIds([...selection.keys]);
        } else {
            return this.contextMenuFromId(selection.first());
        }
    }

    public contextMenuFromId(id: string): Observable<ContextMenu> {
        if (!id) {
            log.warn(`Cannot display context menu for as there is no ids provided`);
            return of(null);
        }
        return this.getFromCache(id).pipe(map((entity) => {
            if (!entity) {
                log.warn(`Entity with id ${id} was not loaded from the cache. Not displaying context menu.`);
                return null;
            }
            return this.contextMenuFromEntity(entity);
        }));
    }

    public contextMenuFromIds(ids: string[]): Observable<ContextMenu> {
        const obs = ids.map(id => this.getFromCache(id));
        return forkJoin(obs).pipe(map((entities) => {
            return this.contextMenuFromEntities(entities);
        }));
    }

    public contextMenuFromEntity(entity: TEntity): ContextMenu {
        return new ContextMenu(this.commands.map((command) => {
            if (!command.visible(entity)) {
                return null;
            }

            return new ContextMenuItem({
                label: command.label(entity),
                click: () => {
                    command.execute(entity);
                },
                enabled: command.enabled(entity),
            });
        }));
    }

    public contextMenuFromEntities(entities: TEntity[]): ContextMenu {
        const menuItems = this.commands
            .filter(x => x.multiple)
            .map((command) => {
                const label = command.label(entities[0]);
                const matching = entities.filter(x => command.enabled(x)).length;
                const enabled = matching > 0;

                return new ContextMenuItem({
                    label: `${label} (${matching})`,
                    click: () => {
                        command.executeMultiple(entities);
                    },
                    enabled,
                });
            });
        return new ContextMenu(menuItems);
    }

    protected command<T extends EntityCommand<TEntity, any>>(type: Type<T>): T {
        const command = new type(this.injector);
        command.definition = this;
        return command;
    }

    protected simpleCommand<TOptions = void>(
        attrs: EntityCommandAttributes<TEntity, TOptions>): EntityCommand<TEntity, TOptions> {

        const command = new EntityCommand(this.injector, attrs);
        command.definition = this;
        return command;
    }
}
