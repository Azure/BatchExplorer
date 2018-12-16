import { Injectable } from "@angular/core";
import { FileSystemService } from "@batch-flask/ui";
import { log } from "@batch-flask/utils";
import { RenderApplication, RenderEngine,
    RenderingContainerImage, RenderingImageReference } from "app/models/rendering-container-image";
import { BehaviorSubject, Observable, from } from "rxjs";
import { map, share } from "rxjs/operators";
import { GithubDataService } from "./github-data";

const dataFile = "data/rendering-container-images.json";

interface RenderingImagesData {
    image_references: RenderingImageReference[];
    container_images: RenderingContainerImage[];
}

@Injectable()
export class RenderingContainerImageService {

    public imageReferences: Observable<RenderingImageReference[]>;
    public containerImages: Observable<RenderingContainerImage[]>;

    private _imageReferences = new BehaviorSubject<RenderingImageReference[]>(null);
    private _containerImages = new BehaviorSubject<RenderingContainerImage[]>(null);

    constructor(
        private githubDataService: GithubDataService) {

        this.imageReferences = this._imageReferences.asObservable();
        this.containerImages = this._containerImages.asObservable();

        // TODO hook into githubDataService.ready to call loadImageData once _batch and _repo variables are set
        // (and move loadImageData call out of component)
    }

    public loadImageData() {
        return this.githubDataService.get(dataFile).subscribe((content) => {
        try {
            const data: RenderingImagesData = JSON.parse(content);
            this._imageReferences.next(data.image_references);
            this._containerImages.next(data.container_images);
        } catch (error) {
            log.error(`File is not valid json: ${error.message}`);
        }});
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
