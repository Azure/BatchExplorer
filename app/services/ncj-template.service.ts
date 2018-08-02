import { Injectable } from "@angular/core";
import {
    Application,
    ApplicationAction,
    NcjJobTemplate,
    NcjPoolTemplate,
    NcjTemplateMode,
    NcjTemplateType,
} from "app/models";
import { FileSystemService } from "app/services/fs.service";
import { LocalFileStorage } from "app/services/local-file-storage.service";
import { SecureUtils, log } from "app/utils";
import { List } from "immutable";
import * as loadJsonFile from "load-json-file";
import { BehaviorSubject, Observable, from } from "rxjs";
import { flatMap, map, share, shareReplay } from "rxjs/operators";
import { GithubDataService } from "./github-data";

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
        private githubDataService: GithubDataService,
        private fs: FileSystemService,
        private localFileStorage: LocalFileStorage) {
        this.recentSubmission = this._recentSubmission.asObservable();
    }

    public init() {
        this._loadRecentSubmission();
    }

    /**
     * Get a file from the batch data repo relative to the ncj folder.
     * @param path: path to the file
     */
    public get(uri: string): Observable<any> {
        return this.githubDataService.ready.pipe(
            flatMap(() => {
                const promise = loadJsonFile(this.githubDataService.getLocalPath(uri)).then((json) => {
                    return json;
                }).catch((error) => {
                    log.error(`File is not valid json: ${error.message}`);
                });

                return from(promise);
            }),
            share(),
        );
    }

    public listApplications(): Observable<List<Application>> {
        return this.get("index.json").pipe(
            map((apps) => {
                return List<Application>(apps.map(data => {
                    return new Application({
                        ...data,
                        icon: this.getApplicationIcon(data.id),
                        readme: this.getApplicationReadme(data.id),
                    });
                }));
            }),
            share(),
        );
    }

    public getApplication(applicationId: string): Observable<Application> {
        return this.get("index.json").pipe(
            map((apps) => {
                const data = apps.filter(app => app.id === applicationId).first();
                return data && new Application({
                    ...data,
                    icon: this.getApplicationIcon(data.id),
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
    public getApplicationIcon(applicationId: string): string {
        return "file:" + this.githubDataService.getLocalPath(`${applicationId}/icon.svg`);
    }

    /**
     * Return the application icon path
     * @param applicationId Id of the application
     */
    public getApplicationReadme(applicationId: string): string {
        return `ncj/${applicationId}/readme.md`;
    }

    public listActions(applicationId: string): Observable<List<ApplicationAction>> {
        return this.get(`${applicationId}/index.json`).pipe(
            map((apps) => {
                return List<ApplicationAction>(apps.map(x => new ApplicationAction(x)));
            }),
            share(),
        );
    }

    public getJobTemplate(applicationId: string, actionId: string): Observable<NcjJobTemplate> {
        return this.get(`${applicationId}/${actionId}/job.template.json`);
    }

    public getPoolTemplate(applicationId: string, actionId: string): Observable<NcjPoolTemplate> {
        return this.get(`${applicationId}/${actionId}/pool.template.json`);
    }

    public async loadLocalTemplateFile(path: string) {
        const json = await loadJsonFile(path).then((content) => {
            return content;
        }).catch((error) => {
            return Promise.reject(`File is not valid json: ${error.message}`);
        });

        let templateType: NcjTemplateType;
        if (json.job) {
            templateType = NcjTemplateType.job;
        } else if (json.pool) {
            templateType = NcjTemplateType.pool;
        } else {
            templateType = NcjTemplateType.unknown;
        }

        return { type: templateType, template: json };
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
        return this.githubDataService.ready.pipe(
            map(() => {
                return this._recentSubmission.value.filter(x => x.id === id).first();
            }),
            shareReplay(1),
        );
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
