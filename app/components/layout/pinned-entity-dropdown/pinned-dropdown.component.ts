import { Component, OnDestroy, OnInit } from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import { List } from "immutable";
import { Observable, Subscription } from "rxjs";

import { PinnableEntity, PinnedEntityType } from "@batch-flask/core";
import { AccountService, PinnedEntityService } from "app/services";

import "./pinned-dropdown.scss";

@Component({
    selector: "bl-pinned-dropdown",
    templateUrl: "pinned-dropdown.html",
})
export class PinnedDropDownComponent implements OnInit, OnDestroy {
    public currentUrl: string;
    public favorites: Observable<List<PinnableEntity>>;
    public title: string = "";

    private _subscriptions: Subscription[] = [];
    private _accountEndpoint: string = "";

    constructor(
        private router: Router,
        public pinnedEntityService: PinnedEntityService,
        private accountService: AccountService) {

        this.favorites = this.pinnedEntityService.favorites;
        this._subscriptions.push(this.favorites.subscribe((items) => {
            this.title = items.size > 0 ? `${items.size} favorite items pinned` : "No favorite items pinned";
        }));

        this._subscriptions.push(this.accountService.currentAccount.subscribe((account) => {
            this._accountEndpoint = account.properties.accountEndpoint;
        }));
    }

    public ngOnInit() {
        this._subscriptions.push(this.router.events
            .filter(event => event instanceof NavigationEnd)
            .subscribe((event: NavigationEnd) => {
                // Application URL scheme maps the Batch API URL for the entity
                this.currentUrl = `https://${this._accountEndpoint}${event.url}`;
            }));
    }

    public ngOnDestroy() {
        this._subscriptions.forEach(x => x.unsubscribe());
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

    public trackPinnned(index, entity: PinnableEntity) {
        return `${entity.pinnableType}/${entity.id}`;
    }
}
