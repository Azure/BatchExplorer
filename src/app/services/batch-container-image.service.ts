import { Injectable } from "@angular/core";
import { log } from "@batch-flask/utils";
import { List } from "immutable";
import loadJsonFile from "load-json-file";
import { Observable, from } from "rxjs";
import { flatMap, share } from "rxjs/operators";
import { GithubDataService } from "./github-data";

const batchContainerImageDataPath = "batch-container-images.json";

@Injectable()
export class BatchContainerImageService {

    public images: Observable<List<string>>;

    constructor(
        private githubDataService: GithubDataService) {
    }

    public init() {
        this.images = this.loadFromDataService();
    }

    public getImages() {
        this.images = this.loadFromDataService();
        return this.images;
    }

    public loadFromDataService(): Observable<any> {
        return this.githubDataService.ready.pipe(
            flatMap(() => {
                const promise = loadJsonFile(this.githubDataService.getLocalDataPath(batchContainerImageDataPath))
                    .then((json) => {
                    return json;
                }).catch((error) => {
                    log.error(`File is not valid json: ${error.message}`);
                });

                return from(promise);
            }),
            share(),
        );
    }
}
