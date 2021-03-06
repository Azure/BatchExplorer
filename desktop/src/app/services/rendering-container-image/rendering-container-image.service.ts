import { Injectable } from "@angular/core";
import { log } from "@batch-flask/utils";
import {
    RenderApplication, RenderEngine,
    RenderingContainerImage, RenderingImageReference,
} from "app/models/rendering-container-image";
import { Observable } from "rxjs";
import { map, publishReplay, refCount, share } from "rxjs/operators";
import { GithubDataService } from "../github-data";

const dataFile = "data/rendering-container-images.json";

@Injectable({ providedIn: "root" })
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

    public findContainerImageById(containerImageId: string):
        Observable<RenderingContainerImage> {
        return this.containerImages.pipe(
            map(images => images.find(image => image.containerImage === containerImageId)), share());
    }

    public containerImagesAsMap(): Observable<Map<any, any>> {
        return this.containerImages.pipe(
            map((images) => {
                const imageMap = new Map();
                for (const image of images) {
                    imageMap.set(image.containerImage, image);
                }
                return imageMap;
        }),
        publishReplay(1),
        refCount());
    }

    public getFilteredContainerImages(app: RenderApplication, renderer: RenderEngine, imageReferenceId: string):
    Observable<RenderingContainerImage[]> {
        return this.containerImages.pipe(
            map(images => {
                images = images.filter(x =>
                    x.app === app &&
                    x.renderer === renderer &&
                    x.imageReferenceId === imageReferenceId);
                return images;
                }),
                share(),
            );
        }
}
