import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter,
    HostListener, Input, OnChanges, OnDestroy, Output,
} from "@angular/core";
import { FormControl } from "@angular/forms";
import { FileNavigator } from "@batch-flask/ui/file/file-navigator";
import { File } from "@batch-flask/ui/file/file.model";
import { List } from "immutable";
import { Subject } from "rxjs";
import { debounceTime, distinctUntilChanged, startWith, switchMap, takeUntil } from "rxjs/operators";

import { MatAutocompleteSelectedEvent } from "@angular/material";
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
    @Input() public path: string;
    @Output() public navigate = new EventEmitter();

    public control = new FormControl();
    public availablePaths: List<File> = List([]);

    private _destroy = new Subject();

    constructor(private changeDetector: ChangeDetectorRef) {
        this.control.valueChanges.pipe(
            startWith(""),
            distinctUntilChanged(),
            debounceTime(50),
            switchMap((search) => this._getAutocompleteOptions(search)),
            takeUntil(this._destroy),
        ).subscribe((result: List<File>) => {
            this.availablePaths = result;
            this.changeDetector.markForCheck();
        });
    }

    public ngOnChanges(changes) {
        if (changes.path) {
            this.control.setValue(this.path);
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
        }
    }

    public handleAutocompletePathSelection(event: MatAutocompleteSelectedEvent) {
        const path = event.option.value;
        this.navigate.emit(path);
    }

    private _getAutocompleteOptions(search: string) {
        return this.navigator.listFiles(search, AUTOCOMPLETE_LIMIT);
    }
}
