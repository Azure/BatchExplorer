import { Component, DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule, By } from "@angular/platform-browser";
import { ClickableComponent, DialogService } from "@batch-flask/ui";
import { EditorMockComponent, EditorTestingModule } from "@batch-flask/ui/testing";
import { AutoscaleFormula } from "app/models";
import { AutoscaleFormulaService, PredefinedFormulaService } from "app/services";
import { List } from "immutable";
import { BehaviorSubject } from "rxjs";
import { click } from "test/utils/helpers";
import { AutoscaleFormulaPickerComponent } from "./autoscale-formula-picker.component";

const predefinedFormulas = [
    new AutoscaleFormula({ id: "f-1", name: "Target 4", value: "$targedDedicatedNodes=4" }),
    new AutoscaleFormula({ id: "f-2", name: "Target 6", value: "$targedDedicatedNodes=6" }),
    new AutoscaleFormula({ id: "f-9", name: "Target 9", value: "$targedDedicatedNodes=9" }),
];

@Component({
    template: `<bl-autoscale-formula-picker [formControl]="formula"></bl-autoscale-formula-picker>`,
})
class TestComponent {
    public formula = new FormControl("");
}

describe("AutoscaleFormulaPickerComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let component: AutoscaleFormulaPickerComponent;
    let de: DebugElement;
    let editorComponent: EditorMockComponent;

    let autoScaleForumlaServiceSpy;
    let predefinedForumlaServiceSpy;
    let dialogServiceSpy;

    beforeEach(() => {
        autoScaleForumlaServiceSpy = {
            formulas: new BehaviorSubject(List([predefinedFormulas[2]])),
            saveFormula: jasmine.createSpy("saveFormula"),
            deleteFormula: jasmine.createSpy("deleteFormula"),
        };

        predefinedForumlaServiceSpy = {
            predefinedFormulas: new BehaviorSubject(List(predefinedFormulas)),
        };

        dialogServiceSpy = {
            prompt: (name, { prompt }) => {
                prompt("some-name");
            },
        };

        TestBed.configureTestingModule({
            imports: [BrowserModule, FormsModule, ReactiveFormsModule, EditorTestingModule],
            declarations: [AutoscaleFormulaPickerComponent, TestComponent, ClickableComponent],
            providers: [
                { provide: AutoscaleFormulaService, useValue: autoScaleForumlaServiceSpy },
                { provide: PredefinedFormulaService, useValue: predefinedForumlaServiceSpy },
                { provide: DialogService, useValue: dialogServiceSpy },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-autoscale-formula-picker"));
        editorComponent = de.query(By.css("bl-editor")).componentInstance;
        component = de.componentInstance;
        fixture.detectChanges();
    });

    it("list predefined forumulas", () => {
        const formulas = de.queryAll(By.css(".predefined-formulas .formula"));
        expect(formulas.length).toBe(3);

        expect(formulas[0].nativeElement.textContent).toContain("Target 4");
        expect(formulas[1].nativeElement.textContent).toContain("Target 6");
        expect(formulas[2].nativeElement.textContent).toContain("Target 9");
    });

    it("update current formula when clicking on predefined formula", async () => {
        const formulas = de.queryAll(By.css(".predefined-formulas .formula"));
        expect(formulas.length).toBe(3);

        click(formulas[1]);
        fixture.detectChanges();
        await fixture.whenStable();
        expect(component.autoscaleFormulaValue).toEqual(predefinedFormulas[1].value, "Updated formula value");
        expect(editorComponent.value).toEqual(predefinedFormulas[1].value, "Updated editor value");
        expect(testComponent.formula.value).toEqual(predefinedFormulas[1].value, "Updated parent form control");
    });

    it("shows saved formulas", () => {
        const formulas = de.queryAll(By.css(".saved-formulas .formula"));
        expect(formulas.length).toBe(1);

        expect(formulas[0].nativeElement.textContent).toContain("Target 9");
    });

    it("update current formula when clicking on saved formula", async () => {
        const formulas = de.queryAll(By.css(".saved-formulas .formula"));
        expect(formulas.length).toBe(1);

        click(formulas[0]);
        fixture.detectChanges();
        await fixture.whenStable();

        expect(component.autoscaleFormulaValue).toEqual(predefinedFormulas[2].value, "Updated formula value");
        expect(editorComponent.value).toEqual(predefinedFormulas[2].value, "Updated editor value");
        expect(testComponent.formula.value).toEqual(predefinedFormulas[2].value, "Updated parent form control");
    });

    it("updates the formula when form control change", async () => {
        const formula = "$some3";
        testComponent.formula.setValue(formula);
        fixture.detectChanges();
        await fixture.whenStable();

        expect(component.autoscaleFormulaValue).toEqual(formula);
        expect(editorComponent.value).toEqual(formula, "Updated editor value");
    });

    it("save a formula", () => {
        const formula = "$some3";
        testComponent.formula.setValue(formula);
        fixture.detectChanges();

        const saveBtn = de.query(By.css(".save-btn"));
        click(saveBtn);

        expect(autoScaleForumlaServiceSpy.saveFormula).toHaveBeenCalledOnce();
        const args = autoScaleForumlaServiceSpy.saveFormula.calls.argsFor(0);
        expect(args.length).toBe(1);
        expect(args[0] instanceof AutoscaleFormula).toBe(true);
        expect(args[0].name).toBe("some-name");
        expect(args[0].value).toBe(formula);
    });

    it("delete a saved formula", () => {
        const formulas = de.queryAll(By.css(".saved-formulas .formula"));
        expect(formulas.length).toBe(1);

        const deleteBtn = formulas[0].query(By.css(".delete-btn"));
        click(deleteBtn);

        expect(autoScaleForumlaServiceSpy.deleteFormula).toHaveBeenCalledOnce();
        expect(autoScaleForumlaServiceSpy.deleteFormula).toHaveBeenCalledWith(predefinedFormulas[2]);
    });
});
