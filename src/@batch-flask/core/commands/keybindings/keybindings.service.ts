import { Injectable, Injector, OnDestroy } from "@angular/core";
import { KeyModifier } from "@batch-flask/core/keys";
import { log } from "@batch-flask/utils";
import { BehaviorSubject, Observable, Subject, Subscription, combineLatest, fromEvent, merge } from "rxjs";
import { map, publishReplay, refCount, takeUntil, tap } from "rxjs/operators";
import { Command, CommandRegistry } from "../command-registry";
import { CommandContext, ContextService } from "../context";
import { UserBinding, UserKeybindingsService } from "./user-keybindings.service";

@Injectable({ providedIn: "root" })
export class KeyBindingsService implements OnDestroy {
    public keyBindings: Observable<Readonly<Map<string, Command[]>>>;
    private _defaultKeyBindings = new BehaviorSubject(Object.freeze(new Map<string, KeyBinding>()));
    private _current: Readonly<Map<string, Command[]>> = Object.freeze(new Map<string, Command[]>());

    private _destroy = new Subject();

    constructor(
        private contextService: ContextService,
        private userKeybindingsService: UserKeybindingsService,
        private injector: Injector,
    ) {
        this.keyBindings = combineLatest(this._defaultKeyBindings, userKeybindingsService.bindings).pipe(
            map(([defaultBindings, userBindings]) => {
                const mergedBindings = this._mergeBindings(defaultBindings, userBindings);
                return Object.freeze(this._processBindings(mergedBindings));
            }),
            publishReplay(1),
            refCount(),
        );

        this.keyBindings.pipe(
            takeUntil(this._destroy),
        ).subscribe((bindings) => {
            this._current = bindings;
        });
    }

    public ngOnDestroy() {
        this._defaultKeyBindings.complete();
        this._destroy.next();
        this._destroy.complete();
    }

    /**
     * Update the key binding
     */
    public updateKeyBinding(commandId: string, binding: KeyBinding | null) {
        return this.userKeybindingsService.update(commandId, binding);
    }

    /**
     * Update the key binding
     */
    public resetKeyBinding(commandId: string) {
        return this.userKeybindingsService.delete(commandId);
    }

    public listen(): Subscription {
        this._loadCommands();
        const keys = new Set();

        return merge(
            fromEvent(document, "keydown").pipe(
                tap((event: KeyboardEvent) => keys.add(event.key.toLowerCase())),
                map((event: KeyboardEvent) => {
                    return { binding: new KeyBinding([...keys]), event };
                }),
                tap(({ binding, event }) => {
                    if (this.dispatch(binding, this.contextService.context)) {
                        event.preventDefault();
                    }
                }),
            ),
            fromEvent(document, "keyup").pipe(
                tap((event: KeyboardEvent) => {
                    keys.delete(event.key.toLowerCase());
                }),
            ),
            fromEvent(window, "blur").pipe(
                tap(() => keys.clear()),
            ),
        ).subscribe();
    }

    public dispatch(binding: KeyBinding, context: CommandContext): boolean {
        if (this._current.has(binding.hash)) {
            const commands = this._current.get(binding.hash)!;
            const matchingCommands = commands.filter(x => x.when == null || x.when(context));
            if (matchingCommands.length === 0) {
                return false;
            }

            if (matchingCommands.length > 1) {
                log.warn("Multiple commands founds matching the same shortcut. Picking the first one.", commands);
            }
            matchingCommands[0].execute(this.injector, context);
            return true;
        }
        return false;
    }

    private _mergeBindings(
        defaultBindings: Readonly<Map<string, KeyBinding>>,
        userBindings: UserBinding[]): Map<string, KeyBinding> {
        const bindings: Map<string, KeyBinding> = new Map(defaultBindings as any);
        for (const userBinding of userBindings) {
            if (userBinding.binding) {
                bindings.set(userBinding.commandId, userBinding.binding);
            } else {
                bindings.delete(userBinding.commandId);
            }
        }

        return bindings;
    }

    private _loadCommands() {
        const map = new Map<string, KeyBinding>();
        const commands = CommandRegistry.getCommands();
        for (const command of commands) {
            map.set(command.id, KeyBinding.parse(command.binding));
        }

        this._defaultKeyBindings.next(Object.freeze(map));
    }

    private _processBindings(bindings: Map<string, KeyBinding>): Map<string, Command[]> {
        const map = new Map<string, Command[]>();
        for (const [commandId, binding] of bindings.entries()) {
            const command = CommandRegistry.getCommand(commandId);
            if (!command) {
                log.error(`Command "${commandId}" is not found. This should not happend`);
                continue;
            }
            if (map.has(binding.hash)) {
                map.get(binding.hash)!.push(command);
            } else {
                map.set(binding.hash, [command]);
            }
        }
        return map;
    }
}

export class KeyBinding {
    public static parse(value: string): KeyBinding {
        const keys = value.replace(/ /g, "").toLowerCase().split("+");
        return new KeyBinding(keys);
    }

    public readonly mods: KeyModifier[] = [];
    public readonly keys: string[] = [];
    public readonly hash: string;
    constructor(keys: string[]) {
        const result = this._extractModifiers(keys);
        this.keys = result.keys;
        this.mods = result.mods;

        this.hash = this._createHash();
    }

    private _createHash() {
        return (this.mods as string[]).concat(this.keys).map(x => x.toLowerCase()).join("+");
    }

    private _extractModifiers(keys: string[]) {
        const otherKeys: string[] = [];
        const mods: KeyModifier[] = [];
        for (const key of keys) {
            switch (key) {
                case "shift":
                    mods.push(KeyModifier.Shift);
                    break;
                case "control":
                case "ctrl":
                    mods.push(KeyModifier.Ctrl);
                    break;
                case "alt":
                    mods.push(KeyModifier.Alt);
                    break;
                case "cmd":
                    mods.push(KeyModifier.Cmd);
                    break;
                case "cmdorctrl":
                    mods.push(KeyModifier.Ctrl); // Todo change depending on OS
                    break;
                default:
                    otherKeys.push(key);
            }
        }
        return { keys: otherKeys, mods };
    }
}
