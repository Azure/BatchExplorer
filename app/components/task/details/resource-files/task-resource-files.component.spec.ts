import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { RouterTestingModule } from "@angular/router/testing";
import { I18nTestingModule } from "@batch-flask/core/testing";
import { ButtonsModule, CloudFileService, I18nUIModule, NoItemComponent } from "@batch-flask/ui";
import { TableTestingModule } from "@batch-flask/ui/testing";
import { Task } from "app/models";
import { click } from "test/utils/helpers";
import { ElectronTestingModule } from "test/utils/mocks";
import { TaskResourceFilesComponent } from "./task-resource-files.component";

@Component({
    template: `<bl-task-resource-files [task]="task"></bl-task-resource-files>`,
})
class TestComponent {
    public task = new Task({ id: "task-1" });
}

describe("TaskResourceFilesComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let de: DebugElement;
    let cloudFileServiceSpy;

    beforeEach(() => {
        cloudFileServiceSpy = {
            openFile: jasmine.createSpy("openFile"),
        };
        TestBed.configureTestingModule({
            imports: [
                TableTestingModule,
                ButtonsModule,
                ElectronTestingModule,
                RouterTestingModule,
                I18nTestingModule,
                I18nUIModule,
            ],
            declarations: [TaskResourceFilesComponent, TestComponent, NoItemComponent],
            providers: [
                { provide: CloudFileService, useValue: cloudFileServiceSpy },
            ],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-task-resource-files"));
        fixture.detectChanges();
    });

    it("it diplay no  file when no resource files", () => {
        testComponent.task = new Task({ id: "task-no-files" });
        fixture.detectChanges();
        expect(de.nativeElement.textContent).toContain("task-resource-files.none");
    });

    describe("when there is files", () => {
        beforeEach(() => {
            testComponent.task = new Task({
                id: "task-no-files", resourceFiles: [
                    { blobSource: "http://batch.blob.net.windows/some/file/foo.txt", filePath: "local/foo.txt" },
                    { blobSource: "http://batch.blob.net.windows/some/file/bar.png", filePath: "local/bar.png" },
                    { blobSource: "http://batch.blob.net.windows/other.py", filePath: "local/other.py" },
                ],
            });
            fixture.detectChanges();
        });

        it("it diplay the files", () => {
            const rows = de.queryAll(By.css("bl-row-render"));
            expect(rows.length).toBe(3);
            expect(de.nativeElement.textContent).not.toContain("task-resource-files.none");

            expect(rows[0].nativeElement.textContent).toContain("http://batch.blob.net.windows/some/file/foo.txt");
            expect(rows[1].nativeElement.textContent).toContain("http://batch.blob.net.windows/some/file/bar.png");
            expect(rows[2].nativeElement.textContent).toContain("http://batch.blob.net.windows/other.py");

            expect(rows[0].nativeElement.textContent).toContain("local/foo.txt");
            expect(rows[1].nativeElement.textContent).toContain("local/bar.png");
            expect(rows[2].nativeElement.textContent).toContain("local/other.py");
        });

        it("open the file in a dialog when clicking on it", () => {
            const rows = de.queryAll(By.css("bl-row-render"));
            click(rows[1]);
            expect(cloudFileServiceSpy.openFile).toHaveBeenCalledOnce();
            expect(cloudFileServiceSpy.openFile).toHaveBeenCalledWith(
                "http://batch.blob.net.windows/some/file/bar.png");
        });
    });
});
