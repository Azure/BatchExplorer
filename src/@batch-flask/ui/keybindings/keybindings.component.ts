import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild,
} from "@angular/core";
import { FormControl } from "@angular/forms";
import { Command, CommandRegistry, KeyBinding, KeyBindingsService } from "@batch-flask/core";
import { SanitizedError } from "@batch-flask/utils";
import { Subject, combineLatest } from "rxjs";
import { map, startWith, takeUntil } from "rxjs/operators";
import { DialogService } from "../dialogs";
import { TableConfig } from "../table";
import { KeyBindingPickerDialogComponent } from "./keybinding-picker";

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
        activable: true,
    };

    public activeItem = null;

    private _destroy = new Subject();

    @ViewChild("searchInput", { static: false }) private _searchEl: ElementRef;

    constructor(
        private keybindingService: KeyBindingsService,
        private dialogService: DialogService,
        private changeDetector: ChangeDetectorRef) {

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

    public editKeyBinding(commandId: string | null) {
        this.activeItem = commandId;
        this.changeDetector.markForCheck();
        if (!commandId) { return; }

        const command = CommandRegistry.getCommand(commandId);
        if (!command) {
            throw new SanitizedError(`Unkown command "${commandId}". This should not have happened`);
        }
        const ref = this.dialogService.open(KeyBindingPickerDialogComponent);
        ref.componentInstance.command = command;
        ref.afterClosed().subscribe((binding: KeyBinding | null) => {
            if (binding) {
                this.keybindingService.updateKeyBinding(commandId, binding).subscribe();
            }

            this.activeItem = null;
            this.changeDetector.markForCheck();
        });
    }

    public removeUserBinding(commandId: string) {
        this.keybindingService.resetKeyBinding(commandId).subscribe();
    }

    public toggleKeybindingSearch() {
        this.searchByKeyBinding = !this.searchByKeyBinding;
        this.changeDetector.markForCheck();

        setTimeout(() => {
            if (this.searchByKeyBinding) {
                this._searchEl.nativeElement.focus();
            }
        });
    }

    public updateFilterWithKeyBinding(binding: KeyBinding | null) {
        if (binding == null) {
            this.searchByKeyBinding = false;
            this.search.setValue("");
            this.changeDetector.markForCheck();
        } else {
            if (binding.hash === "") {
                this.search.setValue("");
            } else {
                this.search.setValue(`"${binding.hash}"`);
            }
        }
    }

    private _buildCommandList(keybindings: Readonly<Map<string, Command[]>>): DisplayedCommand[] {
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
