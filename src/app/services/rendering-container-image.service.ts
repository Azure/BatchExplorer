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
                    return { image_references: [], container_images: [] };
                }
            }),
            publishReplay(1),
            refCount());

        this.imageReferences = data.pipe(map(x => x.image_references));
        this.containerImages = data.pipe(map(x => x.container_images));
    }

    public findContainerImageById(containerImageId: string): Observable<RenderingContainerImage> {
        return this.containerImages.pipe(
            map(images => images.find(image => image.containerImage === containerImageId)), share());
    }

    public getContainerImagesForAppVersion(
        app: RenderApplication, renderer: RenderEngine, selectedBaseImage?: string, selectedAppVersion?: string):
        Observable<RenderingContainerImage[]> {
        return this.containerImages.pipe(
            map(images => {
                images = images.filter(image => image.app === app && image.renderer === renderer);

                if (selectedBaseImage) {
                    images = images.filter(image => image.imageReferenceId === selectedBaseImage);
                }
                if (selectedAppVersion) {
                    images = images.filter(image => image.appVersion === selectedAppVersion);
                }
                return images;
            }),
            share(),
        );
    }

    public getAppVersionDisplayList(app: RenderApplication, imageReferenceId: string): Observable<string[]> {

        // TODO should pass renderEngine in here and only return appVersions
        // which have at least one rendererVersion available
        return this.containerImages.pipe(
            map(images => {
                images = images.filter(x =>
                    x.imageReferenceId === imageReferenceId &&
                    x.app === app);

                return Array.from(new Set(images.map(image => image.appVersion)));
            }),
            share(),
        );
    }
}
