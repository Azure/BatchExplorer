import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MdAutocomplete } from "@angular/material";
import { By } from "@angular/platform-browser";
import { RouterTestingModule } from "@angular/router/testing";
// import { List } from "immutable";
// import { Observable } from "rxjs";

import { TaskLogComponent } from "app/components/task/details/output";
import { File } from "app/models";
import { FileService } from "app/services";
import * as Fixtures from "test/fixture";
import { RxMockEntityProxy, RxMockListProxy } from "test/utils/mocks";

const fileSizeMap: Map<string, number> = new Map()
    .set("stdout.txt", 10)
    .set("stderr.txt", 20)
    .set("1.txt", 30)
    .set("2.txt", 40);

fdescribe("TaskDependenciesComponent", () => {
    let fixture: ComponentFixture<TaskLogComponent>;
    let component: TaskLogComponent;

    let fileListProxy: RxMockListProxy<any, File>;
    let fileServiceSpy: any;

    beforeEach(() => {
        fileListProxy = new RxMockListProxy(File, {
            cacheKey: "name",
            items: [
                Fixtures.file.create({ name: "stdout.txt" }),
                Fixtures.file.create({ name: "stderr.txt" }),
                Fixtures.file.create({ name: "1.txt" }),
                Fixtures.file.create({ name: "2.txt" }),
            ],
        });

        fileServiceSpy = {
            listFromTask: (jobid: string, taskId: string, recursive?: boolean, options?: any) => fileListProxy,

            getFilePropertiesFromTask: (jobid: string, taskId: string, filename: string) =>
                new RxMockEntityProxy<any, File>(File, {
                    cacheKey: "name",
                    item: Fixtures.file.create({
                        name: filename,
                        properties: { contentLength: fileSizeMap.get(filename) || 100 },
                    }),
                }),
        };

        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [
                MdAutocomplete, TaskLogComponent,
            ],
            providers: [
                { provide: FileService, useValue: fileServiceSpy },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });

        fixture = TestBed.createComponent(TaskLogComponent);
        component = fixture.componentInstance;
        component.jobId = "bobs-job-1";
        component.task = Fixtures.task.create({ id: "bobs-task" });
        fixture.detectChanges();
    });

    describe("on initial default load", () => {
        it("initial ui state is correct", () => {
            expect(component.jobId).toBe("bobs-job-1");
            expect(component.outputFileNames.length).toBe(2);
            expect(component.selectedOutputFile).toBe("stdout.txt");
            expect(Object.keys(component.fileSizes).length).toBe(0);
            expect(component.filterControl.value).toBeNull();
            expect(component.addingFile).toBeFalsy();

            const anyComponent = component as any;
            expect(anyComponent._currentTaskId).toBeNull();
            expect(anyComponent._refreshInterval).toBe(5000);
        });

        it("shows default tabs", () => {
            const container = fixture.debugElement.query(By.css(".file-tabs"));
            expect(container.nativeElement.textContent).toContain("stdout.txt ( - B)");
            expect(container.nativeElement.textContent).toContain("stderr.txt ( - B)");
            expect(container).toBeVisible();
        });

        it("shows default add file tab", () => {
            const container = fixture.debugElement.query(By.css(".file-tab-more"));
            expect(container).toBeVisible();
        });

        it("reset tabs button not shown", () => {
            const container = fixture.debugElement.query(By.css("div[title=\"Reset to default\"]"));
            expect(container).toBeNull();
        });
    });

    describe("when task depends on taskId array only", () => {
        beforeEach(() => {
            component.ngOnChanges({ jobId: component.jobId, task: component.task });
            fixture.detectChanges();
        });

        // todo: do these need to be asyncy

        it("current task id set", () => {
            const anyComponent = component as any;
            expect(anyComponent._currentTaskId).toBe("bobs-task");
        });

        it("has loaded file sizes", () => {
            expect(Object.keys(component.fileSizes).length).toBe(2);
            expect(component.fileSizes["stdout.txt"]).toBe("10 B");
            expect(component.fileSizes["stderr.txt"]).toBe("20 B");
        });

        it("ui shows file sizes", () => {
            const container = fixture.debugElement.query(By.css(".file-tabs"));
            expect(container.nativeElement.textContent).toContain("stdout.txt (10 B)");
            expect(container.nativeElement.textContent).toContain("stderr.txt (20 B)");
        });
    });

    // describe("when task depends on taskIdRanges array only", () => {
    //     beforeEach(() => {
    //         component.task = new Task({
    //             id: "2001",
    //             state: TaskState.completed,
    //             dependsOn: {
    //                 taskIdRanges: [{ start: 1, end: 5 }, { start: 10, end: 12 }],
    //             },
    //         });

    //         fixture.detectChanges();
    //     });

    //     it("shoud have 8 dependent task id's", () => {
    //         expect(component.dependentIds.length).toBe(8);
    //         expect(component.dependencies.value.length).toBe(8);
    //     });

    //     it("should not show load more", () => {
    //         expect(component.hasMore).toBe(false);
    //     });
    // });

    // describe("when task depends on both taskId and taskIdRanges arrays", () => {
    //     beforeEach(() => {
    //         component.task = new Task({
    //             id: "2001",
    //             state: TaskState.completed,
    //             dependsOn: {
    //                 taskIds: ["1"],
    //                 taskIdRanges: [{ start: 1, end: 5 }],
    //             },
    //         });

    //         fixture.detectChanges();
    //     });

    //     it("shoud have 6 dependent task id's", () => {
    //         expect(component.dependentIds.length).toBe(6);
    //         expect(component.dependencies.value.length).toBe(6);
    //     });

    //     it("should not show load more", () => {
    //         expect(component.hasMore).toBe(false);
    //     });
    // });

    // describe("more than 20 dependencies enables load more", () => {
    //     beforeEach(() => {
    //         component.task = new Task({
    //             id: "2001",
    //             state: TaskState.completed,
    //             dependsOn: {
    //                 taskIdRanges: [{ start: 1, end: 25 }],
    //             },
    //         });

    //         fixture.detectChanges();
    //     });

    //     it("should enable load more button", () => {
    //         expect(component.hasMore).toBe(true);
    //     });
    // });

    // describe("correctly decorates dependsOn of returned dependency", () => {
    //     beforeEach(() => {
    //         component.task = new Task({
    //             id: "2001",
    //             state: TaskState.completed,
    //             dependsOn: {
    //                 taskIds: ["1", "2", "3"],
    //             },
    //         });

    //         fixture.detectChanges();
    //     });

    //     it("shoud have 3 dependencies", () => {
    //         expect(component.dependentIds.length).toBe(3);
    //         expect(component.dependencies.value.length).toBe(3);
    //     });

    //     it("dependsOn property is correct", () => {
    //         const dependencies = component.dependencies.value;
    //         expect(dependencies[0].dependsOn).toBe("1,2");
    //         expect(dependencies[1].dependsOn).toBe("3 tasks");
    //         expect(dependencies[2].dependsOn).toBe("no tasks");
    //     });
    // });
});
