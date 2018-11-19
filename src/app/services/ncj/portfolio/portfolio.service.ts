import { Injectable } from "@angular/core";
import { isNotNullOrUndefined } from "@batch-flask/core";
import { FileSystemService } from "@batch-flask/ui";
import { Constants } from "common";
import { BehaviorSubject, Observable, of } from "rxjs";
import { filter, map, share, switchMap, take, tap } from "rxjs/operators";
import { GithubPortfolio, Portfolio, PortfolioReference, PortfolioType } from ".";
import { LocalFileStorage } from "../../local-file-storage.service";

export const MICROSOFT_PORTFOLIO = {
    id: "microsoft-offical",
    type: PortfolioType.Github,
    source: "https://github.com/Azure/BatchExplorer-data",
};

interface PortfolioData {
    portfolios: PortfolioReference[];
}

@Injectable()
export class PortfolioService {
    public portfolios: Observable<Portfolio[]>;
    private _portfolios = new BehaviorSubject<Map<string, Portfolio> | null>(null);
    private _microsoftPortfolio = new GithubPortfolio(MICROSOFT_PORTFOLIO, this.fs);

    constructor(private localFileStorage: LocalFileStorage, private fs: FileSystemService) {
        this.portfolios = this._portfolios.pipe(
            filter(isNotNullOrUndefined),
            map(x => [...x.values()]),
        );
        this._loadPortfolios().subscribe();
    }

    public get(id: string): Observable<Portfolio | undefined> {
        return this._portfolios.pipe(
            take(1),
            map(x => x.get(id)),
        );
    }

    public getReady(id: string): Observable<Portfolio | undefined> {
        return this._portfolios.pipe(
            take(1),
            map(x => x.get(id)),
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
        map.set(MICROSOFT_PORTFOLIO.id, this._microsoftPortfolio);
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
