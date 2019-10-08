import { Injectable } from "@angular/core";
import { log } from "@batch-flask/utils";
import { ImageInformation, ImageInformationAttributes, PoolOsSkus } from "app/models";
import { BatchAccountService } from "app/services/batch-account";
import { List } from "immutable";
import { Observable, empty, of } from "rxjs";
import {
    catchError, distinctUntilChanged, expand, map, publishReplay, reduce, refCount, share, switchMap,
} from "rxjs/operators";
import { AzureBatchHttpService, BatchListResponse } from "../core";

@Injectable({ providedIn: "root" })
export class PoolOsService {
    public offers: Observable<PoolOsSkus>;
    public supportedImages: Observable<List<ImageInformation>>;

    constructor(private http: AzureBatchHttpService, private accountService: BatchAccountService) {
        this.supportedImages = this.accountService.currentAccountId.pipe(
            distinctUntilChanged(),
            switchMap(() => {
                return this._loadImageInformation().pipe(
                    catchError((error) => {
                        log.error("Failed to load node agent skus", error);
                        return of(List<ImageInformation>([]));
                    }),
                );
            }),
            publishReplay(1),
            refCount(),
        );

        this.offers = this.supportedImages.pipe(
            map(x => new PoolOsSkus(x)),
            publishReplay(1),
            refCount(),
        );
    }

    private _loadImageInformation(): Observable<List<ImageInformation>> {
        return this.http.get<BatchListResponse<ImageInformationAttributes>>("/supportedimages").pipe(
            expand(response => {
                return response["odata.nextLink"] ? this.http.get(response["odata.nextLink"]) : empty();
            }),
            reduce((resourceGroups, response: BatchListResponse<ImageInformationAttributes>) => {
                return [...resourceGroups, ...response.value];
            }, []),
            map(x => List(x.map(v => new ImageInformation(v)))),
            share(),
        );
    }
}
