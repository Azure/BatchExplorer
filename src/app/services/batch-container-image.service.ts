import { Injectable } from "@angular/core";
import { log } from "@batch-flask/utils";
import { List } from "immutable";
import loadJsonFile from "load-json-file";
import { Observable, from } from "rxjs";
import { flatMap, share } from "rxjs/operators";
import { GithubDataService } from "./github-data";

@Injectable()
export class BatchContainerImageService {

    public images: Observable<List<string>>;

    constructor(
        private githubDataService: GithubDataService) {

        this.images = this.loadFromDataService("batch-container-images.json");
    }

    public getImages() {
        return this.images;
    }

    public loadFromDataService(uri: string): Observable<any> {
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
}
