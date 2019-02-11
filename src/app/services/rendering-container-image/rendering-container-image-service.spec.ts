import {
    RenderApplication, RenderEngine,
} from "app/models/rendering-container-image";
import { of } from "rxjs";
import { RenderingContainerImageService } from "./rendering-container-image.service";

fdescribe("RenderingContainerImageService", () => {
    let renderingContainerImageService: RenderingContainerImageService;
    let githubDataServiceSpy;

    const githubDataResponse = {
        imageReferences: [
            {
                id: "ubuntu-1604lts-container",
                node_sku_id: "batch.node.ubuntu 16.04",
                publisher : "microsoft-azure-batch",
                offer : "ubuntu-server-container",
                sku : "16-04-lts",
                version : "latest",
            },
            {
                id: "windowsserver-2016-container",
                node_sku_id: "batch.node.windows amd64",
                publisher : "MicrosoftWindowsServer",
                offer : "WindowsServer",
                sku : "2016-DataCenter-With-Containers",
                version : "latest",
            },
            {
                id: "windowsserver-2016-container2",
                node_sku_id: "batch.node.windows amd64",
                publisher : "MicrosoftWindowsServer",
                offer : "WindowsServer",
                sku : "2016-DataCenter-With-Containers",
                version : "latest",
            },
            ],
            containerImages: [
            {
                containerImage: "win_maya_vray",
                os: "Windows Server 2016",
                app: "maya",
                appVersion: "2017-Update5",
                renderer: "vray",
                rendererVersion: "2017-Update5",
                imageReferenceId : "windowsserver-2016-container",
            },
            {
                containerImage: "win_maya_arnold",
                os: "Windows Server 2016",
                app: "maya",
                appVersion: "2017-Update5",
                renderer: "arnold",
                rendererVersion: "2.0.1.1",
                imageReferenceId : "windowsserver-2016-container",
            },
            {
                containerImage: "win_maya_vray",
                os: "Windows Server 2016",
                app: "maya",
                appVersion: "2018-Update1",
                renderer: "vray",
                rendererVersion: "2.0.1.1",
                imageReferenceId : "windowsserver-2016-container",
            },
            {
                containerImage: "ubuntu_maya_vray",
                os: "Ubuntu 16.04",
                app: "maya",
                appVersion: "2017-Update5",
                renderer: "vray",
                rendererVersion: "2.0.1.1",
                imageReferenceId : "ubuntu-1604lts-container",
            },
            {
                containerImage: "ubuntu_maya_arnold_2011",
                os: "Ubuntu 16.04",
                app: "maya",
                appVersion: "2017-Update5",
                renderer: "arnold",
                rendererVersion: "2.0.1.1",
                imageReferenceId : "ubuntu-1604lts-container",
            },
            {
                containerImage: "ubuntu_maya_arnold_2023",
                os: "Ubuntu 16.04",
                app: "maya",
                appVersion: "2017-Update5",
                renderer: "arnold",
                rendererVersion: "2.0.2.3",
                imageReferenceId : "ubuntu-1604lts-container",
            },
            {
                containerImage: "ubuntu_3dsmax_vray",
                os: "Ubuntu 16.04",
                app: "3dsmax",
                appVersion: "2018-Update1",
                renderer: "vray",
                rendererVersion: "2.0.2.3",
                imageReferenceId : "ubuntu-1604lts-container",
            },
        ],
    };

    beforeEach(() => {
        githubDataServiceSpy = {
            get: jasmine.createSpy("githubData.get").and.returnValue(of(JSON.stringify(githubDataResponse))),
        };

        renderingContainerImageService = new RenderingContainerImageService(githubDataServiceSpy);
    });

    // findContainerImageById
    it("#findContainerImageById finds and returns expected containerImage", (done) => {
        renderingContainerImageService.findContainerImageById("ubuntu_maya_arnold_2011").subscribe((result) => {
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
            RenderApplication.Maya, RenderEngine.Arnold, "ubuntu-1604lts-container").subscribe((result) => {
            expect(result.length).toEqual(1);
            expect(result.pop()).toEqual("2017-Update5");
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
            RenderApplication.Maya, RenderEngine.Arnold, "ubuntu-1604lts-container", "2017-Update5")
            .subscribe((result) => {
            expect(result.length).toEqual(2);
            expect(result.find(x => x.containerImage === "ubuntu_maya_arnold_2011")).toBeDefined();
            expect(result.find(x => x.containerImage === "ubuntu_maya_arnold_2023")).toBeDefined();
            done();
        });
    });
});
