import { AccessToken, InMemoryDataStore } from "@batch-flask/core";
import { AzureChina, AzurePublic } from "client/azure-environment";
import { Constants } from "common";
import { DateTime } from "luxon";
import * as proxyquire from "proxyquire";
import { instrumentForAuth } from "test/utils/mocks/auth";
import { MockBrowserWindow, MockSplashScreen } from "test/utils/mocks/windows";
import { AADUser } from "./aad-user";
import { AADService } from "./aad.service";

const mock = proxyquire.noCallThru();

const sampleUser: AADUser = {
    aud: "94ef904d-c21a-4972-9244-b4d6a12b8e13",
    iss: "https://sts.windows.net/72f788bf-86f1-41af-21ab-2d7cd011db47/",
    iat: 1483372574,
    nbf: 1483372574,
    exp: 1483376474,
    amr: ["pwd", "mfa"],
    ipaddr: "198.217.117.26",
    name: "Frank Smith",
    nonce: "be4e7843-305e-42ab-988d-7ee109989d70",
    oid: "8a0of62c-3629-4619-abd4-8c2257a282be",
    platf: "5",
    sub: "0WzjD2jhHJVb-3h2PbwUDCJOIPPIJmQQYE832uFqiII",
    tid: "72f988bf-86f1-41af-91ab-2d7cd011db47",
    preferred_username: "frank.smith@example.com",
    username: "frank.smith@example.com",
    ver: "1.0",
};

describe("AADService", () => {
    let service: AADService;
    let appSpy;
    let localStorage: InMemoryDataStore;
    let ipcMainMock;
    let propertiesSpy;
    let telemetryManagerSpy;
    let dialogSpy;

    beforeEach(() => {
        localStorage = new InMemoryDataStore();
        appSpy = {
            mainWindow: new MockBrowserWindow(),
            splashScreen: new MockSplashScreen()
        };
        instrumentForAuth(appSpy);

        ipcMainMock = {
            on: () => null,
        };

        propertiesSpy = {
            azureEnvironment: AzurePublic,
        };
        telemetryManagerSpy = {
            enableTelemetry: jasmine.createSpy("enableTelemetry"),
            disableTelemetry: jasmine.createSpy("disableTelemetry"),
        };

        dialogSpy = {
            showMessageBox: jasmine.createSpy("showMessageBox").and.returnValue(0),
        };
    });

    async function initService() {
        const mockAADService = mock("./aad.service", {
            electron: {
                dialog: dialogSpy,
            },
        });
        service = new mockAADService.AADService(
            appSpy, localStorage, propertiesSpy, telemetryManagerSpy, ipcMainMock
        );
        spyOn<any>(service, "_loadTenants").and.returnValue(Promise.resolve());
        await service.init();
    }

    it("when there is no item in the localstorage it should not set the id_token", async () => {
        localStorage.removeItem(Constants.localStorageKey.currentUser);
        await initService();
        let user: AADUser | null = null;
        service.currentUser.subscribe(x => user = x);
        expect(user).toBeNull();
    });

    it("when localstorage has currentUser it should load it", async (done) => {
        await localStorage.setItem(Constants.localStorageKey.currentUser, JSON.stringify(sampleUser));
        await initService();
        let user: AADUser | null = null;
        service.currentUser.subscribe(x => user = x);
        expect(user).not.toBeNull();
        expect(user.username).toEqual("frank.smith@example.com");
        done();
    });

    describe("Sign-in", () => {
        beforeEach(async () => {
            const newToken = new AccessToken({
                accessToken: "newToken", expiresOn: DateTime.local().plus({ hours: 1 }),
            } as any);
            await initService();
            spyOn<any>(service, "retrieveAccessToken")
                .and.returnValue(Promise.resolve(newToken));
        });

        it("sign in to public cloud", async () => {
            await service.login().done;
            expect(dialogSpy.showMessageBox).not.toHaveBeenCalled();
        });

        it("sign in to national cloud", async () => {
            propertiesSpy.azureEnvironment = AzureChina;
            await service.login().done;
            expect(dialogSpy.showMessageBox).toHaveBeenCalledTimes(1);
            expect(dialogSpy.showMessageBox).toHaveBeenCalled();
        });
    });
});
