import { Component, DebugElement, Input, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed, fakeAsync, tick } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import {
    I18nTestingModule, MockControlValueAccessorComponent, controlValueAccessorProvider,
} from "@batch-flask/core/testing";
import { SidebarRef } from "@batch-flask/ui";
import { Pool, PoolAllocationState } from "app/models";
import { NodeDeallocationOption, PoolEnableAutoScaleDto, PoolResizeDto } from "app/models/dtos";
import { PoolService } from "app/services";
import { Duration } from "luxon";
import { BehaviorSubject, of } from "rxjs";
import { NotificationServiceMock } from "test/utils/mocks";
import { PoolScaleSelection } from "../scale";
import { PoolResizeDialogComponent } from "./pool-resize-dialog.component";

@Component({
    selector: "bl-pool-scale-picker", template: "",
    providers: [controlValueAccessorProvider(() => FakeScalePickerComponent)],
})
class FakeScalePickerComponent extends MockControlValueAccessorComponent<PoolScaleSelection> {
    @Input() public pool: Pool;

}

@Component({
    selector: "bl-deallocation-option-picker", template: "",
    providers: [controlValueAccessorProvider(() => FakeDealocationOptionPickerComponent)],
})
class FakeDealocationOptionPickerComponent extends MockControlValueAccessorComponent<any> {

}

