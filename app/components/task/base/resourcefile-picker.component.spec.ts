import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatSelectModule } from "@angular/material";
import { By } from "@angular/platform-browser";

import { EditableTableColumnComponent, EditableTableComponent } from "app/components/base/form/editable-table";
import { ResourcefilePickerComponent } from "app/components/task/base";
import { FileSystemService, SettingsService, StorageService } from "app/services";
import { Observable } from "rxjs";
import { F } from "test/utils";

@Component({
    template: `<bl-resourcefile-picker [(ngModel)]="files"></bl-resourcefile-picker>`,
})
class TestComponent {
    public files = [];
}

describe("ResourcefilePickerComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let component: ResourcefilePickerComponent;
    let editableTableEl: DebugElement;
    let editableTable: EditableTableComponent;
    let storageServiceSpy;
    let fsSpy;
    let settingsServiceSpy;

    beforeEach(() => {
        storageServiceSpy = {
            createContainerIfNotExists: jasmine.createSpy("createContainerIfNotExists")
                .and.returnValue(Observable.of(null)),
            uploadFile: jasmine.createSpy("uploadFile")
                .and.returnValue(Observable.of(null)),
            generateSharedAccessBlobUrl: jasmine.createSpy("uploadFile")
                .and.callFake(x => Observable.of(`${x}?key=abc`)),
        };
        fsSpy = {
            lstat: () => Promise.resolve({
                isFile: () => true,
            }),
        };
        settingsServiceSpy = {
            settings: {
                "storage.default-upload-container": "test-custom-container",
            },
        };
        TestBed.configureTestingModule({
            imports: [FormsModule, ReactiveFormsModule, MatSelectModule],
            declarations: [ResourcefilePickerComponent, TestComponent,
                EditableTableComponent, EditableTableColumnComponent],
            providers: [
                { provide: StorageService, useValue: storageServiceSpy },
                { provide: FileSystemService, useValue: fsSpy },
                { provide: SettingsService, useValue: settingsServiceSpy },
            ],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        component = fixture.debugElement.query(By.css("bl-resourcefile-picker")).componentInstance;
        editableTableEl = fixture.debugElement.query(By.css("bl-editable-table"));
        editableTable = editableTableEl.componentInstance;
        fixture.detectChanges();
    });

    it("should have the right column keys", () => {
        const columns = editableTable.columns.toArray();

        expect(columns.length).toBe(2);
        expect(columns[0].name).toBe("blobSource");
        expect(columns[1].name).toBe("filePath");
    });

    it("should have the right column labels", () => {
        const columns = editableTableEl.queryAll(By.css("thead th"));

        expect(columns.length).toBe(3);
        expect(columns[0].nativeElement.textContent).toContain("Blob source");
        expect(columns[1].nativeElement.textContent).toContain("File path");
    });

    it("Should update the files", () => {
        editableTable.addNewItem();
        editableTable.items.controls[0].setValue({
            blobSource: "https://example.com/file.json",
            filePath: "path/file.json",
        });
        expect(testComponent.files).toEqual([{
            blobSource: "https://example.com/file.json",
            filePath: "path/file.json",
        }]);
    });

    describe("when dropping files", () => {
        it("adds a link to the list of files", () => {
            const event = {
                preventDefault: () => null,
                stopPropagation: () => null,
                dataTransfer: {
                    types: ["text/html", "text/uri-list"],
                    files: [],
                    getData: () => "https://example.com/path/file1.txt",
                },
            };
            component.handleDrop(event as any);
            expect(component.files.value.length).toBe(1);
            expect(component.files.value.first()).toEqual({
                blobSource: "https://example.com/path/file1.txt",
                filePath: "file1.txt",
            });
        });

        it("adds a file to the list of files", (done) => {
            const event = {
                preventDefault: () => null,
                stopPropagation: () => null,
                dataTransfer: {
                    types: ["Files"],
                    files: [{
                        path: "some/file1.txt",
                    }],
                },
            };
            component.handleDrop(event as any);
            setTimeout(() => {
                fixture.detectChanges();
                expect(component.files.value.length).toBe(1);
                expect(component.files.value.first()).toEqual({
                    blobSource: "test-custom-container?key=abc",
                    filePath: "file1.txt",
                });
                done();
            });
        });

        it("doesn't do anything if no links or files", () => {
            const event = {
                preventDefault: () => null,
                stopPropagation: () => null,
                dataTransfer: {
                    types: ["text/html"],
                    files: [],
                    getData: () => "some text invalid",
                },
            };
            component.handleDrop(event as any);
            expect(component.files.value.length).toBe(0);
        });
    });

    describe("uplading files", () => {
        let uploadFolder: string;

        beforeEach(() => {
            uploadFolder = `resource-files/${(component as any)._folderId}`;
        });

        it("should upload list of files", F(async () => {
            await component.uploadFiles(["some/path/file1.txt", "some/other/file2.txt"]);
            expect(storageServiceSpy.createContainerIfNotExists).toHaveBeenCalledOnce();
            expect(storageServiceSpy.createContainerIfNotExists).toHaveBeenCalledWith("test-custom-container");
            expect(storageServiceSpy.uploadFile).toHaveBeenCalledTimes(2);
            expect(storageServiceSpy.uploadFile).toHaveBeenCalledWith("test-custom-container",
                "some/path/file1.txt", `${uploadFolder}/file1.txt`);
            expect(storageServiceSpy.uploadFile).toHaveBeenCalledWith("test-custom-container",
                "some/other/file2.txt", `${uploadFolder}/file2.txt`);
        }));

        it("should upload list of files when root is defined", F(async () => {
            await component.uploadFiles(["some/path/file1.txt", "some/other/file2.txt"], "custom/path");
            expect(storageServiceSpy.createContainerIfNotExists).toHaveBeenCalledOnce();
            expect(storageServiceSpy.createContainerIfNotExists).toHaveBeenCalledWith("test-custom-container");
            expect(storageServiceSpy.uploadFile).toHaveBeenCalledTimes(2);
            expect(storageServiceSpy.uploadFile).toHaveBeenCalledWith("test-custom-container",
                "some/path/file1.txt", `${uploadFolder}/custom/path/file1.txt`);
            expect(storageServiceSpy.uploadFile).toHaveBeenCalledWith("test-custom-container",
                "some/other/file2.txt", `${uploadFolder}/custom/path/file2.txt`);
        }));
    });
});
