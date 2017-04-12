import { AfterViewInit, ChangeDetectorRef, Component, ContentChildren, Input, QueryList } from "@angular/core";

import { log } from "app/utils";
import { FormBase } from "../form-base";
import { FormPageComponent } from "./form-page.component";

@Component({
    selector: "bl-create-form",
    templateUrl: "create-form.html",
})
export class CreateFormComponent extends FormBase implements AfterViewInit {
    @Input()
    public multiUse = true;

    @Input()
    public actionName = "Add";

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
            throw "Expect form to have at least 1 page. Add bl-form-page in the bl-create-form";
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
            return this.add();
        }
        console.log("Submit...");
        this.currentPage.submit.emit();
        this.closePage();
    }

    public cancelPage() {
        // TODO reset form input
        this.currentPage.cancel.emit();
        this.currentPage.formGroup.reset();
        this.closePage();
    }

    public add() {
        return this.performAction();
    }

    public addAndClose() {
        return this.performActionAndClose();
    }

    public get addAndCloseText() {
        return this.multiUse ? `${this.actionName} and close` : this.actionName;
    }
}