describe("PoolResizeDialog", () => {
    let fixture: ComponentFixture<PoolResizeDialogComponent>;
    let de: DebugElement;
    let component: PoolResizeDialogComponent;
    let scalePicker: FakeScalePickerComponent;
    let poolServiceSpy;
    let currentPool: BehaviorSubject<Pool>;
    let notificationServiceSpy: NotificationServiceMock;

    beforeEach(() => {
        currentPool = new BehaviorSubject(null);
        poolServiceSpy = {
            get: jasmine.createSpy("get").and.returnValue(currentPool),
            resize: jasmine.createSpy("resize").and.returnValue(of(null)),
            enableAutoScale: jasmine.createSpy("enableAutoScale").and.returnValue(of(null)),
            disableAutoScale: jasmine.createSpy("disableAutoScale").and.returnValue(of(null)),
        };
        notificationServiceSpy = new NotificationServiceMock();

        TestBed.configureTestingModule({
            imports: [ReactiveFormsModule, FormsModule, I18nTestingModule],
            declarations: [PoolResizeDialogComponent, FakeScalePickerComponent, FakeDealocationOptionPickerComponent],
            providers: [
                { provide: SidebarRef, useValue: null },
                { provide: PoolService, useValue: poolServiceSpy },
                notificationServiceSpy.asProvider(),
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });
        fixture = TestBed.createComponent(PoolResizeDialogComponent);
        de = fixture.debugElement;
        component = fixture.componentInstance;
        component.pool = new Pool({});
        fixture.detectChanges();
        scalePicker = de.query(By.css("bl-pool-scale-picker")).componentInstance;
    });

    describe("when pool is in fixed mode", () => {
        beforeEach(() => {
            component.pool = new Pool({
                id: "fixed-pool-1",
                enableAutoScale: false,
                currentDedicatedNodes: 4,
                targetDedicatedNodes: 5,
                currentLowPriorityNodes: 3,
                targetLowPriorityNodes: 2,
            });
            currentPool.next(component.pool);
        });

        it("preset the inputs with the pool value", () => {
            expect(scalePicker.value).toEqual({
                enableAutoScale: false,
                targetDedicatedNodes: 5,
                targetLowPriorityNodes: 2,
                autoScaleFormula: null,
                autoScaleEvaluationInterval: null,
            });
        });

        it("update the control when updating the scale", () => {
            scalePicker.updateValue({
                enableAutoScale: false,
                targetDedicatedNodes: 3,
                targetLowPriorityNodes: 8,
            });

            expect(component.form.value.scale).toEqual({
                enableAutoScale: false,
                targetDedicatedNodes: 3,
                targetLowPriorityNodes: 8,
            });
        });

        it("submit and update the fixed value", () => {
            scalePicker.updateValue({
                enableAutoScale: false,
                targetDedicatedNodes: 3,
                targetLowPriorityNodes: 8,
            });
            component.submit();

            expect(poolServiceSpy.enableAutoScale).not.toHaveBeenCalled();
            expect(poolServiceSpy.resize).toHaveBeenCalledOnce();
            expect(poolServiceSpy.resize).toHaveBeenCalledWith("fixed-pool-1", new PoolResizeDto({
                targetDedicatedNodes: 3,
                targetLowPriorityNodes: 8,
                nodeDeallocationOption: NodeDeallocationOption.requeue,
            }));
            expect(poolServiceSpy.get).toHaveBeenCalledOnce();
            expect(notificationServiceSpy.success).toHaveBeenCalledOnce();
        });

        it("submit and update to autoscale", () => {
            scalePicker.updateValue({
                enableAutoScale: true,
                autoScaleFormula: "$target = 5;",
                autoScaleEvaluationInterval: Duration.fromISO("PT40M"),
            });
            component.submit();
            expect(poolServiceSpy.resize).not.toHaveBeenCalled();
            expect(poolServiceSpy.enableAutoScale).toHaveBeenCalledOnce();
            expect(poolServiceSpy.enableAutoScale).toHaveBeenCalledWith("fixed-pool-1", new PoolEnableAutoScaleDto({
                autoScaleFormula: "$target = 5;",
                autoScaleEvaluationInterval: Duration.fromISO("PT40M"),
            }));
            expect(poolServiceSpy.get).toHaveBeenCalledOnce();
            expect(notificationServiceSpy.success).toHaveBeenCalledOnce();
        });
    });

    describe("when pool is in autoscale mode", () => {
        beforeEach(() => {
            component.pool = new Pool({
                id: "auto-pool-1",
                enableAutoScale: true,
                autoScaleFormula: "$target = 5;",
            });
            currentPool.next(component.pool);
        });

        it("preset the inputs with the pool value", () => {
            expect(scalePicker.value).toEqual({
                enableAutoScale: true,
                autoScaleFormula: "$target = 5;",
                targetDedicatedNodes: 0,
                targetLowPriorityNodes: 0,
                autoScaleEvaluationInterval: null,
            });
        });

        it("update the control when updating the scale", () => {
            scalePicker.updateValue({
                enableAutoScale: false,
                autoScaleFormula: "$target = 21;",
                autoScaleEvaluationInterval: Duration.fromISO("PT40M"),
            });

            expect(component.form.value.scale).toEqual({
                enableAutoScale: false,
                autoScaleFormula: "$target = 21;",
                autoScaleEvaluationInterval: Duration.fromISO("PT40M"),
            });
        });

        it("submit and update to autoscale", () => {
            scalePicker.updateValue({
                enableAutoScale: true,
                autoScaleFormula: "$target = 21;",
                autoScaleEvaluationInterval: Duration.fromISO("PT40M"),
            });
            component.submit();
            expect(poolServiceSpy.resize).not.toHaveBeenCalled();
            expect(poolServiceSpy.enableAutoScale).toHaveBeenCalledOnce();
            expect(poolServiceSpy.enableAutoScale).toHaveBeenCalledWith("auto-pool-1", new PoolEnableAutoScaleDto({
                autoScaleFormula: "$target = 21;",
                autoScaleEvaluationInterval: Duration.fromISO("PT40M"),
            }));
            expect(poolServiceSpy.get).toHaveBeenCalledOnce();
            expect(notificationServiceSpy.success).toHaveBeenCalledOnce();
        });

        it("submit and switch to fixed value", fakeAsync(() => {
            scalePicker.updateValue({
                enableAutoScale: false,
                targetDedicatedNodes: 3,
                targetLowPriorityNodes: 8,
            });

            currentPool.next(new Pool({
                id: "auto-pool-1",
                allocationState: PoolAllocationState.resizing,
                enableAutoScale: true,
            }));

            component.submit();

            expect(poolServiceSpy.enableAutoScale).not.toHaveBeenCalled();
            expect(poolServiceSpy.disableAutoScale).toHaveBeenCalledOnce();

            // Not called yet
            expect(poolServiceSpy.resize).not.toHaveBeenCalled();
            expect(poolServiceSpy.get).toHaveBeenCalledTimes(0);
            tick(1000);
            expect(poolServiceSpy.resize).not.toHaveBeenCalled();
            expect(poolServiceSpy.get).toHaveBeenCalledTimes(1);
            tick(1000);
            expect(poolServiceSpy.resize).not.toHaveBeenCalled();
            expect(poolServiceSpy.get).toHaveBeenCalledTimes(2);

            currentPool.next(new Pool({
                id: "auto-pool-1",
                allocationState: PoolAllocationState.steady,
                enableAutoScale: false,
            }));

            tick(1000);

            expect(poolServiceSpy.resize).toHaveBeenCalledWith("auto-pool-1", new PoolResizeDto({
                targetDedicatedNodes: 3,
                targetLowPriorityNodes: 8,
                nodeDeallocationOption: NodeDeallocationOption.requeue,
            }));
            expect(poolServiceSpy.get).toHaveBeenCalledTimes(3);
            expect(notificationServiceSpy.success).toHaveBeenCalledOnce();
        }));
    });
});
