import { Component, Input } from "@angular/core";
import { autobind } from "core-decorators";
import { Observable } from "rxjs";

import { LoadingStatus } from "app/components/base/loading";

@Component({
    selector: "bl-list-loading",
    templateUrl: "list-loading.html",
})
export class ListLoadingComponent {
    public loadingStatuses = LoadingStatus;

    @Input()
    public manualLoading: boolean = false;

    @Input()
    public data: any;

    @Input()
    public status: LoadingStatus;

    public loadingMore = false;

    @autobind()
    public loadMore(): Observable<any> {
        this.loadingMore = true;
        const obs = this.data.fetchNext();
        obs.subscribe(() => {
            this.loadingMore = false;
        });

        return obs;
    }
}
