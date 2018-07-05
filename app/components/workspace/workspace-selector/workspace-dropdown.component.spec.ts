import { ChangeDetectorRef, Component, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { RouterTestingModule } from "@angular/router/testing";
import { List } from "immutable";
import { BehaviorSubject } from "rxjs";

import { ButtonsModule } from "@batch-flask/ui/buttons";
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

    let dropDownButton;
    let workspaces: BehaviorSubject<List<Workspace>>;
    let currentWorkspace: BehaviorSubject<Workspace>;
    let workspaceSpy;

    beforeEach(() => {
        workspaces = new BehaviorSubject(List([]));
        currentWorkspace = new BehaviorSubject(null);
        workspaceSpy = {
            workspaces: workspaces.asObservable(),
            currentWorkspace: currentWorkspace.asObservable(),
            // selectWorkspace: jasmine.createSpy("selectWorkspace"),
            selectWorkspace: jasmine.createSpy("selectWorkspace").and.callFake((workspaceId) => {
                const found = workspaces.value.find((item) => item.id === workspaceId);
                currentWorkspace.next(found);
            }),
        };

        TestBed.configureTestingModule({
            imports: [ButtonsModule, DropdownModule, RouterTestingModule],
            declarations: [WorkspaceDropDownComponent, TestComponent],
            providers: [
                { provide: ChangeDetectorRef, useValue: null },
                { provide: WorkspaceService, useValue: workspaceSpy },
            ],
            // schemas: [NO_ERRORS_SCHEMA],
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
            expect(component.selectButtonText).toBe("No workspace selected");
            expect(component.loaded).toBe(true);
        });
    });

    describe("basic workspace setup", () => {
        beforeEach(() => {
            dropDownButton.nativeElement.click();
            fixture.detectChanges();
        });

        it("should show manange workspaces item in dropdown", () => {
            const items = fixture.debugElement.queryAll(By.css(".dropdown-item"));
            expect(items.length).toBe(1);
            expect(items[0].nativeElement.textContent).toContain("Manage workspaces");
        });
    });

    describe("when there are workspaces", () => {
        beforeEach(() => {
            const ws = [
                Fixtures.workspace.create({ id: "not-bob", displayName: "apple" }),
            ];

            workspaces.next(List(ws));
            currentWorkspace.next(ws.first());
            dropDownButton.nativeElement.click();
            fixture.detectChanges();
        });

        it("should have selected details", () => {
            expect(component.selectButtonText).toBe("apple");
            expect(dropDownButton.nativeElement.textContent).toContain("apple");
            expect(component.selectedWorkspaceId).toBe("not-bob");
        });

        it("have one workspace", () => {
            expect(workspaces.value.count()).toBe(1);
        });

        it("drop down should have 2 items", () => {
            // one workspace and one 'manage'
            const items = fixture.debugElement.queryAll(By.css(".dropdown-item"));
            expect(items.length).toBe(2);
            expect(items[0].nativeElement.textContent).toContain("apple");
            expect(items[1].nativeElement.textContent).toContain("Manage workspaces");
        });
    });

    // describe("when we change workspaces", () => {
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
    //         component.selectWorkspace(ws[1])
    //
    //         fixture.detectChanges();
    //

/**
*                expect(component.selectedWorkspaceId).toBe(the one i set it to)
*                expect(component.selectButtonText).toBe(the one i set it to)
 *
 */

    //         spy.selectWorkspace.hasbeencalledone(1)
    //         expect(jobScheduleServiceSpy.selectWorkspace).toHaveBeenCalledTimes(1);
    //                                                       toHaveBeenCalledWith("the id")
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
});
