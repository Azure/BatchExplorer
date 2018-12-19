import { Injectable } from "@angular/core";
import { log } from "@batch-flask/utils";
import {
    RenderApplication, RenderEngine,
    RenderingContainerImage, RenderingImageReference,
} from "app/models/rendering-container-image";
import { Observable } from "rxjs";
import { map, publishReplay, refCount, share } from "rxjs/operators";
import { GithubDataService } from "./github-data";

const dataFile = "data/rendering-container-images.json";

@Injectable()
export class RenderingContainerImageService {

    public imageReferences: Observable<RenderingImageReference[]>;
    public containerImages: Observable<RenderingContainerImage[]>;

    constructor(
        private githubDataService: GithubDataService) {

        const data = this.githubDataService.get(dataFile).pipe(
            map((content) => {
                try {
                    return JSON.parse(content);
                } catch (error) {
                    log.error(`File is not valid json: ${error.message}`);
                    return { imageReferences: [], containerImages: [] };
                }
            }),
            publishReplay(1),
            refCount());

        this.imageReferences = data.pipe(map(x => x.imageReferences));
        this.containerImages = data.pipe(map(x => x.containerImages));
    }

    public findContainerImageById(containerImageId: string): Observable<RenderingContainerImage> {
        return this.containerImages.pipe(
            map(images => images.find(image => image.containerImage === containerImageId)), share());
    }

    public getContainerImagesForAppVersion(
        app: RenderApplication, renderer: RenderEngine, imageReferenceId?: string, selectedAppVersion?: string):
        Observable<RenderingContainerImage[]> {
        return this.containerImages.pipe(
            map(images => {
                images = images.filter(image => image.app === app && image.renderer === renderer);

                if (imageReferenceId) {
                    images = images.filter(image => image.imageReferenceId === imageReferenceId);
                }
                if (selectedAppVersion) {
                    images = images.filter(image => image.appVersion === selectedAppVersion);
                }
                return images;
            }),
            share(),
        );
    }

    public getAppVersionDisplayList(
        app: RenderApplication,  renderer: RenderEngine, imageReferenceId: string):
        Observable<string[]> {

        return this.containerImages.pipe(
            map(images => {
                images = images.filter(x =>
                    x.app === app &&
                    x.renderer === renderer &&
                    x.imageReferenceId === imageReferenceId);

                return Array.from(new Set(images.map(image => image.appVersion)));
            }),
            share(),
        );
    }
}
