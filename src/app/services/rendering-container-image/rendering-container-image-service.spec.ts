import {
    RenderApplication, RenderEngine,
} from "app/models/rendering-container-image";
import { GithubDataServiceMock } from "test/utils/mocks";
import { RenderingContainerImageService } from "./rendering-container-image.service";

describe("RenderingContainerImageService", () => {
    let renderingContainerImageService: RenderingContainerImageService;
    let githubDataServiceSpy;

    beforeEach(() => {
        githubDataServiceSpy = new GithubDataServiceMock();

        renderingContainerImageService = new RenderingContainerImageService(githubDataServiceSpy);
    });

    // findContainerImageById
    it("#findContainerImageById finds and returns expected containerImage", (done) => {
        renderingContainerImageService.findContainerImageById("ubuntu_maya2017u5_arnold2011").subscribe((result) => {
            expect(result.appVersion).toEqual("2017-Update5");
            expect(result.imageReferenceId).toEqual("ubuntu-1604lts-container");
            expect(result.rendererVersion).toEqual("2.0.1.1");
            expect(result.renderer).toEqual("arnold");
            expect(result.app).toEqual("maya");
            done();
        });
    });

    // getAppVersionDisplayList
    it("#getAppVersionDisplayList filters to select single value correctly", (done) => {
        renderingContainerImageService.getAppVersionDisplayList(
            RenderApplication.Maya, RenderEngine.VRay, "ubuntu-1604lts-container").subscribe((result) => {
            expect(result.length).toEqual(1);
            expect(result.pop()).toEqual("2017-Update5");
            done();
        });
    });

    it("#getAppVersionDisplayList returns only one of a duplicate result", (done) => {
        renderingContainerImageService.getAppVersionDisplayList(
            RenderApplication._3dsMax, RenderEngine.VRay, "ubuntu-1604lts-container").subscribe((result) => {
            expect(result.length).toEqual(1);
            expect(result.pop()).toEqual("2018-Update1");
            done();
        });
    });

    // getContainerImagesForAppVersion
    it("#getContainerImagesForAppVersion filters to select correct containerImage", (done) => {
        renderingContainerImageService.getContainerImagesForAppVersion(
            RenderApplication.Maya, RenderEngine.VRay, "ubuntu-1604lts-container", "2017-Update5")
            .subscribe((result) => {
            expect(result.length).toEqual(1);
            expect(result.pop().containerImage).toEqual("ubuntu_maya_vray");
            done();
        });
    });

    it("#getContainerImagesForAppVersion filters to select correct multiple containerImage", (done) => {
        renderingContainerImageService.getContainerImagesForAppVersion(
            RenderApplication._3dsMax, RenderEngine.VRay, "ubuntu-1604lts-container", "2018-Update1")
            .subscribe((result) => {
            expect(result.length).toEqual(2);
            expect(result.find(x => x.containerImage === "ubuntu_3dsmax_vray25001")).toBeDefined();
            expect(result.find(x => x.containerImage === "ubuntu_3dsmax_vray36004")).toBeDefined();
            done();
        });
    });
});
