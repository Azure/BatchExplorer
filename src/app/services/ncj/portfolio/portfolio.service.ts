import { Injectable, OnDestroy } from "@angular/core";
import { GlobalStorage, UserConfigurationService } from "@batch-flask/core";
import { FileSystemService } from "@batch-flask/electron";
import { BEUserDesktopConfiguration } from "common";
import { Observable, combineLatest, of } from "rxjs";
import {
    distinctUntilChanged, map, publishReplay, refCount, switchMap, take,
} from "rxjs/operators";
import { GithubPortfolio } from "./github-portfolio";
import { Portfolio, PortfolioReference, PortfolioType } from "./portfolio";

export const MICROSOFT_PORTFOLIO = {
    id: "microsoft-offical",
    type: PortfolioType.Github,
};

interface PortfolioData {
    portfolios: PortfolioReference[];
}

@Injectable({ providedIn: "root" })
export class PortfolioService implements OnDestroy {
    public static readonly KEY = "portfolios";

    public portfolios: Observable<Portfolio[]>;
    private _portfolios: Observable<Map<string, Portfolio>>;
    private _microsoftPortfolio: Observable<Portfolio>;

    constructor(
        private storage: GlobalStorage,
        private fs: FileSystemService,
        settingsService: UserConfigurationService<BEUserDesktopConfiguration>) {

        this._microsoftPortfolio = settingsService.watch("microsoftPortfolio").pipe(
            distinctUntilChanged((a, b) => {
                return a === b || (a.repo === b.repo && a.branch === b.branch && a.path === b.path);
            }),
            map((settings) => {
                const branch = settings.branch;
                const repo = settings.repo;
                const source = `https://github.com/${repo}/tree/${branch}`;
                return new GithubPortfolio({ ...MICROSOFT_PORTFOLIO, source, path: settings.path }, this.fs);
            }),
            publishReplay(1),
            refCount(),
        );

        this._portfolios = this.storage.watch<PortfolioData>(PortfolioService.KEY).pipe(
            map((data) => {
                if (data && Array.isArray(data.portfolios)) {
                    return data.portfolios;
                } else {
                    return [];
                }
            }),
            map(x => this._processPortfolios(x)),
        );

        this.portfolios = combineLatest(this._microsoftPortfolio, this._portfolios).pipe(
            map(([microsoft, others]) => {
                return [microsoft, ...others.values()];
            }),
        );

    }

    public ngOnDestroy() {
        // Nothing
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

    public setPortfolios(portfolios: PortfolioReference[]) {
        return this.storage.set<PortfolioData>(PortfolioService.KEY, {
            portfolios,
        });
    }

    private _processPortfolios(portfolios: PortfolioReference[]) {
        const map = new Map();
        for (const portfolio of portfolios) {
            map.set(portfolio.id, new GithubPortfolio(portfolio as any, this.fs));
        }
        return map;
    }
}
