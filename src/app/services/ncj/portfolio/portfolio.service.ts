import { Injectable, OnDestroy } from "@angular/core";
import { isNotNullOrUndefined } from "@batch-flask/core";
import { FileSystemService } from "@batch-flask/electron";
import { SettingsService } from "app/services/settings.service";
import { Constants } from "common";
import { BehaviorSubject, Observable, combineLatest, of } from "rxjs";
import {
    distinctUntilChanged, filter, map, publishReplay, refCount, share, switchMap, take, tap,
} from "rxjs/operators";
import { GithubPortfolio, Portfolio, PortfolioReference, PortfolioType } from ".";
import { LocalFileStorage } from "../../local-file-storage.service";

export const MICROSOFT_PORTFOLIO = {
    id: "microsoft-offical",
    type: PortfolioType.Github,
};

interface PortfolioData {
    portfolios: PortfolioReference[];
}

@Injectable({providedIn: "root"})
export class PortfolioService implements OnDestroy {
    public portfolios: Observable<Portfolio[]>;
    private _portfolios = new BehaviorSubject<Map<string, Portfolio> | null>(null);
    private _microsoftPortfolio: Observable<Portfolio>;

    constructor(
        private localFileStorage: LocalFileStorage,
        private fs: FileSystemService,
        settingsService: SettingsService) {

        this._microsoftPortfolio = settingsService.settingsObs.pipe(
            map((settings) => {
                const branch = settings["github-data.source.branch"] || "master";
                const repo = settings["github-data.source.repo"] || "Azure/BatchExplorer-data";
                return `https://github.com/${repo}/tree/${branch}`;
            }),
            distinctUntilChanged(),
            map((source) => new GithubPortfolio({ ...MICROSOFT_PORTFOLIO, source }, this.fs)),
            publishReplay(1),
            refCount(),
        );

        const portfolios = this._portfolios.pipe(filter(isNotNullOrUndefined));

        this.portfolios = combineLatest(this._microsoftPortfolio, portfolios).pipe(
            map(([microsoft, others]) => {
                return [microsoft, ...others.values()];
            }),
        );

        this._loadPortfolios().subscribe();
    }

    public ngOnDestroy() {
        this._portfolios.complete();
    }

    public get(id: string): Observable<Portfolio | undefined> {
        if (id === MICROSOFT_PORTFOLIO.id) {
            return this._microsoftPortfolio.pipe(take(1));
        }
        return this._portfolios.pipe(
            take(1),
            map(x => x.get(id)),
        );
    }

    public getReady(id: string): Observable<Portfolio | undefined> {
        return this.get(id).pipe(
            switchMap((x) => {
                if (x) {
                    return x.ready;
                } else {
                    return of(undefined);
                }
            }),
        );
    }

    public setPortfolios(portfolios: PortfolioReference[], save = true) {
        const map = new Map();
        for (const portfolio of portfolios) {
            map.set(portfolio.id, new GithubPortfolio(portfolio, this.fs));
        }
        this._portfolios.next(map);
        if (save) {
            this._savePortfolios();
        }
    }

    private _savePortfolios(): Observable<any> {
        return this.localFileStorage.set<PortfolioData>(Constants.SavedDataFilename.portfolios, {
            portfolios: [...this._portfolios.value.values()]
                .filter(x => x.id !== MICROSOFT_PORTFOLIO.id)
                .map(x => x.reference),
        });
    }

    private _loadPortfolios(): Observable<any> {
        return this.localFileStorage.get<PortfolioData>(Constants.SavedDataFilename.portfolios).pipe(
            tap((data) => {
                if (data && data.portfolios) {
                    this.setPortfolios(data.portfolios, false);
                } else {
                    this.setPortfolios([], false);
                }
            }),
            share(),
        );
    }
}
