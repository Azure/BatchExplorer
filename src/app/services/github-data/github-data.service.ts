import { HttpClient } from "@angular/common/http";
import { Injectable, OnDestroy } from "@angular/core";
import { UserConfigurationService } from "@batch-flask/core";
import { LoadingStatus } from "@batch-flask/ui";
import { BEUserDesktopConfiguration, Constants } from "common";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { flatMap, map, publishReplay, refCount, share, takeUntil } from "rxjs/operators";

@Injectable({ providedIn: "root" })
export class GithubDataService implements OnDestroy {
    public _baseUrl: Observable<string>;
    private _destroy = new Subject();
    private _loadingStatus = new BehaviorSubject<LoadingStatus>(LoadingStatus.Loading);

    constructor(
        private http: HttpClient,
        private settingsService: UserConfigurationService<BEUserDesktopConfiguration>) {

        this._baseUrl = this.settingsService.watch("githubData").pipe(
            takeUntil(this._destroy),
            map((settings) => {
                const branch = settings.branch;
                const repo = settings.repo;
                return {
                    branch: branch || "master",
                    repo: repo || "Azure/BatchExplorer-data",
                };
            }),
            map(({repo, branch}) => {
                return this._getRepoUrl(repo, branch);
            }),
            publishReplay(1),
            refCount(),
        );
    }

    public ngOnDestroy() {
        this._destroy.next();
        this._destroy.complete();
        this._loadingStatus.complete();
    }

    /**
     * Get the content of the file in github
     * @param path path relative to the root of the repo
     */
    public get(path: string): Observable<string> {
        return this._baseUrl.pipe(
            flatMap((baseUrl) => this.http.get(this.getUrl(baseUrl, path), { observe: "body", responseType: "text" })),
            share(),
        );
    }

    /**
     * Get the remote url for the file
     * @param path path relative to the root of the repo
     */
    public getUrl(baseUrl: string, path: string): string {
        return `${baseUrl}/${path}`;
    }

    private _getRepoUrl(repo: string, branch: string) {
        return `${Constants.ServiceUrl.githubRaw}/${repo}/${branch}`;
    }
}
