import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MdAutocomplete } from "@angular/material";
import { By } from "@angular/platform-browser";
import { RouterTestingModule } from "@angular/router/testing";

import { TaskLogComponent } from "app/components/task/details/output";
import { File } from "app/models";
import { FileService } from "app/services";
import * as Fixtures from "test/fixture";
import { RxMockEntityProxy, RxMockListProxy } from "test/utils/mocks";

const fileSizeMap: Map<string, number> = new Map()
    .set("stdout.txt", 10)
    .set("stderr.txt", 20)
    .set("banana.txt", 30)
    .set("apple.txt", 40)
    .set("pear.txt", 50);

describe("TaskDependenciesComponent", () => {
    let fixture: ComponentFixture<TaskLogComponent>;
    let component: TaskLogComponent;

    let anyComponent: any;
    let fileListProxy: RxMockListProxy<any, File>;
    let fileServiceSpy: any;

    beforeEach(() => {
        fileListProxy = new RxMockListProxy(File, {
            cacheKey: "name",
            items: [
                Fixtures.file.create({ name: "stdout.txt" }),
                Fixtures.file.create({ name: "stderr.txt" }),
                Fixtures.file.create({ name: "banana.txt" }),
                Fixtures.file.create({ name: "apple.txt" }),
                Fixtures.file.create({ name: "pear.txt" }),
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
        anyComponent = component as any;
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

    describe("loads file sizes based on current job and task", () => {
        beforeEach(() => {
            component.ngOnChanges({ jobId: component.jobId, task: component.task });
            fixture.detectChanges();
        });

        it("current task id set", () => {
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

        it("default file tab is stdout.txt", () => {
            const container = fixture.debugElement.query(By.css(".file-tab.active"));
            expect(container.nativeElement.textContent).toContain("stdout.txt (10 B)");
        });
    });

    describe("loads additional task output files", () => {
        beforeEach(() => {
            component.ngOnChanges({ jobId: component.jobId, task: component.task });
            fixture.detectChanges();
        });

        it("has 3 extra outputs for auto-complete filter", () => {
            expect(anyComponent._options.value.length).toBe(3);
        });

        it("won't add either default file to _options list", () => {
            let file = { name: "stdout.txt", isDirectory: false };
            expect(anyComponent._canAddFileToMap(file)).toBe(false);

            file.name = "stderr.txt";
            expect(anyComponent._canAddFileToMap(file)).toBe(false);

            file.isDirectory = true;
            expect(anyComponent._canAddFileToMap(file)).toBe(false);
        });

        it("hasn't added new files to tab list", () => {
            expect(component.outputFileNames.length).toBe(2);
        });
    });

    describe("can add a new file to a tab", () => {
        beforeEach(() => {
            component.ngOnChanges({ jobId: component.jobId, task: component.task });
            fixture.detectChanges();
        });

        it("click add shows filter", () => {
            const tabElements = fixture.debugElement.queryAll(By.css(".file-tab-more"));
            tabElements[0].nativeElement.click();
            fixture.detectChanges();
            expect(component.addingFile).toBe(true);
        });

        it("can filter options", (done) => {
            component.filteredOptions.subscribe((items) => {
                expect(items.length).toBe(1);
                expect(items[0]).toBe("banana.txt");
                done();
            });

            component.filterControl.setValue("banana");
        });

        it("selecting option loads file into tab list and gets file size", () => {
            component.optionSelected({}, "banana.txt");
            expect(component.outputFileNames.length).toBe(3);
            expect(component.selectedOutputFile).toBe("banana.txt");
            expect(Object.keys(component.fileSizes).length).toBe(3);
            expect(component.fileSizes["banana.txt"]).toBe("30 B");
        });

        it("clicking reset will remove additional tabs", () => {
            component.optionSelected({}, "apple.txt");
            expect(component.outputFileNames.length).toBe(3);
            expect(component.selectedOutputFile).toBe("apple.txt");

            component.resetTabs();
            expect(component.outputFileNames.length).toBe(2);
            expect(component.selectedOutputFile).toBe("stdout.txt");
        });
    });
});
