import {
    AfterViewInit, ChangeDetectorRef, Component, ContentChildren, HostBinding, Input, QueryList, Type,
} from "@angular/core";
import { FormControl } from "@angular/forms";
import { autobind } from "core-decorators";

import { Dto } from "app/core";
import { log } from "app/utils";
import { FormBase } from "../form-base";
import { FormPageComponent } from "../form-page";
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
export class ComplexFormComponent extends FormBase implements AfterViewInit {
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

    @Input() @HostBinding("class") public size: FormSize = "large";

    @Input() @HostBinding("class.sticky-footer") public stickyFooter: boolean = true;

    @ContentChildren(FormPageComponent) public pages: QueryList<FormPageComponent>;

    public mainPage: FormPageComponent;
    public currentPage: FormPageComponent;
    public showJsonEditor = false;
    public jsonValue = new FormControl();

    private _pageStack: FormPageComponent[] = [];

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

    public get isMainWindow() {
        return this.currentPage === this.mainPage;
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

    public switchToJsonEditor() {
        if (!this.config.jsonEditor) { return; }
        this.showJsonEditor = true;
        const obj = this.config.jsonEditor.toDto(this.formGroup.value).toJS();
        this.jsonValue.setValue(JSON.stringify(obj, null, 2));
    }

    public switchToClassicForm() {
        this.showJsonEditor = true;
        if (!this.config.jsonEditor) { return; }
        console.log("JSON", this.jsonValue.value);
        const dto = new this.config.jsonEditor.dtoType(JSON.parse(this.jsonValue.value));
        const formValue = this.config.jsonEditor.fromDto(dto);
        this.formGroup.setValue(formValue);
    }

    public get saveAndCloseText() {
        return this.multiUse ? `${this.actionName} and close` : this.actionName;
    }

    /**
     * Enabled if the formGroup is valid or there is no formGroup
     */
    public get submitEnabled() {
        return !this.formGroup || this.formGroup.valid;
    }
}
