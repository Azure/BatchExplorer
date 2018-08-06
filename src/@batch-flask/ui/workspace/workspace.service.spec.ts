import { List } from "immutable";
import { Subscription } from "rxjs";

import * as Fixtures from "test/fixture";
import { Workspace } from "./workspace.model";
import { WorkspaceService } from "./workspace.service";

describe("WorkspaceService", () => {
    let workspaces: List<Workspace> = List([]);
    let currentWorkspace: Workspace = null;
    let haveWorkspacesLoaded: boolean = false;

    let store = {};
    let workspaceService: WorkspaceService;
    const subs: Subscription[] = [];
    let wsArr = [];

    beforeEach(() => {
        spyOn(localStorage, "getItem").and.callFake((key) => {
            return store[key];
        });

        spyOn(localStorage, "setItem").and.callFake((key, value) => {
            return store[key] = value;
        });

        workspaceService = new WorkspaceService();
        subs.push(workspaceService.workspaces.subscribe(x => workspaces = x));
        subs.push(workspaceService.haveWorkspacesLoaded.subscribe(x => haveWorkspacesLoaded = x));
        subs.push(workspaceService.currentWorkspace.subscribe(x => currentWorkspace = x));
    });

    afterEach(() => {
        store = {};
        subs.forEach(x => x.unsubscribe());
    });

    it("should not have any selected workspace selected", () => {
        workspaceService.init([]);

        expect(workspaces.count()).toBe(0);
        expect(currentWorkspace).toBe(undefined);
        expect(haveWorkspacesLoaded).toBe(true);
    });

    describe("given only one workspace", () => {
        beforeEach(() => {
            wsArr = [
                Fixtures.workspace.create({ id: "mouse", displayName: "kiwi" }),
            ];

            workspaceService.init(wsArr);
        });

        it("first and only ws should be selected", () => {
            expect(workspaces.count()).toBe(1);
            expect(currentWorkspace).not.toBe(null);
            expect(currentWorkspace.id).toBe("mouse");
        });
    });

    describe("given two workspaces", () => {
        beforeEach(() => {
            wsArr = [
                Fixtures.workspace.create({ id: "frog", displayName: "not a kiwi" }),
                Fixtures.workspace.create({ id: "mouse", displayName: "kiwi" }),
            ];
        });

        it("the first ws should be selected", () => {
            workspaceService.init(wsArr);

            expect(workspaces.count()).toBe(2);
            expect(currentWorkspace).not.toBe(null);
            expect(currentWorkspace.id).toBe("frog");
        });

        it("if ws id in local store then that one selected", () => {
            store["selected-workspace-id"] = "mouse";
            workspaceService.init(wsArr);

            expect(currentWorkspace.id).toBe("mouse");
        });
    });

    describe("workspace service handles changing selected workspace", () => {
        beforeEach(() => {
            wsArr = [
                Fixtures.workspace.create({ id: "hippo" }),
                Fixtures.workspace.create({ id: "mouse" }),
                Fixtures.workspace.create({ id: "cat" }),
            ];

            workspaceService.init(wsArr);
        });

        it("the first ws should be selected by default", () => {
            expect(workspaces.count()).toBe(3);
            expect(currentWorkspace.id).toBe("hippo");
        });

        it("can externally change selected workspace", () => {
            workspaceService.selectWorkspace(wsArr[2].id);
            expect(currentWorkspace).not.toBe(null);
            expect(currentWorkspace.id).toBe("cat");
        });
    });

    describe("ws service returns enabled feature state", () => {
        beforeEach(() => {
            wsArr = [
                Fixtures.workspace.create({ id: "hippo", features: {
                    job: {
                        graphs: false,
                        configuration: {
                            json: true,
                        },
                    },
                }}),
            ];

            workspaceService.init(wsArr);
        });

        it("hippo should be selected", () => {
            expect(currentWorkspace.id).toBe("hippo");
        });

        it("can ask for enabled features", () => {
            expect(workspaceService.isFeatureEnabled("job")).toBe(true);
            expect(workspaceService.isFeatureEnabled("job.graphs")).toBe(false);
            expect(workspaceService.isFeatureEnabled("job.configuration.json")).toBe(true);
            expect(workspaceService.isFeatureEnabled("job.configuration.apples")).toBe(true);
            expect(workspaceService.isFeatureEnabled("mouse")).toBe(true);
        });
    });

    describe("ws service hides disabled feature state", () => {
        beforeEach(() => {
            wsArr = [
                Fixtures.workspace.create({ id: "giraffe", features: {
                    pool: {
                        graphs: false,
                    },
                    data: false,
                }}),
            ];

            workspaceService.init(wsArr);
        });

        it("giraffe should be selected", () => {
            expect(currentWorkspace.id).toBe("giraffe");
        });

        it("hides disabled features", () => {
            expect(workspaceService.isFeatureDisabled("pool")).toBe(false);
            expect(workspaceService.isFeatureDisabled("pool.graphs")).toBe(true);
            expect(workspaceService.isFeatureDisabled("data")).toBe(true);
        });
    });

    describe("changing workspace changes visibility state", () => {
        beforeEach(() => {
            wsArr = [
                Fixtures.workspace.create({ id: "snake", features: { package: false }}),
                Fixtures.workspace.create({ id: "deer", features: { package: true }}),
            ];

            workspaceService.init(wsArr);
        });

        it("hides disabled features for snake", () => {
            expect(currentWorkspace.id).toBe("snake");
            expect(workspaceService.isFeatureEnabled("package")).toBe(false);
        });

        it("on workspace change, feature is enabled", () => {
            workspaceService.selectWorkspace(wsArr[1].id);
            expect(currentWorkspace.id).toBe("deer");
            expect(workspaceService.isFeatureEnabled("package")).toBe(true);
        });
    });
});
