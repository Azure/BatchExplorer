import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter,
    HostListener, Input, OnChanges, OnDestroy, Output,
} from "@angular/core";
import { FormControl } from "@angular/forms";
import { FileNavigator } from "@batch-flask/ui/file/file-navigator";
import { File } from "@batch-flask/ui/file/file.model";
import { List } from "immutable";
import { Subject } from "rxjs";
import { debounceTime, distinctUntilChanged, startWith, takeUntil } from "rxjs/operators";

import "./file-path-navigator.scss";

@Component({
    selector: "bl-file-path-navigator",
    templateUrl: "file-path-navigator.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilePathNavigatorComponent implements OnChanges, OnDestroy {
    @Input() public navigator: FileNavigator;
    @Input() public path: string;
    @Output() public pathChanges = new EventEmitter();

    public control = new FormControl();
    public availablePaths: List<File> = List([]);

    private _destroy = new Subject();

    constructor(private changeDetector: ChangeDetectorRef) {
        this.control.valueChanges.pipe(
            startWith(""),
            distinctUntilChanged(),
            debounceTime(400),
            takeUntil(this._destroy),
        ).subscribe((search: string) => {
            this.updateAvailablePaths(search);
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

    public updateAvailablePaths(search: string) {
        this.navigator.listAllFiles(search).subscribe((result) => {
            console.log("Result", result);
            this.availablePaths = result;
        });
    }

    @HostListener("select", ["$event"])
    public stopSelectPropagation(event: Event) {
        event.stopPropagation();
    }
}
