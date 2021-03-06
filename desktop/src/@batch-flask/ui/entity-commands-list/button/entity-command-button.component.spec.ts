import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { PermissionService, Workspace, WorkspaceService } from "@batch-flask/ui";
import { ButtonComponent, ButtonsModule } from "@batch-flask/ui/buttons";
import { BehaviorSubject, of } from "rxjs";
import * as Fixtures from "test/fixture";
import { click } from "test/utils/helpers";
import { EntityCommandButtonComponent } from "./entity-command-button.component";

interface MyModel {
    id: string;
}

const entity1: MyModel = {
    id: "entity-1",
};

interface MockCommandOptions {
    visible?: boolean;
    label?: string;
    enabled?: boolean;
    icon?: string;
    permission?: string;
}

@Component({
    template: `<bl-entity-command-button [command]="command" [entity]="entity"></bl-entity-command-button>`,
})
class TestComponent {
    public command = newMockCommand({});
    public entity = entity1;
}

function newMockCommand(opts: MockCommandOptions) {
    const defaultOpts = {
        enabled: true,
        visible: true,
        label: "mock-command",
        icon: "fa fa-custom",
        permission: "write",
        execute: jasmine.createSpy("command.execute"),
    };
    const options = { ...defaultOpts, ...opts };

    return {
        enabled: () => options.enabled,
        disabled: () => !options.enabled,
        visible: () => options.visible,
        icon: () => options.icon,
        label: () => options.label,
        execute: options.execute,
        permission: options.permission,
    };
}

describe("EntityCommandButtonComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let de: DebugElement;

    let permissionServiceSpy;
    let currentWorkspace: BehaviorSubject<Workspace>;
    let wsServiceSpy;

    function getButton(): ButtonComponent {
        const el = de.query(By.css("bl-button"));
        return el && el.componentInstance;
    }

    beforeEach(() => {
        permissionServiceSpy = {
            hasPermission: jasmine.createSpy("hasPermission").and.callFake((permission) => {
                return of(permission !== "admin");
            }),
        };

        currentWorkspace = new BehaviorSubject(Fixtures.workspace.create());
        wsServiceSpy = {
            currentWorkspace: currentWorkspace.asObservable(),
        };

        TestBed.configureTestingModule({
            imports: [ButtonsModule, NoopAnimationsModule],
            declarations: [EntityCommandButtonComponent, TestComponent],
            providers: [
                { provide: PermissionService, useValue: permissionServiceSpy },
                { provide: WorkspaceService, useValue: wsServiceSpy },
            ],
        });

        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-entity-command-button"));
        fixture.detectChanges();
    });

    it("Don't show button if visible is false", () => {
        testComponent.command = newMockCommand({
            visible: false,
        });
        fixture.detectChanges();

        const button = getButton();
        expect(button).toBeFalsy();
    });

    it("Show command label as tooltip", () => {
        testComponent.command = newMockCommand({
            label: "my-custom-label",
        });
        fixture.detectChanges();

        const button = getButton();
        expect(button).not.toBeFalsy();
        expect(button.title).toEqual("my-custom-label");
    });

    it("Show icon in button", () => {
        testComponent.command = newMockCommand({
            icon: "fa fa-some",
        });
        fixture.detectChanges();

        const el = de.query(By.css("bl-button .fa.fa-some"));
        expect(el).not.toBeFalsy();
    });

    it("Disable button when command is disabled", () => {
        testComponent.command = newMockCommand({
            enabled: false,
        });
        fixture.detectChanges();

        const button = getButton();
        expect(button).not.toBeFalsy();
        expect(button.disabled).toBe(true);
    });

    it("should disable button when not having permission", () => {
        testComponent.command = newMockCommand({
            permission: "admin",
        });
        fixture.detectChanges();

        const button = getButton();
        expect(button).not.toBeFalsy();
        expect(button.isDisabled).toBe(true);
    });

    it("click on button should trigger execute", () => {
        const command = testComponent.command = newMockCommand({});
        fixture.detectChanges();

        click(de.query(By.css("bl-button")));
        fixture.detectChanges();
        expect(command.execute).toHaveBeenCalledOnce();
        expect(command.execute).toHaveBeenCalledWith(entity1);
    });

});
