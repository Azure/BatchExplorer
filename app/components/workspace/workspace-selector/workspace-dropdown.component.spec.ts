import { ChangeDetectorRef, Component, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { RouterTestingModule } from "@angular/router/testing";
import { WorkspaceService } from "@batch-flask/ui";
import { ButtonsModule } from "@batch-flask/ui/buttons";
import { DropdownModule } from "@batch-flask/ui/dropdown";
import { Workspace } from "app/models";
import { List } from "immutable";
import { BehaviorSubject } from "rxjs";
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
    let wsArr = [];

    beforeEach(() => {
        workspaces = new BehaviorSubject(List([]));
        currentWorkspace = new BehaviorSubject(null);
        workspaceSpy = {
            workspaces: workspaces.asObservable(),
            currentWorkspace: currentWorkspace.asObservable(),
            selectWorkspace: jasmine.createSpy("selectWorkspace").and.callFake((workspaceId: string) => {
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

    describe("when there is 1 workspace", () => {
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

    describe("when there are multiple workspaces and first workspace is selected", () => {
        beforeEach(() => {
            const ws = [
                Fixtures.workspace.create({ id: "not-bob", displayName: "apple" }),
                Fixtures.workspace.create({ id: "mouse", displayName: "kiwi" }),
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

        it("have two workspace", () => {
            expect(workspaces.value.count()).toBe(2);
        });

        it("drop down should have 3 items", () => {
            // two workspaces and one 'manage'
            const items = fixture.debugElement.queryAll(By.css(".dropdown-item"));
            expect(items.length).toBe(3);
            expect(items[0].nativeElement.textContent).toContain("apple");
            expect(items[1].nativeElement.textContent).toContain("kiwi");
            expect(items[2].nativeElement.textContent).toContain("Manage workspaces");
        });
    });

    describe("when there are multiple workspaces and second workspace is selected", () => {
        beforeEach(() => {
            const ws = [
                Fixtures.workspace.create({ id: "not-bob", displayName: "apple" }),
                Fixtures.workspace.create({ id: "mouse", displayName: "kiwi" }),
            ];

            workspaces.next(List(ws));
            currentWorkspace.next(ws.last());
            dropDownButton.nativeElement.click();
            fixture.detectChanges();
        });

        it("should have selected details", () => {
            expect(component.selectButtonText).toBe("kiwi");
            expect(dropDownButton.nativeElement.textContent).toContain("kiwi");
            expect(component.selectedWorkspaceId).toBe("mouse");
        });
    });

    describe("when we change workspaces", () => {
        beforeEach(() => {
            wsArr = [
                Fixtures.workspace.create({ id: "not-bob", displayName: "apple" }),
                Fixtures.workspace.create({ id: "mouse", displayName: "kiwi" }),
            ];

            workspaces.next(List(wsArr));
            currentWorkspace.next(wsArr.first());
            dropDownButton.nativeElement.click();
            fixture.detectChanges();
        });

        it("should have initially selected workspace apple", () => {
            expect(component.selectedWorkspaceId).toBe("not-bob");
            expect(component.selectButtonText).toBe("apple");
            expect(dropDownButton.nativeElement.textContent).toContain("apple");
        });

        it("should have changed workspace to kiwi details", () => {
            component.setWorkspace(wsArr[1]);
            fixture.detectChanges();
            expect(workspaceSpy.selectWorkspace).toHaveBeenCalledTimes(1);
            expect(workspaceSpy.selectWorkspace).toHaveBeenCalledWith("mouse");

            expect(component.selectedWorkspaceId).toBe("mouse");
            expect(component.selectButtonText).toBe("kiwi");
            expect(dropDownButton.nativeElement.textContent).toContain("kiwi");

        });

        it("should have changed workspace to apple details", () => {
            component.setWorkspace(wsArr[0]);
            fixture.detectChanges();
            expect(workspaceSpy.selectWorkspace).toHaveBeenCalledTimes(1);
            expect(workspaceSpy.selectWorkspace).toHaveBeenCalledWith("not-bob");

            expect(component.selectedWorkspaceId).toBe("not-bob");
            expect(component.selectButtonText).toBe("apple");
            expect(dropDownButton.nativeElement.textContent).toContain("apple");
        });
    });
});
