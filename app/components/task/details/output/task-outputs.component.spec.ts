import { Component, DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed, fakeAsync, tick } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { RouterTestingModule } from "@angular/router/testing";

import { FileSource } from "app/components/file/browse/file-explorer";
import { TaskOutputsComponent } from "app/components/task/details/output";
import { File, Task, TaskState } from "app/models";
import { FileService } from "app/services";
import { DataCache } from "app/services/core";
import { FileNavigator } from "app/services/file";
import { AutoStorageService, ListBlobParams, NavigateBlobsOptions, StorageBlobService } from "app/services/storage";
import { StorageUtils } from "app/utils";
import * as Fixtures from "test/fixture";
import { MockStorageListGetter } from "test/utils/mocks";

@Component({
    template: `<bl-task-outputs [jobId]="jobId" [task]="task"></bl-task-outputs>`,
})
class TestComponent {
    public jobId: string = "job-1";
    public task = new Task({ id: "task-0", state: TaskState.active });
}

describe("TaskOutputsComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let component: TaskOutputsComponent;
    let de: DebugElement;

    let fileServiceSpy: any;
    let storageServiceSpy: any;
    let mockBlobGetter: any;
    let cache: DataCache<File>;

    beforeEach(() => {
        cache = new DataCache<File>("url");
        mockBlobGetter = new MockStorageListGetter(File, {
            cache: (params) => cache,
            getData: (params: ListBlobParams, options) => {
                if (params.container === "job-1") {
                    return Promise.resolve({
                        data: [
                            Fixtures.file.create({ name: "job.json", url: "C:\job.json" }),
                            Fixtures.file.create({ name: "pool.json", url: "C:\pool.json" }),
                        ],
                    });
                } else if (params.container === "no-container") {
                    return Promise.reject({
                        statusCode: 404,
                        code: "ContainerNotFound",
                    });
                } else {
                    return Promise.reject({
                        statusCode: 500,
                        code: "SomethingNotExpected",
                    });
                }
            },
        });

        spyOn(StorageUtils, "getSafeContainerName").and.callFake(x => Promise.resolve(x));

        fileServiceSpy = {
            navigateTaskFile: jasmine.createSpy("navigateTaskFile").and.returnValue({
                init: () => null,
                getFile: () => null,
                dispose: () => null,
            }),
        };

        storageServiceSpy = {
            navigateContainerBlobs: jasmine
                .createSpy("navigateContainerBlobs")
                .and.callFake((container: string, prefix: string, options: NavigateBlobsOptions) => {
                return new FileNavigator({
                    cache: null,
                    basePath: prefix,
                    params: { container },
                    getter: mockBlobGetter,
                    getFile: (filename: string) => null,
                    onError: options.onError,
                });
            }),
        };

        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [
                TaskOutputsComponent, TestComponent,
            ],
            providers: [
                { provide: FileService, useValue: fileServiceSpy },
                { provide: StorageBlobService, useValue: storageServiceSpy },
                { provide: AutoStorageService, useValue: {} },
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
        expect(storageServiceSpy.navigateContainerBlobs).toHaveBeenCalledWith("job-1", "task-1", jasmine.anything());
    }));

    it("running task should have 2 workspace sources", fakeAsync(() => {
        testComponent.task = new Task({ id: "task-1", state: TaskState.running });
        fixture.detectChanges();
        tick();

        fixture.detectChanges();
        expect(component.workspace.sources.length).toBe(2);
    }));

    it("when storage call returns 404 we remove the workspace source", fakeAsync(() => {
        testComponent.jobId = "no-container";
        testComponent.task = new Task({ id: "task-1", state: TaskState.running });
        fixture.detectChanges();
        tick();

        fixture.detectChanges();
        expect(component.workspace.sources.length).toBe(1);
    }));

    it("when storage call returns any other error we leave the source as is", fakeAsync(() => {
        testComponent.jobId = "banana";
        testComponent.task = new Task({ id: "task-1", state: TaskState.running });
        fixture.detectChanges();
        tick();

        fixture.detectChanges();
        expect(component.workspace.sources.length).toBe(2);
        const index = component.workspace.sources.findIndex((source: FileSource) => {
            return source.name === "Persisted output";
        });
        expect(index).toBeGreaterThan(-1);
        expect(component.workspace.sources[index].navigator.error.code).toBe("SomethingNotExpected");
    }));
});
