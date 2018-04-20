import { Injector } from "@angular/core";
import { DialogService } from "@batch-flask/ui/dialogs";
import { NotificationService } from "@batch-flask/ui/notifications";
import { Observable } from "rxjs";

import { ServerError } from "@batch-flask/core";
import { ListSelection } from "@batch-flask/core/list/list-selection";
import { ContextMenu, ContextMenuItem } from "@batch-flask/ui/context-menu";
import { log } from "@batch-flask/utils";
import { EntityCommand } from "./entity-command";

/**
 * Entity commands is a wrapper for all actions/commands available to an entity
 */
export class EntityCommands<TEntity> {
    public dialogService: DialogService;
    public notificationService: NotificationService;

    constructor(
        injector: Injector,
        private _get: (id: string) => Observable<TEntity>,
        private _getFromCache: (id: string) => Observable<TEntity>,
        public commands: Array<EntityCommand<TEntity>>) {
        this.notificationService = injector.get(NotificationService);
        this.dialogService = injector.get(DialogService);
    }

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
            return Observable.of(null);
        }
        return this._getFromCache(id).map((entity) => {
            if (!entity) {
                log.warn(`Entity with id ${id} was not loaded from the cache. Not displaying context menu.`);
                return null;
            }
            return this.contextMenuFromEntity(entity);
        });
    }

    public contextMenuFromIds(ids: string[]): Observable<ContextMenu> {
        const obs = ids.map(id => this._getFromCache(id));
        return Observable.forkJoin(obs).map((entities) => {
            return this.contextMenuFromEntities(entities);
        });
    }

    public contextMenuFromEntity(entity: TEntity): ContextMenu {
        return new ContextMenu(this.commands.map((command) => {
            return new ContextMenuItem({
                label: command.label(entity),
                click: () => {
                    this._executeCommand(command, entity);
                },
                enabled: command.enabled(entity),
            });
        }));
    }

    public contextMenuFromEntities(entities: TEntity[]): ContextMenu {
        return new ContextMenu(this.commands.map((command) => {
            return new ContextMenuItem({
                label: command.label(entities[0]),
                click: () => {
                    // command.action(entities[0]);
                },
                enabled: true,
            });
        }));
    }

    private _executeCommand(command, entity) {
        const label = command.label(entity);
        command.execute(entity).subscribe({
            next: () => {
                this.notificationService.success(`${label} was successfull.`, `${entity.id}`);
                this._get((entity as any).id).subscribe({
                    error: () => null,
                });
            },
            error: (e: ServerError) => {
                this.notificationService.error(`${label} failed.`, `${entity.id} ${e.message}`);
                log.error(`Failed to execute command ${label} for entity ${entity.id}`, e);
            },
        });
    }

}
