import { Component, Injector, Input, OnChanges, OnDestroy, forwardRef } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Filter, ListView, autobind } from "@batch-flask/core";
import { ListBaseComponent } from "@batch-flask/ui";
import { LoadingStatus } from "@batch-flask/ui/loading";
import { Node } from "app/models";
import { NodeListParams, NodeService } from "app/services";
import { ComponentUtils } from "app/utils";
import { Observable, of } from "rxjs";
import { map } from "rxjs/operators";
import { NodeCommands } from "../action";

@Component({
    selector: "bl-node-list",
    templateUrl: "node-list.html",
    providers: [NodeCommands, {
        provide: ListBaseComponent,
        useExisting: forwardRef(() => NodeListComponent),
    }],
})
export class NodeListComponent extends ListBaseComponent implements OnChanges, OnDestroy {
    public LoadingStatus = LoadingStatus;

    @Input() public poolId: string;

    public data: ListView<Node, NodeListParams>;

    constructor(
        public commands: NodeCommands,
        private nodeService: NodeService,
        injector: Injector,
        activatedRoute: ActivatedRoute) {
        super(injector);
        this.data = this.nodeService.listView();

        this.data.status.subscribe((status) => {
            this.status = status;
        });
        ComponentUtils.setActiveItem(activatedRoute, this.data);
    }

    public ngOnChanges(changes) {
        if (changes.poolId) {
            this.commands.params = { poolId: this.poolId };
            this.data.params = { poolId: this.poolId };
            this.data.refresh();
        }
    }

    public ngOnDestroy() {
        this.data.dispose();
    }

    @autobind()
    public refresh(): Observable<any> {
        this.data.params = { poolId: this.poolId };
        return this.data.refresh();
    }

    public handleFilter(filter: Filter) {
        if (filter.isEmpty()) {
            this.data.setOptions({});
        } else {
            this.data.setOptions({ filter });
        }
        if (this.poolId) {
            return this.data.fetchNext().pipe(map(x => x.items.size));
        } else {
            return of(0);
        }
    }

    public onScrollToBottom(): Observable<any> {
        return this.data.fetchNext();
    }
}
