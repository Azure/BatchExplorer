import { Injectable } from "@angular/core";
import { FileSystemService } from "@batch-flask/ui";
import { log } from "@batch-flask/utils";
import { RenderApplication, RenderEngine,
    RenderingContainerImage, RenderingImageReference } from "app/models/rendering-container-image";
import { BehaviorSubject, Observable, from } from "rxjs";
import { map, share } from "rxjs/operators";
import { GithubDataService } from "./github-data";

const dataFile = "rendering-container-images.json";

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
        private githubDataService: GithubDataService,
        private fs: FileSystemService) {

        this.imageReferences = this._imageReferences.asObservable();
        this.containerImages = this._containerImages.asObservable();

        // TODO hook into githubDataService.ready to call loadImageData once _batch and _repo variables are set
        // (and move loadImageData call out of component)
    }

    public loadImageData(): Observable<any>  {
        return from(this.fs.readFile(this.githubDataService.getLocalDataPath(dataFile)).then((content) => {
        try {
            const data: RenderingImagesData = JSON.parse(content);
            this._imageReferences.next(data.image_references);
            this._containerImages.next(data.container_images);

            // tslint:disable-next-line:no-console
            console.log("Read imageReferences of length:" + data.image_references.length);
            // tslint:disable-next-line:no-console
            console.log("Read containerImages of length:" + data.container_images.length);
        } catch (error) {
            log.error(`File is not valid json: ${error.message}`);
        }}));
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

                    // tslint:disable-next-line:no-console
                    console.log("selected containerImages:" + images.length);
                    return images;
                    }),
            share(),
        );
    }

    public getAppVersionDisplayList(app: RenderApplication, imageReferenceId: string): Observable<string[]> {
        return this.containerImages.pipe(
            map(images => {
                // tslint:disable-next-line:no-console
                console.log("Getting appVersionDisplayList for app, imageRef:" + app + " " + imageReferenceId);
                images = images.filter(x =>
                    x.imageReferenceId === imageReferenceId &&
                    x.app === app);

                // tslint:disable-next-line:no-console
                console.log("Returning appVersionDisplayList of length:" + images.length);
                return Array.from(new Set(images.map(image => image.appVersion)));
            }),
            share(),
        );
    }
}
