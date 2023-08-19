import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { AbstractAction } from "@azure/bonito-core/lib/action";
import { Form, StringParameter } from "@azure/bonito-core/lib/form";
import { createReactForm } from "@azure/bonito-ui";
import { getByLabelText, getByRole, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import { initMockDesktopEnvironment } from "app/environment/mock-desktop-environment";
import { ThemeService } from "app/services";
import { BehaviorSubject } from "rxjs";
import { runAxe } from "test/utils/helpers/axe-helpers";
import { ReactActionFormComponent } from "../react-action-form";
import { ReactContainerComponent } from "../react-container";

@Component({
    template: `
        <be-react-action-form
            [containerRef]="dialogRef"
            [submit]="submit"
            size="medium"
            submitText="Save it"
            title="This is a test form"
            cancelText="Cancel it"
            [action]="action">
        </be-react-action-form>
    `,
})
export class TestComponent {
    public dialogRef = {
        close: jasmine.createSpy("dialogRef.close"),
    };

    public submit = jasmine.createSpy("submit");

    public action = new SaySomethingAction();
}

describe("ReactActionFormComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let component: TestComponent;
    let formEl: DebugElement;
    let themeServiceSpy;

    beforeEach(() => {
        initMockDesktopEnvironment();

        themeServiceSpy = {
            currentTheme: new BehaviorSubject({}),
        };

        TestBed.configureTestingModule({
            imports: [],
            declarations: [ReactContainerComponent, ReactActionFormComponent, TestComponent],
            providers: [
                { provide: ThemeService, useValue: themeServiceSpy },
            ],
        });

        fixture = TestBed.createComponent(TestComponent);
        component = fixture.componentInstance;
        formEl = fixture.debugElement.query(By.css("be-react-action-form"));

        fixture.detectChanges();
    });

    it("can render, fill out, and submit a form", async () => {
        const user = userEvent.setup();
        await waitForRender();
        expect(component.action.isInitialized).toBeTrue();

        const el: HTMLElement = formEl.nativeElement;
        expect(el).toBeTruthy();
        expect(el.querySelectorAll("input").length).toEqual(2);

        const subjectInput: HTMLInputElement = getByLabelText(el, "Sentence subject");
        expect(subjectInput).toBeTruthy();

        const verbInput: HTMLInputElement = getByLabelText(el, "Sentence verb");
        expect(verbInput).toBeTruthy();

        const saveButton: HTMLElement = getByRole(el, "button", {
            name: "Save it"
        });
        expect(saveButton).toBeTruthy();

        await user.type(subjectInput, "The quick brown fox");
        expect(subjectInput.value).toBe("The quick brown fox");

        await user.type(verbInput, "jumped");
        expect(verbInput.value).toBe("jumped");

        expect(component.action.message).toBe("");

        await user.click(saveButton);
        await component.action.waitForExecution();

        expect(component.action.message).toBe("The quick brown fox jumped!");
    });

    it("should pass accessibility test", async () => {
        await waitForRender();
        expect(await runAxe(formEl.nativeElement)).toHaveNoViolations();
    });

    async function waitForRender(): Promise<void> {
        await waitFor(() => {
            expect(getByLabelText(formEl.nativeElement, "Sentence subject")).toBeTruthy();
        });
    }

});

export type SaySomethingFormValues = {
    subject?: string;
    verb?: string;
}

export class SaySomethingAction extends AbstractAction<SaySomethingFormValues> {
    actionName = "SaySomething"

    // Updated by this action execution
    message = ""

    async onInitialize(): Promise<SaySomethingFormValues> {
        return {};
    }

    buildForm(
        initialValues: SaySomethingFormValues
    ): Form<SaySomethingFormValues> {
        const form = createReactForm<SaySomethingFormValues>({
            values: initialValues
        });

        form.param("subject", StringParameter, {
            label: "Sentence subject"
        });

        form.param("verb", StringParameter, {
            label: "Sentence verb"
        });

        return form;
    }

    async onExecute(values: SaySomethingFormValues): Promise<void> {
        if (values.subject === "I") {
            throw new Error("Can't use 'I' as the subject");
        }
        this.message = `${values.subject} ${values.verb}!`;
    }
}
