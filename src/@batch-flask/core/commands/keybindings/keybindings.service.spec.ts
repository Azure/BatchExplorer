import { Subscription } from "rxjs";
import { keydown } from "test/utils/helpers";
import { CommandRegistry } from "../command-registry";
import { ContextService } from "../context";
import { KeyBindingsService } from "./keybindings.service";

describe("Keybinding service", () => {
    let injectorSpy;
    let contextService: ContextService;
    let service: KeyBindingsService;

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

        contextService = new ContextService();
        service = new KeyBindingsService(contextService, injectorSpy);
        sub = service.listen();
    });

    afterEach(() => {
        (CommandRegistry as any)._commands.clear();
        sub.unsubscribe();
    });

    it("runs no shortcut if it doesn't match ", () => {
        keydown(document, "ctrl");
        keydown(document, "o");

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
});
