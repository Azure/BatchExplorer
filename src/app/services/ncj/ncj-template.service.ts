import { Injectable } from "@angular/core";
import { FileSystemService } from "@batch-flask/ui";
import { SecureUtils, log } from "@batch-flask/utils";
import {
    Application,
    ApplicationAction,
    NcjJobTemplate,
    NcjPoolTemplate,
    NcjTemplateMode,
} from "app/models";
import { LocalFileStorage } from "app/services/local-file-storage.service";
import { List } from "immutable";
import loadJsonFile from "load-json-file";
import { BehaviorSubject, Observable, forkJoin, from, of } from "rxjs";
import { map, share,  switchMap, take } from "rxjs/operators";
import { Portfolio, PortfolioService } from "./portfolio";

const recentSubmitKey = "ncj-recent-submit";
const maxRecentSubmissions = 10;

export interface RecentSubmissionParams {
    name: string;
    jobTemplate?: NcjJobTemplate;
    poolTemplate?: NcjPoolTemplate;
    mode: NcjTemplateMode;
    jobParams?: StringMap<any>;
    poolParams?: StringMap<any>;
    pickedPool?: string;
}

export interface RecentSubmission extends RecentSubmissionParams {
    id: string;
}

@Injectable()
export class NcjTemplateService {
    public recentSubmission: Observable<RecentSubmission[]>;

    private _recentSubmission = new BehaviorSubject<RecentSubmission[]>([]);

    constructor(
        private portfolioService: PortfolioService,
        private fs: FileSystemService,
        private localFileStorage: LocalFileStorage) {
        this.recentSubmission = this._recentSubmission.asObservable();
    }

    public init() {
        this._loadRecentSubmission();
    }

    public refresh(): Observable<any> {
        // TODO-TIM
        return null;
    }

    /**
     * Get a file from the batch data repo relative to the ncj folder.
     * @param path: path to the file
     */
    public get(portfolioId: string, uri: string): Observable<[Portfolio, any]> {
        return this.portfolioService.getReady(portfolioId).pipe(
            switchMap((portfolio: Portfolio) => {
                const promise = loadJsonFile<any>(portfolio.getPath(uri)).then((json: any) => {
                    return [portfolio, json];
                }).catch((error) => {
                    log.error(`File is not valid json: ${error.message}`);
                });

                return from(promise as any);
            }),
            share(),
        );
    }

    public listApplications(portfolioId: string): Observable<List<Application>> {
        return this.get(portfolioId, "index.json").pipe(
            map(([portfolio, apps]) => {
                return List<Application>(apps.map(data => {
                    return new Application({
                        ...data,
                        portfolioId,
                        icon: this.getApplicationIcon(portfolio, data.id),
                        readme: this.getApplicationReadme(data.id),
                    });
                }));
            }),
            share(),
        );
    }

    public listAllApplications(): Observable<List<Application>> {
        return this.portfolioService.portfolios.pipe(
            take(1),
            switchMap((portfolios) => {
                return forkJoin(portfolios.map(x => this.listApplications(x.id)));
            }),
            map((apps: Array<List<Application>>) => {
                let all = [];

                for (const list of apps) {
                    all = all.concat(list.toArray());
                }
                return List<Application>(all);
            }),
            share(),
        );
    }

    public getApplication(portfolioId: string, applicationId: string): Observable<Application> {
        return this.get(portfolioId, "index.json").pipe(
            map(([portfolio, apps]) => {
                const data = apps.filter(app => app.id === applicationId).first();
                return data && new Application({
                    ...data,
                    icon: this.getApplicationIcon(portfolio, data.id),
                    readme: this.getApplicationReadme(data.id),
                });
            }),
            share(),
        );
    }

    /**
     * Return the application icon path
     * @param applicationId Id of the application
     */
    public getApplicationIcon(portfolio: Portfolio, applicationId: string): string {
        return "file:" + portfolio.getPath(`${applicationId}/icon.svg`);
    }

    /**
     * Return the application icon path
     * @param applicationId Id of the application
     */
    public getApplicationReadme(applicationId: string): string {
        return `ncj/${applicationId}/readme.md`;
    }

    public listActions(portfolioId: string, applicationId: string): Observable<List<ApplicationAction>> {
        console.log("List actions", portfolioId, applicationId);
        return this.get(portfolioId, `${applicationId}/index.json`).pipe(
            map(([_, actions]) => {
                console.log("Actions", actions);
                return List<ApplicationAction>(actions.map(x => new ApplicationAction(x)));
            }),
            share(),
        );
    }

    public getJobTemplate(portfolioId: string, applicationId: string, actionId: string): Observable<NcjJobTemplate> {
        return this.get(portfolioId, `${applicationId}/${actionId}/job.template.json`).pipe(map(x => x[1]));
    }

    public getPoolTemplate(portfolioId: string, applicationId: string, actionId: string): Observable<NcjPoolTemplate> {
        return this.get(portfolioId, `${applicationId}/${actionId}/pool.template.json`).pipe(map(x => x[1]));
    }

    public addRecentSubmission(submission: RecentSubmissionParams) {
        const data: RecentSubmission = {
            ...submission,
            id: SecureUtils.uuid(),
        };
        const newSubmissions = [data].concat(this._recentSubmission.value);
        this._recentSubmission.next(newSubmissions.slice(0, maxRecentSubmissions));
        this._saveRecentSubmission();
    }

    public getRecentSubmission(id: string): Observable<RecentSubmission> {
        return of(this._recentSubmission.value.filter(x => x.id === id).first());
    }

    public createParameterFileFromSubmission(path: string, submission: RecentSubmission) {
        const content = JSON.stringify(this._parameterData(submission), null, 2);
        return this.fs.saveFile(path, content);
    }

    public _parameterData(submission: RecentSubmission) {
        switch (submission.mode) {
            case NcjTemplateMode.NewPool:
                return submission.poolParams;
            case NcjTemplateMode.ExistingPoolAndJob:
                return Object.assign({}, submission.jobParams, submission.pickedPool);
            case NcjTemplateMode.NewPoolAndJob:
                return Object.assign({}, submission.jobParams, submission.poolParams);
        }
    }

    private _saveRecentSubmission() {
        return this.localFileStorage.set(recentSubmitKey, this._recentSubmission.value);
    }

    private _loadRecentSubmission() {
        this.localFileStorage.get(recentSubmitKey).subscribe((data: RecentSubmission[]) => {
            if (!Array.isArray(data)) {
                data = [];
            }
            this._recentSubmission.next(data);
        });
    }
}
