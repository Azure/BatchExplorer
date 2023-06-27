import { RenderApplication, RenderEngine } from "app/models/rendering-container-image";
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

    // getFilteredContainerImages
    it("#getFilteredContainerImages correctly filters expected images", (done) => {
        renderingContainerImageService.getFilteredContainerImages(
            RenderApplication.Maya, RenderEngine.Arnold, "ubuntu-1604lts-container").subscribe((result) => {
            expect(result.length).toEqual(6);
            expect(result.find(image => image.containerImage === "ubuntu_maya2017u5_arnold2011")).toBeDefined();
            expect(result.find(image => image.containerImage === "ubuntu_maya2017u5_arnold2023")).toBeDefined();
            expect(result.find(image => image.containerImage === "ubuntu_maya2018u2_arnold2011")).toBeDefined();
            expect(result.find(image => image.containerImage === "ubuntu_maya2018u2_arnold2023")).toBeDefined();
            expect(result.find(image => image.containerImage === "ubuntu_maya2018u3_arnold3101")).toBeDefined();
            expect(result.find(image => image.containerImage === "ubuntu_maya2018u4_arnold3101")).toBeDefined();
            done();
        });
    });

    // containerImagesAsMap
    it("#containerImagesAsMap returns all images, keyed by containerImageId", (done) => {
        renderingContainerImageService.containerImagesAsMap().subscribe((result) => {
            expect(result.size).toEqual(12);
            new GithubDataServiceMock().githubDataResponse.containerImages.forEach(containerImage => {
                expect(result.get(containerImage.containerImage)).toBeDefined();
            });
            done();
        });
    });
});
