import { ChangeDetectorRef, Component, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { RouterTestingModule } from "@angular/router/testing";
import { List } from "immutable";
import { BehaviorSubject, Observable } from "rxjs";

import { DropdownModule } from "@batch-flask/ui/dropdown";
import { Workspace } from "app/models";
import { WorkspaceService } from "app/services";
import * as Fixtures from "test/fixture";
import { WorkspaceDropDownComponent } from "./workspace-dropdown.component";

@Component({
    template: "<bl-workspace-dropdown></bl-workspace-dropdown>",
})
class TestComponent {
}

fdescribe("WorkspaceDropDownComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let component: WorkspaceDropDownComponent;
    let debugElement;

    let workspaces: BehaviorSubject<List<Workspace>>;
    let currentWorkspace: BehaviorSubject<Workspace>;
    let workspaceSpy;
    let dropDownButton;

    beforeEach(() => {
        workspaces = new BehaviorSubject(List([]));
        currentWorkspace = new BehaviorSubject(null);
        workspaceSpy = {
            workspaces: workspaces.asObservable(),
            currentWorkspace: currentWorkspace.asObservable(),
            selectWorkspace: jasmine.createSpy("selectWorkspace").and.callFake((workspaceId) => {
                // const wsId: "007";
                // const name: "";
                // remove from fav list
                // const favArray = workspaces.value.toArray();
                // favArray.splice(0, 1);
                // workspaces.next(List(favArray));
            }),
            // selectWorkspace: jasmine.createSpy("selectWorkspace").and.callFake((workspaceName) => {
            //     workspaceName = "";
            // }),
            // selectWorkspace: jasmine.createSpy("selectWorkspace").and.callFake((loaded) => {
            //     loaded = false;
            // }),
        };

        TestBed.configureTestingModule({
            imports: [DropdownModule, RouterTestingModule],
            declarations: [WorkspaceDropDownComponent, TestComponent],
            providers: [
                { provide: ChangeDetectorRef, useValue: null },
                { provide: WorkspaceService, useValue: workspaceSpy },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });

        fixture = TestBed.createComponent(TestComponent);
        debugElement = fixture.debugElement.query(By.css("bl-workspace-dropdown"));
        dropDownButton = debugElement.query(By.css("[bl-dropdown-btn]"));
        component = debugElement.componentInstance;
        fixture.detectChanges();
    });

    describe("basic workspace setup", () => {
        it("should return the correct workspace ID and be loaded", () => {
            expect(component.selectedWorkspaceId).toBe("");
            expect(component.selectedWorkspaceName).toBe("");
            expect(component.loaded).toBe(true);
        });

        it("should show Manage Workspaces only", () => {
            expect(dropDownButton.nativeElement.textContent).toContain("Manage Workspaces");
            // expect(component.selectedWorkspaceName).toBe("");
            // expect(component.selectedWorkspaceId).toBe("");
        });

        it("should show 1 item in dropdown", () => {
            const items = fixture.debugElement.queryAll(By.css(".dropdown-item"));
            expect(items.length).toBe(1);
            expect(items[0].nativeElement.textContent).toContain("Manage Workspaces");
        });
    });

    describe("when there are workspaces", () => {
        beforeEach(() => {
            const ws = new Workspace({
                id: "me",
                displayName: "my template",
                description: "",
                features: {} as any,
            });

            workspaces.next(List([ws]));
            currentWorkspace.next(ws);
            dropDownButton.nativeElement.click();
            fixture.detectChanges();
        });

        it("should show 2 workspaces", () => {
            console.log("test now");
            expect(component.selectedWorkspaceName).toBe("my template");
            expect(component.selectedWorkspaceId).toBe("me");
            expect(dropDownButton.nativeElement.textContent).toContain("my template");
        });

        // todo: add this to the first describe
        // it("drop down should have 1 item", () => {
        //     const items = fixture.debugElement.queryAll(By.css(".dropdown-item"));
        //     expect(items.length).toBe(2);
        //     expect(items[0].nativeElement.textContent).toContain("my template");
        //     expect(items[1].nativeElement.textContent).toContain("manage worspaces");
        // });
    });

    // describe("when there are more than one favorite", () => {
    //     beforeEach(() => {
    //         workspaces.next(List([
    //             Fixtures.pinnable.create({
    //                 id: "my-job-matt",
    //                 routerLink: ["/jobs", "my-job-matt"],
    //                 pinnableType: PinnedEntityType.Job,
    //                 url: "https://myaccount.westus.batch.com/jobs/my-job-matt",
    //             }),
    //             Fixtures.pinnable.create({
    //                 id: "my-pool-bob",
    //                 name: "my-name-is-bob",
    //                 routerLink: ["/pools", "my-pool-bob"],
    //                 pinnableType: PinnedEntityType.Pool,
    //                 url: "https://myaccount.westus.batch.com/pools/my-pool-bob",
    //             }),
    //         ]));

    //         dropDownButton.nativeElement.click();
    //         fixture.detectChanges();
    //     });

    //     it("should show favorite count in the title", () => {
    //         expect(component.title).toBe("2 favorite items pinned");
    //         expect(dropDownButton.nativeElement.textContent).toContain("2 favorite items pinned");
    //     });

    //     it("drop down should have 2 items", () => {
    //         const items = debugElement.queryAll(By.css(".dropdown-item"));
    //         expect(items.length).toBe(2);
    //     });

    //     it("pool should show name over id", () => {
    //         const items = debugElement.queryAll(By.css(".dropdown-item"));
    //         expect(items[0].nativeElement.textContent).toContain("my-job-matt");
    //         expect(items[1].nativeElement.textContent).toContain("my-name-is-bob");
    //         expect(items[1].nativeElement.textContent).not.toContain("my-pool-bob");
    //     });
    // });

    // describe("when we remove workspaces", () => {
    //     beforeEach(() => {
    //         workspaces.next(List([
    //             Fixtures.pinnable.create({
    //                 id: "my-apple",
    //                 routerLink: ["/certificates", "my-apple"],
    //                 pinnableType: PinnedEntityType.Certificate,
    //                 url: "https://myaccount.westus.batch.com/jobs/my-apple",
    //             }),
    //         ]));

    //         dropDownButton.nativeElement.click();
    //         fixture.detectChanges();
    //     });

    //     it("should be one favorite", () => {
    //         expect(workspaces.value.count()).toBe(1);
    //     });

    //     it("should remove favorite", () => {
    //         component.removeFavorite(workspaces.value.toArray()[0] as any);
    //         expect(pinServiceSpy.unPinFavorite).toHaveBeenCalledTimes(1);
    //         expect(workspaces.value.count()).toBe(0);
    //     });
    // });
});
