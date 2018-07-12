import { BehaviorSubject, Observable } from "rxjs";

import { NodeConnectService } from "./node-connect.service";

fdescribe("NodeConnectService", () => {
    let nodeConnectService: NodeConnectService;

    let settingsServiceSpy;
    let fsServiceSpy;
    let sshKeyServiceSpy;

    beforeEach(() => {
        fsServiceSpy = {
            commonFolders: {
                home: "home",
            },
        };

        sshKeyServiceSpy = {
            getLocalPublicKey: jasmine.createSpy("getLocalPublicKey").and.returnValue(Observable.of("bar")),
        };

        settingsServiceSpy = {
            settings: new BehaviorSubject({
                "node-connect.default-username": "foo",
            }),
        };

        nodeConnectService = new NodeConnectService(settingsServiceSpy, fsServiceSpy, sshKeyServiceSpy);
    });

    afterEach(() => {
        nodeConnectService.ngOnDestroy();
    });

    it("should use a default username if provided", () => {
        expect(nodeConnectService.username).toEqual("foo");
    });

    it("should generate a random username if no default is provided", () => {
        const settings = {...settingsServiceSpy.settingsObs.value};
        delete settings["node-connect.default-username"];
        settingsServiceSpy.settingsObs.next(settings);
        expect(nodeConnectService.username).toBeTruthy();
        expect(nodeConnectService.username).not.toEqual("foo");
        expect(nodeConnectService.username).toEqual("batchlabs-user");
    });
});
