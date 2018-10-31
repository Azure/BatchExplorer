import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter,
    HostListener, Input, OnChanges, OnDestroy, Output, ViewChild,
} from "@angular/core";
import { FormControl } from "@angular/forms";
import { FileNavigator } from "@batch-flask/ui/file/file-navigator";
import { File } from "@batch-flask/ui/file/file.model";
import { List } from "immutable";
import { Subject } from "rxjs";
import { debounceTime, distinctUntilChanged, startWith, switchMap, takeUntil, tap } from "rxjs/operators";

import { MatAutocomplete, MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from "@angular/material";
import { KeyCode } from "@batch-flask/core/keys";
import "./file-path-navigator.scss";

const AUTOCOMPLETE_LIMIT = 5;

@Component({
    selector: "bl-file-path-navigator",
    templateUrl: "file-path-navigator.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilePathNavigatorComponent implements OnChanges, OnDestroy {
    @Input() public navigator: FileNavigator;

    /**
     * Name of the file navigator
     */
    @Input() public name: string;

    /**
     * Current path
     */
    @Input() public path: string;

    /**
     * Emit when the user should navigate somewhere
     */
    @Output() public navigate = new EventEmitter();

    public control = new FormControl("");
    public availablePaths: List<File> = List([]);

    @ViewChild(MatAutocompleteTrigger) public _autocomplete: MatAutocompleteTrigger;

    private _destroy = new Subject();

    constructor(private changeDetector: ChangeDetectorRef) {
        this.control.valueChanges.subscribe(x => console.log("Changed>", x));
        this.control.valueChanges.pipe(
            startWith(""),
            // tap(x => console.log("new value", x)),
            distinctUntilChanged(),
            debounceTime(50),
            switchMap(search => this._getAutocompleteOptions(search)),
            takeUntil(this._destroy),
        ).subscribe((result: List<File>) => {
            this.availablePaths = result;
            this.changeDetector.markForCheck();
        });
    }

    public ngOnChanges(changes) {
        if (changes.path) {
            this.control.patchValue(this.path);
        }
    }

    public ngOnDestroy() {
        this._destroy.next();
        this._destroy.complete();
    }

    @HostListener("keydown", ["$event"])
    public handleUserPathSelection(event: KeyboardEvent) {
        if (event.code === KeyCode.Enter) {
            this.navigate.emit(this.control.value);
        } else if (event.code === KeyCode.ArrowRight && !event.shiftKey) {
            // If pressing arrow right(but not using any modified key update the input with the current selected option)
            const option = this._autocomplete.activeOption;
            if (option) {
                this.control.patchValue(option.value);
            }
        }
    }

    public handleAutocompletePathSelection(event: MatAutocompleteSelectedEvent) {
        const path = event.option.value;
        this.navigate.emit(path);
    }

    public trackPath(_, path: File) {
        return path.url;
    }

    private _getAutocompleteOptions(search: string) {
        console.log("Kiad oath", search);
        return this.navigator.listFiles(search, AUTOCOMPLETE_LIMIT);
    }
}
