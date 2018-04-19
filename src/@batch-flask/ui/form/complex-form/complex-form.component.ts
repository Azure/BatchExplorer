import {
    AfterViewInit, ChangeDetectorRef, Component, ContentChildren, HostBinding, Input, OnChanges, QueryList, Type,
} from "@angular/core";
import { FormControl } from "@angular/forms";
import { AsyncTask, Dto, ServerError, autobind } from "@batch-flask/core";
import { log } from "@batch-flask/utils";

import { validJsonConfig } from "@batch-flask/utils/validators";
import { Observable, Subscription } from "rxjs";
import { FormBase } from "../form-base";
import { FormPageComponent } from "../form-page";
import { FormActionConfig } from "./footer";

import "./complex-form.scss";

export type FormSize = "small" | "medium" | "large";

export interface ComplexFormConfig {
    /**
     * To enable the form to provide a json editor set this.
     * It will have an option to set entities using json
     */
    jsonEditor?: {
        dtoType: Type<Dto<any>>,
        toDto: (formValue: any) => Dto<any>;
        fromDto: (jsonObj: any) => any;
    } | false;
}

export const defaultComplexFormConfig: ComplexFormConfig = {
    jsonEditor: false,
};

@Component({
    selector: "bl-complex-form",
    templateUrl: "complex-form.html",
})
export class ComplexFormComponent extends FormBase implements AfterViewInit, OnChanges {
    /**
     * If the form should allow multi use. \
     * If true the form will have a "Save" AND a "Save and Close" button.
     * If false the form will only have a "Save" button
     */
    @Input() public multiUse = true;

    @Input() public actionName = "Save";

    @Input() public actionColor = "primary";

    @Input() public cancelText = "Close";

    @Input() public config: ComplexFormConfig = defaultComplexFormConfig;
    /**
     * If you don't want to have the footer to use a custom one
     */
    @Input() public hideFooter = false;

    @Input() public fileUri: string = null;

    /**
     * Submit method.
     * Will pass the built dto if using json forms
     * Needs to return an observable that will have a {ServerError} if failing.
     */
    @Input() public submit: (dto?: Dto<any>) => Observable<any> | null;
    @Input() public asyncTasks: Observable<AsyncTask[]>;

    @Input() @HostBinding("class") public size: FormSize = "large";

    @Input() @HostBinding("class.sticky-footer") public stickyFooter: boolean = true;

    @ContentChildren(FormPageComponent) public pages: QueryList<FormPageComponent>;

    public mainPage: FormPageComponent;
    public currentPage: FormPageComponent;
    public showJsonEditor = false;
    public jsonValue = new FormControl(null, null, validJsonConfig);
    public waitingForAsyncTask = false;
    public asyncTaskList: AsyncTask[];
    public actionConfig: FormActionConfig;

    private _pageStack: FormPageComponent[] = [];
    private _asyncTaskSub: Subscription;
    private _hasAsyncTask = false;

    constructor(private changeDetector: ChangeDetectorRef) {
        super();
    }

    public ngAfterViewInit() {
        const page = this.pages.first;
        if (!page) {
            throw new Error("Expect form to have at least 1 page. Add bl-form-page in the bl-complex-form");
        }
        this.currentPage = page;
        this.mainPage = page;
        this.changeDetector.detectChanges();
    }

    public ngOnChanges(changes) {
        if (changes.asyncTasks) {
            this._listenToAsyncTasks();
        }
        this._buildActionConfig();
    }

    @autobind()
    public save(): Observable<any> {
        let ready;
        if (this._hasAsyncTask) {
            this.waitingForAsyncTask = true;
            ready = this.asyncTasks.filter(x => [...x].length === 0).first().do(() => {
                this.waitingForAsyncTask = false;
            }).share();
        } else {
            ready = Observable.of(null);
        }
        this.loading = true;
        const obs = ready.flatMap(() => {
            const submitResult = this.submit(this.getCurrentDto());
            if(submitResult === null) {
                return Observable.of(null);
            } else {
                return submitResult;
            }
        }).shareReplay(1);
        obs.subscribe({
            next: () => {
                this.loading = false;
                this.error = null;
                this.showError = false;
            },
            error: (e: ServerError) => {
                this.loading = false;
                this.error = e;
                this.showError = true;
            },
        });
        return obs;
    }

    @autobind()
    public saveAndClose(): Observable<any> {
        const obs = this.save();
        obs.subscribe({
            complete: () => {
                setTimeout(() => {
                    this.close();
                }, 1000);
            },
            error: () => null,
        });
        return obs;
    }

    public openPage(page: FormPageComponent) {
        if (page === this.currentPage) {
            log.error("Error trying to open form page already open");
            return;
        }
        this._pageStack.push(this.currentPage);
        this.currentPage = page;
    }

    @autobind()
    public closePage() {
        const picker = this.currentPage.openedWith;
        this.currentPage = this._pageStack.pop();
        if (picker) {
            setTimeout(() => {
                picker.focus();
            });
        }
    }

    @autobind()
    public closePageOrSubmit() {
        if (this._pageStack.length === 0) {
            return this.save();
        }
        this.currentPage.submit.emit();
        this.closePage();
    }

    @autobind()
    public cancelPage() {
        this.currentPage.cancel.emit();
        this.currentPage.formGroup.reset();
        this.closePage();
    }

    public toggleJsonEditor(jsonEditor) {
        if (jsonEditor) {
            this.switchToJsonEditor();
        } else {
            this.switchToClassicForm();
        }
    }

    public switchToJsonEditor() {
        if (!this.config.jsonEditor) { return; }
        const obj = this.getCurrentDto().toJS();
        this.jsonValue.setValue(JSON.stringify(obj, null, 2));
        this.showJsonEditor = true;
    }

    public switchToClassicForm() {
        this.showJsonEditor = false;
        if (!this.config.jsonEditor) { return; }
        const dto = new this.config.jsonEditor.dtoType(JSON.parse(this.jsonValue.value));
        const formValue = this.config.jsonEditor.fromDto(dto);
        this.formGroup.patchValue(formValue);
    }

    public getCurrentDto(): Dto<any> {
        if (!this.config.jsonEditor) { return; }
        const base = this._getJsonFormDto();
        if (this.showJsonEditor) {
            return base;
        } else {
            const form = this.config.jsonEditor.toDto(this.formGroup.value);
            return base.merge(form);
        }
    }

    /**
     * There are two cases that classic form selector in footer should be disabled
     * 1. showJsonEditor variable is false which means current form is already classic form
     * 2. Current json edit JSON value is in a wrong format
     */
    public get classicFormDisabled() {
        return !this.showJsonEditor || !this.jsonValue.valid;
    }

    private _getJsonFormDto(): Dto<any> {
        if (!this.config.jsonEditor) { return; }
        const data = JSON.parse(this.jsonValue.value);
        return new this.config.jsonEditor.dtoType(data || {});
    }

    private _listenToAsyncTasks() {
        if (this._asyncTaskSub) {
            this._asyncTaskSub.unsubscribe();
            this._asyncTaskSub = null;
            this._hasAsyncTask = false;
        }
        if (this.asyncTasks) {
            this._asyncTaskSub = this.asyncTasks.subscribe((asyncTasks) => {
                this.asyncTaskList = asyncTasks;
                this._hasAsyncTask = asyncTasks.length > 0;
            });
        }
    }

    private _buildActionConfig() {
        this.actionConfig = {
            name: this.actionName,
            color: this.actionColor,
            cancel: this.cancelText,
            multiUse: this.multiUse,
        };
    }
}
