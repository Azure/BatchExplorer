import { Subscription } from "rxjs";
import * as Fixtures from "test/fixture";
import { Workspace } from "./workspace.model";
import { WorkspaceService } from "./workspace.service";

describe("WorkspaceService", () => {
    let workspaceService: WorkspaceService;
    let currentWorkspace: Workspace = null;
    let currentWorkspaceId: string;
    let workspaceArr = [];
    // const workspaceId = workspaceArr[0].id;
    // const workspace1 = new Workspace({ id: "workspace-1" } as any);

    const subs: Subscription[] = [];

    beforeEach(() => {
        workspaceService = new WorkspaceService();
        workspaceArr = [
            Fixtures.workspace.create({ id: "not-bob", displayName: "apple" }),
            Fixtures.workspace.create({ id: "mouse", displayName: "kiwi" }),
        ];
        currentWorkspace = undefined;
        // currentWorkspace = workspaceArr.first();
        // currentWorkspaceId = currentWorkspace.id;
        // workspaceService.selectWorkspace(currentWorkspaceId);
        subs.push(workspaceService.currentWorkspace.subscribe(x => currentWorkspace = x));

        workspaceService.init(workspaceArr);
        workspaceService.selectWorkspace(workspaceArr[0].id);
        // need something like: fixture.detectChanges();
    });

    // describe("No workspace selected", () => {
    //     it("should have not any selected workspace selected details", () => {
    //         console.log("workspaceService.currentWorkspace IS = ", workspaceService.currentWorkspace);
    //         expect(workspaceService.currentWorkspace).toBe(undefined);
    //     });
    // });

    describe("First workspace selected", () => {
        beforeEach(() => {
            workspaceArr = [
                Fixtures.workspace.create({ id: "not-bob", displayName: "apple" }),
                Fixtures.workspace.create({ id: "mouse", displayName: "kiwi" }),
            ];
            currentWorkspace = workspaceArr.first();
            currentWorkspaceId = currentWorkspace.id;
            workspaceService.selectWorkspace(currentWorkspaceId);
        });

        it("should be showing first selected workspace", () => {
            // console.log("currentWorkspaceId = ", currentWorkspaceId);
            // workspaceService.init(workspaceArr);
            workspaceService.selectWorkspace("not-bob");
            expect(currentWorkspaceId).toBe("not-bob");
        });
    });

    describe("Second workspace selected", () => {
        beforeEach(() => {
            workspaceArr = [
                Fixtures.workspace.create({ id: "not-bob", displayName: "apple" }),
                Fixtures.workspace.create({ id: "mouse", displayName: "kiwi" }),
            ];
            // console.log("currentWorkspaceId should still be not-bob = ", currentWorkspaceId);
            currentWorkspace = workspaceArr.last();
            currentWorkspaceId = currentWorkspace.id;
            workspaceService.selectWorkspace(currentWorkspaceId);
        });

        it("should be showing second selected workspace", () => {
            // console.log("currentWorkspaceId should be mouse = ", currentWorkspaceId);
            expect(currentWorkspaceId).toBe("mouse");
        });
    });

    // describe("Changing selected workspace", () => {
    //     beforeEach(() => {
    //         workspaceArr = [
    //             Fixtures.workspace.create({ id: "not-bob", displayName: "apple" }),
    //             Fixtures.workspace.create({ id: "mouse", displayName: "kiwi" }),
    //         ];
    //         currentWorkspace = workspaceArr.first();
    //         currentWorkspaceId = currentWorkspace.id;
    //         workspaceService.selectWorkspace(currentWorkspaceId);
    //     });

    //     it("should be showing second workspace", () => {
    //         currentWorkspace = workspaceArr.last();
    //         console.log("currentWorkspace = workspaceArr.last() = ", currentWorkspace);
    //         console.log("should be showing second workspace which has id mouse = ", currentWorkspaceId);
    //         expect(currentWorkspaceId).toBe("mouse");
    //     });

    //     it("should be showing first workspace", () => {
    //         currentWorkspace = workspaceArr.first();
    //         console.log("should be showing first workspace which has id not-bob = ", currentWorkspaceId);
    //         expect(currentWorkspaceId).toBe("not-bob");
    //     });
    // });

    // afterEach(() => {
    //     workspaceService = null;
    //     subs.forEach(x => x.unsubscribe());
    // });
});
