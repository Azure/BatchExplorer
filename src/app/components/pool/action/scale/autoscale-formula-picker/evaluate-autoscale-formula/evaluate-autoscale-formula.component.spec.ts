import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed, fakeAsync, tick } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { ServerError } from "@batch-flask/core";
import { ClickableComponent, ToolbarModule } from "@batch-flask/ui";
import { AutoScaleFormulaEvaluation, Pool } from "app/models";
import { PoolService } from "app/services";
import { AsyncSubject } from "rxjs";
import { click } from "test/utils/helpers";
import { EvaluateAutoScaleForumlaComponent } from "./evaluate-autoscale-formula.component";

const poolWithAutoScale = new Pool({
    id: "pool-with-autoscale",
    enableAutoScale: true,
    autoScaleFormula: "$targetDedicatedNodes=1",
});

const poolNoAutoScale = new Pool({
    id: "pool-with-autoscale",
    enableAutoScale: false,
    targetDedicatedNodes: 1,
});

const result = new AutoScaleFormulaEvaluation({
    results: [
        { name: "$targetDedicatedNodes", value: "1" },
        { name: "$targetLowPriorityNodes", value: "2" },
    ],
});

const resultWithErrors = new AutoScaleFormulaEvaluation({
    results: [],
    error: new ServerError({
        status: null,
        code: null,
        message: "Error in formula",
        details: [
            { key: "Error1", value: "Invalid line 1" },
        ],
    }),
});
@Component({
    template: `
        <bl-evaluate-autoscale-formula [formula]="formula" [pool]="pool">
        </bl-evaluate-autoscale-formula>
        `,
})
class TestComponent {
    public pool = poolWithAutoScale;
    public formula = "$targetDedicatedNodes=1;$targetLowPriorityNodes=2";
}

describe("EvaluateAutoScaleForumlaComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let de: DebugElement;
    let evaluateBtnEl: DebugElement;
    let poolServiceSpy;
    let response: AsyncSubject<AutoScaleFormulaEvaluation>;

    beforeEach(() => {
        response = new AsyncSubject();
        poolServiceSpy = {
            evaluateAutoScale: jasmine.createSpy("evaluateAutoScaleFormula").and.returnValue(response),
        };
        TestBed.configureTestingModule({
            imports: [ToolbarModule],
            declarations: [EvaluateAutoScaleForumlaComponent, TestComponent, ClickableComponent],
            providers: [
                { provide: PoolService, useValue: poolServiceSpy },
            ],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-evaluate-autoscale-formula"));
        fixture.detectChanges();

        evaluateBtnEl = de.query(By.css("bl-clickable.evaluate-btn"));
    });

    describe("when pool doesn't have autoscale enabled", () => {
        beforeEach(() => {
            testComponent.pool = poolNoAutoScale;
            fixture.detectChanges();
        });

        it("disable the evalute button", () => {
            expect(evaluateBtnEl.componentInstance.disabled).toBe(true);

            click(evaluateBtnEl);
            expect(poolServiceSpy.evaluateAutoScale).not.toHaveBeenCalled();
        });

        it("Show text explaining why evaluate is disabled", () => {
            expect(de.nativeElement.textContent)
                .toContain("Autoscale must be enabled once before being able to evaluate a formula");
        });
    });

    it("enable the evaluate button", () => {
        expect(evaluateBtnEl.componentInstance.disabled).toBe(false);
    });

    it("should not flash the button", () => {
        expect(evaluateBtnEl.classes["flash-opacity"]).toBe(false);
    });

    describe("when clicking on evaluate button", () => {
        beforeEach(() => {
            click(evaluateBtnEl);
            fixture.detectChanges();
        });

        it("should have called the service with formula", () => {
            expect(poolServiceSpy.evaluateAutoScale).toHaveBeenCalledOnce();
            expect(poolServiceSpy.evaluateAutoScale).toHaveBeenCalledWith("pool-with-autoscale", testComponent.formula);
        });

        it("should flash the button", () => {
            expect(evaluateBtnEl.classes["flash-opacity"]).toBe(true);
        });

        it("should show erros if service returns errors", fakeAsync(() => {
            response.next(resultWithErrors);
            response.complete();
            tick();
            fixture.detectChanges();
            const errors = de.query(By.css(".evaluation-error"));
            expect(errors).not.toBeFalsy();

            expect(errors.nativeElement.textContent).toContain("Error in formula");
            expect(errors.nativeElement.textContent).toContain("Error1");
            expect(errors.nativeElement.textContent).toContain("Invalid line 1");

            // Remove flash class
            expect(evaluateBtnEl.classes["flash-opacity"]).toBe(false);
        }));

        it("should results if service returns results", fakeAsync(() => {
            response.next(result);
            response.complete();
            tick();
            fixture.detectChanges();
            const results = de.queryAll(By.css(".evaluate-formula-results .result"));
            expect(results.length).toBe(2);

            expect(results[0].nativeElement.textContent).toContain("$targetDedicatedNodes");
            expect(results[0].nativeElement.textContent).toContain("1");
            expect(results[1].nativeElement.textContent).toContain("$targetLowPriorityNodes");
            expect(results[1].nativeElement.textContent).toContain("2");
        }));
    });
});
