import { Injectable, Injector } from "@angular/core";
import { KeyModifier } from "@batch-flask/core/keys";
import { log } from "@batch-flask/utils";
import { BehaviorSubject, Observable, Subscription, fromEvent, merge } from "rxjs";
import { map, tap } from "rxjs/operators";
import { Command, CommandRegistry } from "../command-registry";
import { CommandContext, ContextService } from "../context";

@Injectable({ providedIn: "root" })
export class KeyBindingsService {
    public keyBindings: Observable<Map<string, Command[]>>;
    private _keyBindings = new BehaviorSubject(new Map<string, Command[]>());
    constructor(private contextService: ContextService, private injector: Injector) {
        this.keyBindings = this._keyBindings.asObservable();
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
        ).subscribe();
    }

    public dispatch(binding: KeyBinding, context: CommandContext): boolean {
        if (this._keyBindings.value.has(binding.hash)) {
            const commands = this._keyBindings.value.get(binding.hash)!;
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

    private _loadCommands() {
        const map = new Map<string, Command[]>();
        const commands = CommandRegistry.getCommands();
        for (const command of commands) {
            const binding = KeyBinding.parse(command.binding);
            if (map.has(binding.hash)) {
                map.get(binding.hash)!.push(command);
            } else {
                map.set(binding.hash, [command]);
            }
        }

        this._keyBindings.next(map);
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
