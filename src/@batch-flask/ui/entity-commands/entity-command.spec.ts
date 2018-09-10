import { Injector } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { I18nTestingModule } from "@batch-flask/core/testing";
import { ActionableEntity, ActivityService, WorkspaceService } from "@batch-flask/ui";
import { DialogService } from "@batch-flask/ui/dialogs";
import { of } from "rxjs";
import { NotificationServiceMock } from "test/utils/mocks";
import { EntityCommand, EntityCommandAttributes, EntityCommandNotify } from "./entity-command";

interface MyModel {
    id: string;
}

const entity1: MyModel = {
    id: "entity-1",
};

const entity2: MyModel = {
    id: "entity-2",
};

const definition: any = {
    typeName: "Job",
};

describe("EntityCommand", () => {
    let dialogServiceSpy;
    let notificationServiceSpy: NotificationServiceMock;
    let injector;

    beforeEach(() => {
        dialogServiceSpy = {
            confirm: jasmine.createSpy("dialog.confirm"),
        };
        notificationServiceSpy = new NotificationServiceMock();
        TestBed.configureTestingModule({
            imports: [I18nTestingModule],
            providers: [
                { provide: DialogService, useValue: dialogServiceSpy },
                { provide: ActivityService, useValue: null },
                { provide: WorkspaceService, useValue: null },
                notificationServiceSpy.asProvider(),
            ],
        });

        injector = TestBed.get(Injector);
    });

    function newCommand<TEntity extends ActionableEntity>(options: EntityCommandAttributes<TEntity>) {
        const command = new EntityCommand<TEntity>(injector, options);
        command.definition = definition;
        return command;
    }

    it("label should allow fixed string", () => {
        const command = newCommand({
            label: "my-fixed-label",
            action: () => null,
            name: "my-fixed-label",
        });

        expect(command.label(entity1)).toEqual("my-fixed-label");
    });

    it("label should allow custom function", () => {
        const command = newCommand({
            label: () => "my-dynamic-label",
            action: () => null,
            name: "my-dynamic-label",
        });

        expect(command.label(entity1)).toEqual("my-dynamic-label");
    });

    it("should be enabled by default", () => {
        const command = newCommand({
            label: "my-label",
            action: () => null,
            name: "my-label",
        });

        expect(command.enabled(entity1)).toBe(true);
        expect(command.disabled(entity1)).toBe(false);
    });

    it("should allow to specify enabled", () => {
        const command = newCommand({
            label: "my-label",
            action: () => null,
            enabled: () => false,
            name: "my-label",
        });

        expect(command.enabled(entity1)).toBe(false);
        expect(command.disabled(entity1)).toBe(true);
    });

    it("should  allow multiple by default", () => {
        const command = newCommand({
            label: "my-label",
            action: () => null,
            name: "my-label",
        });

        expect(command.multiple).toBe(true);
    });

    it("should allow to specify enabled", () => {
        const command = newCommand({
            label: "my-label",
            action: () => null,
            multiple: false,
            name: "my-label",
        });

        expect(command.multiple).toBe(false);
    });

    it("notify should be always by default", () => {
        const command = newCommand({
            label: "my-label",
            action: () => null,
            name: "my-label",
        });

        expect(command.notify).toEqual(EntityCommandNotify.Always);
    });

    it("should allow to disable notify by setting to false", () => {
        const command = newCommand({
            label: "my-label",
            action: () => null,
            notify: false,
            name: "my-label",
        });

        expect(command.notify).toEqual(EntityCommandNotify.Never);
    });

    it("should allow to disable notify by setting to exact value", () => {
        const command = newCommand({
            label: "my-label",
            action: () => null,
            notify: EntityCommandNotify.OnFailure,
            name: "my-label",
        });

        expect(command.notify).toEqual(EntityCommandNotify.OnFailure);
    });

    describe("#performAction", () => {
        it("Works when action return observable", (done) => {
            const actionSpy = jasmine.createSpy("action").and.returnValue(of("some-obs-value"));
            const command = newCommand({
                label: "my-label",
                action: actionSpy,
                notify: EntityCommandNotify.OnFailure,
                name: "my-label",
            });

            command.performAction(entity1, null).subscribe((result) => {
                expect(result).toBe("some-obs-value");
                expect(actionSpy).toHaveBeenCalledOnce();
                expect(actionSpy).toHaveBeenCalledWith(entity1, null);
                done();
            });
        });

        it("Works when action doesn't return observable", (done) => {
            const actionSpy = jasmine.createSpy("action").and.returnValue(null);
            const command = newCommand({
                label: "my-label",
                action: actionSpy,
                notify: EntityCommandNotify.OnFailure,
                name: "my-label",
            });

            command.performAction(entity1, null).subscribe((result) => {
                expect(result).toBe(null);
                expect(actionSpy).toHaveBeenCalledOnce();
                expect(actionSpy).toHaveBeenCalledWith(entity1, null);
                done();
            });
        });
    });

    describe("#executeMultiple", () => {
        it("calls the generic confirmation dialog by default", () => {
            const actionSpy = jasmine.createSpy("action").and.returnValue(of("some-obs-value"));
            const command = newCommand({
                label: "my-label",
                action: actionSpy,
                notify: EntityCommandNotify.OnFailure,
                name: "my-label",
            });
            command.executeMultiple([entity1, entity2]);

            expect(dialogServiceSpy.confirm).toHaveBeenCalledOnce();
            expect(dialogServiceSpy.confirm).toHaveBeenCalledWith(
                "entity-command.confirm.multiple.title(action:my-label, count:2, type:jobs)",
                jasmine.anything(),
            );
        });
    });

});
