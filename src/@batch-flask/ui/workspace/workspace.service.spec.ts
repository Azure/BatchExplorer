import { Subscription } from "rxjs";
import * as Fixtures from "test/fixture";
import { Workspace } from "./workspace.model";
import { WorkspaceService } from "./workspace.service";

fdescribe("WorkspaceService", () => {
    let workspaceService: WorkspaceService;
    let currentWorkspace: Workspace;
    let currentWorkspaceId: string;
    const wsArr = [];
    // const workspace1 = new Workspace({ id: "workspace-1" } as any);

    const subs: Subscription[] = [];

    beforeEach(() => {
        currentWorkspace = undefined;
        workspaceService = new WorkspaceService();
        currentWorkspaceId = "workspace-1";
        workspaceService.selectWorkspace(currentWorkspaceId);
        // subs.push(workspaceService.selectWorkspace(currentWorkspaceId));
        subs.push(workspaceService.currentWorkspace.subscribe(x => currentWorkspace = x));
        const wsArr = [
            Fixtures.workspace.create({ id: "not-bob", displayName: "apple" }),
            Fixtures.workspace.create({ id: "mouse", displayName: "kiwi" }),
        ];
        // workspaceService.init(wsArr);

        describe("No workspace selected", () => {
            it("should have not any selected workspace selected details", () => {
                // console.log("currentWorkspaceId = ", currentWorkspaceId);
                // console.log("workspaceService.selectWorkspace IS = ", workspaceService.selectWorkspace);
                workspaceService.init(wsArr);
                // does ^ automatically run loadworkspaces which selects the next thing in the ws array?
                expect(workspaceService.selectWorkspace).toBe("null");
            });
        });

    });

    afterEach(() => {
        workspaceService = null;
        subs.forEach(x => x.unsubscribe());
    });
});

// it("currentWorkspace should not return anything until a value has been loaded", () => {
//     const accountSubscriptionSpy = jasmine.createSpy("currentWorkspace");
//     expect(accountSubscriptionSpy).not.toHaveBeenCalled();
//     expect(currentWorkspace).toBeUndefined();

//     workspaceService.selectWorkspace("workspace-1");
//     expect(currentWorkspace).not.toBeUndefined();
// });

// tests should be as follows:
// 1. Clicking on workspaces gets u the list of workspaces? not too clear ask andy
// 2. when you get a workspace it returns selected workspace as observable
// 3.
