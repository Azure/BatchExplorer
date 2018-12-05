import { Injectable } from "@angular/core";
import { FileSystemService } from "@batch-flask/ui";
import { log } from "@batch-flask/utils";
import { RenderEngine, RenderingContainerImage, RenderingImageReference } from "app/models/rendering-container-image";
import { BehaviorSubject, Observable } from "rxjs";
import { GithubDataService } from "./github-data";

const dataFile = "rendering-container-images.json";

interface RenderingImagesData {
    imageReferences: RenderingImageReference[];
    containerImages: RenderingContainerImage[];
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

    public async loadImageData() {
        await this.fs.readFile(this.githubDataService.getLocalDataPath(dataFile)).then((content) => {
        try {
            const data: RenderingImagesData = JSON.parse(content);
            this._imageReferences.next(data.imageReferences);
            this._containerImages.next(data.containerImages);
        } catch (error) {
            log.error(`File is not valid json: ${error.message}`);
        }});
    }

    public getSelectedContainerImage(
        renderer: RenderEngine, selectedBaseImage: string, selectedAppVersion: string, selectedRendererVersion: string)
        : string  {
        let images = this._containerImages.value;
        images = images.filter(x => x.imageReferenceId === selectedBaseImage && x.mayaVersion === selectedAppVersion);

        switch (renderer) {
            case RenderEngine.MayaSW: {
                // already filtered above
                break;
            }
            case RenderEngine.Arnold: {
                images = images.filter(x => x.arnoldVersion === selectedRendererVersion);
            }
            case RenderEngine.VRay: {
                images = images.filter(x => x.vrayVersion === selectedRendererVersion);
            }
        }

        return images.first().containerImage;
    }

    public getMayaDisplayList(selectedBaseImage?: string): Set<string> {
        let images = this._containerImages.value;
        if (selectedBaseImage) {
            images = images.filter(x => x.imageReferenceId === selectedBaseImage);
        }
        return new Set<string>(images.map(image => image.mayaVersion));
    }

    public getRendererDisplayList(
        renderer: RenderEngine, selectedBaseImage?: string, selectedMaya?: string): Set<string> {
        let images = this._containerImages.value;
        if (selectedBaseImage) {
            images = images.filter(x => x.imageReferenceId === selectedBaseImage);
        }
        if (selectedMaya) {
            images = images.filter(x => x.mayaVersion === selectedMaya);
        }

        switch (renderer) {
            case RenderEngine.MayaSW: {
                return new Set<string>(images.map(image => image.mayaVersion));
            }
            case RenderEngine.Arnold: {
                return new Set<string>(images.map(image => image.arnoldVersion));
            }
            case RenderEngine.VRay: {
                return new Set<string>(images.map(image => image.vrayVersion));
            }
        }
    }
}
