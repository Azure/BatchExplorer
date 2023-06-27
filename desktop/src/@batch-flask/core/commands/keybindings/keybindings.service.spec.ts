import { BehaviorSubject, Subscription } from "rxjs";
import { keydown } from "test/utils/helpers";
import { CommandRegistry } from "../command-registry";
import { ContextService } from "../context";
import { KeyBinding, KeyBindingsService } from "./keybindings.service";

describe("Keybinding service", () => {
    let injectorSpy;
    let contextService: ContextService;
    let service: KeyBindingsService;
    let userKeyBindingServiceSpy;

    let cmd1Spy: jasmine.Spy;
    let cmd2Spy: jasmine.Spy;
    let cmd3Spy: jasmine.Spy;
    let sub: Subscription;

    beforeEach(() => {
        cmd1Spy = jasmine.createSpy("cmd1");
        cmd2Spy = jasmine.createSpy("cmd2");
        cmd3Spy = jasmine.createSpy("cmd3");

        CommandRegistry.register({
            id: "foo",
            description: "My foo command",
            binding: "ctrl+f",
            execute: cmd1Spy,
        });
        CommandRegistry.register({
            id: "bar",
            description: "My bar command",
            binding: "ctrl+b",
            when: (context) => context.has("barAllowed"),
            execute: cmd2Spy,
        });
        CommandRegistry.register({
            id: "barAlt",
            description: "My other command",
            binding: "ctrl+b",
            when: (context) => !context.has("barAllowed"),
            execute: cmd3Spy,
        });

        injectorSpy = {
            get: () => "foo",
        };

        userKeyBindingServiceSpy = {
            bindings: new BehaviorSubject([]),
        };

        contextService = new ContextService();
        service = new KeyBindingsService(contextService, userKeyBindingServiceSpy, injectorSpy);
        sub = service.listen();
    });

    afterEach(() => {
        (CommandRegistry as any)._commands.clear();
        sub.unsubscribe();
    });

    it("runs no shortcut if it doesn't match ", () => {
        keydown(document, "ctrl");
        keydown(document, "k");

        expect(cmd1Spy).not.toHaveBeenCalled();
        expect(cmd2Spy).not.toHaveBeenCalled();
        expect(cmd3Spy).not.toHaveBeenCalled();
    });

    it("runs a global command without condition", () => {
        keydown(document, "ctrl");
        keydown(document, "f");

        expect(cmd1Spy).toHaveBeenCalledOnce();
        expect(cmd2Spy).not.toHaveBeenCalled();
        expect(cmd3Spy).not.toHaveBeenCalled();
    });

    it("runs a command when condition is a certain way", () => {
        keydown(document, "ctrl");
        keydown(document, "b");

        expect(cmd1Spy).not.toHaveBeenCalled();
        expect(cmd2Spy).not.toHaveBeenCalled();
        expect(cmd3Spy).toHaveBeenCalledOnce();
    });

    it("runs another command when condition change", () => {
        contextService.setContext("barAllowed", true);

        keydown(document, "ctrl");
        keydown(document, "b");

        expect(cmd1Spy).not.toHaveBeenCalled();
        expect(cmd2Spy).toHaveBeenCalledOnce();
        expect(cmd3Spy).not.toHaveBeenCalled();
    });

    describe("when user change the key bindings", () => {
        beforeEach(() => {
            userKeyBindingServiceSpy.bindings.next([
                { commandId: "foo", binding: KeyBinding.parse("ctrl+t") },
            ]);
        });

        it("calls with the new shortcut", () => {
            keydown(document, "ctrl");
            keydown(document, "t");

            expect(cmd1Spy).toHaveBeenCalled();
            expect(cmd2Spy).not.toHaveBeenCalledOnce();
            expect(cmd3Spy).not.toHaveBeenCalled();
        });

        it("doest NOT call with the old shortcut", () => {
            keydown(document, "ctrl");
            keydown(document, "f");

            expect(cmd1Spy).not.toHaveBeenCalled();
            expect(cmd2Spy).not.toHaveBeenCalledOnce();
            expect(cmd3Spy).not.toHaveBeenCalled();
        });
    });

});
