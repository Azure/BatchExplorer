import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import { List } from "immutable";
import { Observable, Subscription } from "rxjs";

import { MouseButton, PinnableEntity, PinnedEntityType } from "@batch-flask/core";
import { ContextMenu, ContextMenuItem, ContextMenuService, DropdownComponent } from "@batch-flask/ui";
import { BatchAccountService, PinnedEntityService } from "app/services";

import { filter } from "rxjs/operators";
import "./pinned-dropdown.scss";

@Component({
    selector: "bl-pinned-dropdown",
    templateUrl: "pinned-dropdown.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PinnedDropDownComponent implements OnInit, OnDestroy {
    public currentUrl: string;
    public favorites: Observable<List<PinnableEntity>>;
    public title: string = "";

    @ViewChild(DropdownComponent) private _dropdown: DropdownComponent;
    private _subscriptions: Subscription[] = [];
    private _accountEndpoint: string = "";

    constructor(
        private router: Router,
        private changeDetector: ChangeDetectorRef,
        private contextMenuService: ContextMenuService,
        private pinnedEntityService: PinnedEntityService,
        private accountService: BatchAccountService) {

        this.favorites = this.pinnedEntityService.favorites;
        this._subscriptions.push(this.favorites.subscribe((items) => {
            this.title = items.size > 0 ? `${items.size} favorite items pinned` : "No favorite items pinned";
            this.changeDetector.markForCheck();
        }));

        this._subscriptions.push(this.accountService.currentAccount.subscribe((account) => {
            this._accountEndpoint = account.url;
        }));
    }

    public ngOnInit() {
        this._subscriptions.push(this.router.events
            .pipe(filter(event => event instanceof NavigationEnd))
            .subscribe((event: NavigationEnd) => {
                // Application URL scheme maps the Batch API URL for the entity
                this.currentUrl = `https://${this._accountEndpoint}${event.url}`;
                this.changeDetector.markForCheck();
            }));
    }

    public ngOnDestroy() {
        this._subscriptions.forEach(x => x.unsubscribe());
    }

    public gotoFavorite(favorite: PinnableEntity) {
        this.router.navigate(favorite.routerLink);
        this._dropdown.close();
    }

    public removeFavorite(favorite: PinnableEntity) {
        this.pinnedEntityService.unPinFavorite(favorite).subscribe();
    }

    public handleMiddleMouseUp(event: MouseEvent, favorite: PinnableEntity) {
        if (event.button === MouseButton.middle) {
            this.pinnedEntityService.unPinFavorite(favorite);
        }
    }

    public entityType(favorite: PinnableEntity) {
        switch (favorite.pinnableType) {
            case PinnedEntityType.Application:
                return "Batch application";
            case PinnedEntityType.Job:
                return "Batch job";
            case PinnedEntityType.JobSchedule:
                return "Batch job schedule";
            case PinnedEntityType.Pool:
                return "Batch pool";
            case PinnedEntityType.Certificate:
                return "Batch certificate";
            case PinnedEntityType.StorageContainer:
                return "Storage container";
            default:
                return "unknown";
        }
    }

    public entityIcon(favorite: PinnableEntity) {
        switch (favorite.pinnableType) {
            case PinnedEntityType.Application:
                return "fa-file-archive-o";
            case PinnedEntityType.Job:
                return "fa-tasks";
            case PinnedEntityType.JobSchedule:
                return "fa-calendar";
            case PinnedEntityType.Pool:
                return "fa-database";
            case PinnedEntityType.Certificate:
                return "fa-certificate";
            case PinnedEntityType.StorageContainer:
                return "fa-cloud-upload";
            default:
                return "fa-question";
        }
    }

    public trackPinnned(_, entity: PinnableEntity) {
        return `${entity.pinnableType}/${entity.id}`;
    }

    public onContextMenu(favorite: PinnableEntity) {
        this.contextMenuService.openMenu(new ContextMenu([
            new ContextMenuItem("Remove favorite", () => this.pinnedEntityService.unPinFavorite(favorite).subscribe()),
        ]));
    }
}
