import { AfterViewInit, ChangeDetectorRef, Component, ContentChildren, Input, QueryList } from "@angular/core";

import { log } from "app/utils";
import { FormBase } from "../form-base";
import { FormPageComponent } from "../form-page";

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
    @Input()
    public multiUse = true;

    @Input()
    public actionName = "Save";

    @ContentChildren(FormPageComponent)
    public pages: QueryList<FormPageComponent>;

    public mainPage: FormPageComponent;
    public currentPage: FormPageComponent;

    private _pageStack: FormPageComponent[] = [];

    constructor(private changeDetector: ChangeDetectorRef) {
        super();
    }

    public ngAfterViewInit() {
        const page = this.pages.first;
        if (!page) {
            throw "Expect form to have at least 1 page. Add bl-form-page in the bl-complex-form";
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

    public closePage() {
        const picker = this.currentPage.openedWith;
        this.currentPage = this._pageStack.pop();
        if (picker) {
            setTimeout(() => {
                picker.focus();
            });
        }
    }

    public closePageOrSubmit() {
        if (this._pageStack.length === 0) {
            return this.save();
        }
        this.currentPage.submit.emit();
        this.closePage();
    }

    public cancelPage() {
        this.currentPage.cancel.emit();
        this.currentPage.formGroup.reset();
        this.closePage();
    }

    public get addAndCloseText() {
        return this.multiUse ? `${this.actionName} and close` : this.actionName;
    }
}
