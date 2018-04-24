import { EntityCommand, EntityCommandNotify } from "./entity-command";

interface MyModel {
    id: string;
}

const entity1: MyModel = {
    id: "entity-1",
};

const injector = {
    get: () => null,
};

describe("EntityCommand", () => {

    it("label should allow fixed string", () => {
        const command = new EntityCommand<MyModel>(injector, {
            label: "my-fixed-label",
            action: () => null,
        });

        expect(command.label(entity1)).toEqual("my-fixed-label");
    });

    it("label should allow custom function", () => {
        const command = new EntityCommand<MyModel>(injector, {
            label: () => "my-dynamic-label",
            action: () => null,
        });

        expect(command.label(entity1)).toEqual("my-dynamic-label");
    });

    it("should be enabled by default", () => {
        const command = new EntityCommand<MyModel>(injector, {
            label: "my-label",
            action: () => null,
        });

        expect(command.enabled(entity1)).toBe(true);
    });

    it("should allow to specify enabled", () => {
        const command = new EntityCommand<MyModel>(injector, {
            label: "my-label",
            action: () => null,
            enabled: () => false,
        });

        expect(command.enabled(entity1)).toBe(false);
    });

    it("should  allow multiple by default", () => {
        const command = new EntityCommand<MyModel>(injector, {
            label: "my-label",
            action: () => null,
        });

        expect(command.multiple).toBe(true);
    });

    it("should allow to specify enabled", () => {
        const command = new EntityCommand<MyModel>(injector, {
            label: "my-label",
            action: () => null,
            multiple: false,
        });

        expect(command.multiple).toBe(false);
    });

    it("notify should be always by default", () => {
        const command = new EntityCommand<MyModel>(injector, {
            label: "my-label",
            action: () => null,
        });

        expect(command.notify).toEqual(EntityCommandNotify.Always);
    });

    it("should allow to disable notify by setting to false", () => {
        const command = new EntityCommand<MyModel>(injector, {
            label: "my-label",
            action: () => null,
            notify: false,
        });

        expect(command.notify).toEqual(EntityCommandNotify.Never);
    });

    it("should allow to disable notify by setting to exact value", () => {
        const command = new EntityCommand<MyModel>(injector, {
            label: "my-label",
            action: () => null,
            notify: EntityCommandNotify.OnFailure,
        });

        expect(command.notify).toEqual(EntityCommandNotify.OnFailure);
    });
});
