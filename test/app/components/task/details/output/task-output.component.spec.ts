import { Component, DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed, fakeAsync, tick } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { RouterTestingModule } from "@angular/router/testing";

import { TaskOutputsComponent } from "app/components/task/details/output";
import { Task, TaskState } from "app/models";
import { FileService, StorageService } from "app/services";
import { StorageUtils } from "app/utils";

@Component({
    template: `<bl-task-outputs [jobId]="jobId" [task]="task"></bl-task-outputs>`,
})
class TestComponent {
    public jobId: string = "job-1";
    public task = new Task({ id: "task-0", state: TaskState.active });
}

describe("TaskLogComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let component: TaskOutputsComponent;
    let de: DebugElement;
    let fakeNavigator;
    let fileServiceSpy: any;
    let storageServiceSpy: any;

    beforeEach(() => {
        fakeNavigator = {
            init: () => null,
            getFile: () => null,
        };
        spyOn(StorageUtils, "getSafeContainerName").and.callFake(x => Promise.resolve(x));
        fileServiceSpy = {
            navigateTaskFile: jasmine.createSpy("navigateTaskFile").and.returnValue(fakeNavigator),
        };

        storageServiceSpy = {
            navigateContainerBlobs: jasmine.createSpy("navigateContainerBlobs").and.returnValue(fakeNavigator),
        };

        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [
                TaskOutputsComponent, TestComponent,
            ],
            providers: [
                { provide: FileService, useValue: fileServiceSpy },
                { provide: StorageService, useValue: storageServiceSpy },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });

        fixture = TestBed.createComponent(TestComponent);
        de = fixture.debugElement;
        testComponent = fixture.componentInstance;
        component = de.query(By.css("bl-task-outputs")).componentInstance;
        fixture.detectChanges();
    });

    it("when task is active it should not start loading anything", () => {
        testComponent.task = new Task({ id: "task-1", state: TaskState.active });
        fixture.detectChanges();
        expect(component.isTaskQueued).toBe(true);
        expect(de.query(By.css("bl-file-explorer"))).toBeFalsy();
        expect(de.query(By.css(".task-queued"))).not.toBeFalsy();
        expect(fileServiceSpy.navigateTaskFile).not.toHaveBeenCalled();
        expect(storageServiceSpy.navigateContainerBlobs).not.toHaveBeenCalled();
    });

    it("when task is preparing it should not start loading anything", () => {
        testComponent.task = new Task({ id: "task-1", state: TaskState.preparing });
        fixture.detectChanges();
        expect(component.isTaskQueued).toBe(true);
        expect(de.query(By.css("bl-file-explorer"))).toBeFalsy();
        expect(de.query(By.css(".task-queued"))).not.toBeFalsy();
        expect(fileServiceSpy.navigateTaskFile).not.toHaveBeenCalled();
        expect(storageServiceSpy.navigateContainerBlobs).not.toHaveBeenCalled();
    });

    it("when task is running it should show the navigation", fakeAsync(() => {
        testComponent.task = new Task({ id: "task-1", state: TaskState.running });
        fixture.detectChanges();
        tick();
        fixture.detectChanges();
        expect(component.isTaskQueued).toBe(false);
        expect(de.query(By.css("bl-file-explorer"))).not.toBeFalsy();
        expect(de.query(By.css(".task-queued"))).toBeFalsy();

        expect(fileServiceSpy.navigateTaskFile).toHaveBeenCalledOnce();
        expect(fileServiceSpy.navigateTaskFile).toHaveBeenCalledWith("job-1", "task-1", jasmine.anything());
        expect(storageServiceSpy.navigateContainerBlobs).toHaveBeenCalledOnce();
        expect(storageServiceSpy.navigateContainerBlobs).toHaveBeenCalledWith("job-1", "task-1/", jasmine.anything());
    }));
});
