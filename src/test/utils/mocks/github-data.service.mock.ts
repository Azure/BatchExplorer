import { GithubDataService } from "app/services";
import { of } from "rxjs";

export class GithubDataServiceMock {

    public githubDataResponse = {
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
                containerImage: "win_maya2017_vray",
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
                containerImage: "win_maya2018_vray",
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
                containerImage: "ubuntu_maya2017u5_arnold2011",
                os: "Ubuntu 16.04",
                app: "maya",
                appVersion: "2017-Update5",
                renderer: "arnold",
                rendererVersion: "2.0.1.1",
                imageReferenceId : "ubuntu-1604lts-container",
            },
            {
                containerImage: "ubuntu_maya2017u5_arnold2023",
                os: "Ubuntu 16.04",
                app: "maya",
                appVersion: "2017-Update5",
                renderer: "arnold",
                rendererVersion: "2.0.2.3",
                imageReferenceId : "ubuntu-1604lts-container",
            },
            {
                containerImage: "ubuntu_maya2018u2_arnold2011",
                os: "Ubuntu 16.04",
                app: "maya",
                appVersion: "2018-Update2",
                renderer: "arnold",
                rendererVersion: "2.0.1.1",
                imageReferenceId : "ubuntu-1604lts-container",
            },
            {
                containerImage: "ubuntu_maya2018u2_arnold2023",
                os: "Ubuntu 16.04",
                app: "maya",
                appVersion: "2018-Update2",
                renderer: "arnold",
                rendererVersion: "2.0.2.3",
                imageReferenceId : "ubuntu-1604lts-container",
            },
            {
                containerImage: "ubuntu_maya2018u3_arnold3101",
                os: "Ubuntu 16.04",
                app: "maya",
                appVersion: "2018-Update3",
                renderer: "arnold",
                rendererVersion: "3.1.0.1",
                imageReferenceId : "ubuntu-1604lts-container",
            },
            {
                containerImage: "ubuntu_maya2018u4_arnold3101",
                os: "Ubuntu 16.04",
                app: "maya",
                appVersion: "2018-Update4",
                renderer: "arnold",
                rendererVersion: "3.1.0.1",
                imageReferenceId : "ubuntu-1604lts-container",
            },
            {
                containerImage: "ubuntu_3dsmax_vray25001",
                os: "Ubuntu 16.04",
                app: "3dsmax",
                appVersion: "2018-Update1",
                renderer: "vray",
                rendererVersion: "25001",
                imageReferenceId : "ubuntu-1604lts-container",
            },
            {
                containerImage: "ubuntu_3dsmax_vray36004",
                os: "Ubuntu 16.04",
                app: "3dsmax",
                appVersion: "2018-Update1",
                renderer: "vray",
                rendererVersion: "36004",
                imageReferenceId : "ubuntu-1604lts-container",
            },
        ],
    };

    public get = jasmine.createSpy("githubData.get").and.returnValue(of(JSON.stringify(this.githubDataResponse)));

    public asContainerImageMap() {
        const imageMap = new Map();
        for (const image of this.githubDataResponse.containerImages) {
            imageMap.set(image.containerImage, image);
        }
        return imageMap;
    }

    public asProvider() {
        return { provide: GithubDataService, useValue: this };
    }
}
