import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { FormControl } from "@angular/forms";
import { Command, CommandRegistry, KeyBinding, KeyBindingsService } from "@batch-flask/core";
import { Subject, combineLatest } from "rxjs";
import { map, startWith, takeUntil } from "rxjs/operators";
import { TableConfig } from "../table";

import "./keybindings.scss";

interface DisplayedCommand {
    id: string;
    description: string;
    binding: string;
    isDefault: boolean;
}

interface KeyBindingFilter {
    description?: string;
    binding?: string;
}

// Match the following:
// "ctrl+c"
// "ctrl+d
// Will extract the binding(Without the quotes)
const SEARCH_BY_BINDING_REGEX = /"([^"]*)"?/i;

@Component({
    selector: "bl-keybindings",
    templateUrl: "keybindings.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KeyBindingsComponent implements OnInit, OnDestroy {
    public static breadcrumb() {
        return { name: "Key bindings" };
    }

    public displayedCommands: DisplayedCommand[] = [];
    public search = new FormControl("");
    public searchByKeyBinding = false;

    public tableConfig: TableConfig = {
        activable: false,
    };

    private _destroy = new Subject();

    @ViewChild("searchInput") private _searchEl: ElementRef;

    constructor(private keybindingService: KeyBindingsService, private changeDetector: ChangeDetectorRef) {

    }

    public ngOnInit() {
        const commandObs = this.keybindingService.keyBindings.pipe(
            map((keybindings) => this._buildCommandList(keybindings)),
        );

        const searchObs = this.search.valueChanges.pipe(
            startWith(""),
            map((query) => this._processSearch(query)),
        );
        combineLatest(
            commandObs,
            searchObs,
        ).pipe(
            map(([commands, filter]) => this._filter(commands, filter)),
            takeUntil(this._destroy),
        ).subscribe((commands) => {
            this.displayedCommands = commands;
            this.changeDetector.markForCheck();
        });
    }

    public ngOnDestroy() {
        this._destroy.next();
        this._destroy.complete();
    }

    public toggleKeybindingSearch() {
        this.searchByKeyBinding = !this.searchByKeyBinding;
        this.changeDetector.markForCheck();

        if (this.searchByKeyBinding) {
            this._searchEl.nativeElement.focus();
        }
    }

    public updateFilterWithKeyBinding(binding: KeyBinding | null) {
        if (binding == null) {
            this.searchByKeyBinding = false;
            this.changeDetector.markForCheck();
        } else {
            if (binding.hash === "") {
                this.search.setValue("");
            } else {
                this.search.setValue(`"${binding.hash}"`);
            }
        }
    }

    private _buildCommandList(keybindings: Map<string, Command[]>): DisplayedCommand[] {
        const commands = CommandRegistry.getCommands();
        const commandBindings = new Map<string, string>();
        for (const [key, commands] of keybindings.entries()) {
            for (const command of commands) {
                commandBindings.set(command.id, key);
            }
        }
        return commands.map((command) => {
            const binding = commandBindings.get(command.id);
            return {
                id: command.id,
                description: command.description,
                binding: binding,
                isDefault: binding === command.binding,
            };
        });
    }

    private _processSearch(query: string): KeyBindingFilter {
        const trimed = query.trim();
        const match = SEARCH_BY_BINDING_REGEX.exec(trimed);
        if (match) {
            return {
                binding: KeyBinding.parse(match[1]).hash,
            };
        }
        return {
            description: query.toLowerCase(),
        };
    }

    private _filter(commands: DisplayedCommand[], filter: KeyBindingFilter): DisplayedCommand[] {
        return commands.filter((command) => {
            if (filter.description && filter.description !== "") {
                if (!command.description.toLowerCase().includes(filter.description)) {
                    return false;
                }
            }
            if (filter.binding && !command.binding.includes(filter.binding)) {
                return false;

            }

            return true;
        });
    }
}
