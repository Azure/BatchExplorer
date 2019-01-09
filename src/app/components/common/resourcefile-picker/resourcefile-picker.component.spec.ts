import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { FileSystemService, I18nUIModule, SelectModule } from "@batch-flask/ui";
import { PermissionService } from "@batch-flask/ui/permission";

import { I18nTestingModule } from "@batch-flask/core/testing";
import { ButtonsModule } from "@batch-flask/ui/buttons";
import { EditableTableColumnComponent, EditableTableComponent } from "@batch-flask/ui/form/editable-table";
import { ResourcefilePickerComponent } from "app/components/task/base";
import { SettingsService } from "app/services";
import { AutoStorageService, StorageBlobService, StorageContainerService } from "app/services/storage";
import { of } from "rxjs";

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
    let storageBlobServiceSpy;
    let fsSpy;
    let settingsServiceSpy;
    let autoStorageServiceSpy;
    let storageContainerServiceSpy;

    beforeEach(() => {
        storageBlobServiceSpy = {
            uploadFile: jasmine.createSpy("uploadFile")
                .and.returnValue(of(null)),
            generateSharedAccessBlobUrl: jasmine.createSpy("uploadFile")
                .and.callFake((a, b) => of(`${a}.${b}?key=abc`)),
        };

        autoStorageServiceSpy = {
            get: () => of("storage-acc-1"),
        };
        fsSpy = {
            lstat: () => Promise.resolve({
                isFile: () => true,
            }),
        };
        storageContainerServiceSpy = {
            createIfNotExists: jasmine.createSpy("createIfNotExists")
                .and.returnValue(of(null)),
        };
        settingsServiceSpy = {
            settings: {
                "storage.default-upload-container": "test-custom-container",
            },
        };
        TestBed.configureTestingModule({
            imports: [FormsModule, ReactiveFormsModule, SelectModule, ButtonsModule, I18nTestingModule, I18nUIModule],
            declarations: [ResourcefilePickerComponent, TestComponent,
                EditableTableComponent, EditableTableColumnComponent],
            providers: [
                { provide: StorageContainerService, useValue: storageContainerServiceSpy },
                { provide: StorageBlobService, useValue: storageBlobServiceSpy },
                { provide: AutoStorageService, useValue: autoStorageServiceSpy },
                { provide: FileSystemService, useValue: fsSpy },
                { provide: SettingsService, useValue: settingsServiceSpy },
                { provide: PermissionService, useValue: {} },
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
        expect(columns[0].name).toBe("httpUrl");
        expect(columns[1].name).toBe("filePath");
    });

    it("should have the right column labels", () => {
        const columns = editableTableEl.queryAll(By.css("thead th"));

        expect(columns.length).toBe(3);
        expect(columns[0].nativeElement.textContent).toContain("Source");
        expect(columns[1].nativeElement.textContent).toContain("File path");
    });

    it("Should update the files", () => {
        editableTable.addNewItem();
        editableTable.items.controls[0].setValue({
            httpUrl: "https://example.com/file.json",
            filePath: "path/file.json",
        });
        expect(testComponent.files).toEqual([{
            httpUrl: "https://example.com/file.json",
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
                httpUrl: "https://example.com/path/file1.txt",
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
                    httpUrl: "storage-acc-1.test-custom-container?key=abc",
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

        it("should upload list of files", async () => {
            await component.uploadFiles(["some/path/file1.txt", "some/other/file2.txt"]);
            expect(storageContainerServiceSpy.createIfNotExists).toHaveBeenCalledOnce();
            expect(storageContainerServiceSpy.createIfNotExists).toHaveBeenCalledWith("storage-acc-1",
                "test-custom-container");
            expect(storageBlobServiceSpy.uploadFile).toHaveBeenCalledTimes(2);
            expect(storageBlobServiceSpy.uploadFile).toHaveBeenCalledWith("storage-acc-1", "test-custom-container",
                "some/path/file1.txt", `${uploadFolder}/file1.txt`);
            expect(storageBlobServiceSpy.uploadFile).toHaveBeenCalledWith("storage-acc-1", "test-custom-container",
                "some/other/file2.txt", `${uploadFolder}/file2.txt`);
        });

        it("should upload list of files when root is defined", async () => {
            await component.uploadFiles(["some/path/file1.txt", "some/other/file2.txt"], "custom/path");
            expect(storageContainerServiceSpy.createIfNotExists).toHaveBeenCalledOnce();
            expect(storageContainerServiceSpy.createIfNotExists).toHaveBeenCalledWith("storage-acc-1",
                "test-custom-container");
            expect(storageBlobServiceSpy.uploadFile).toHaveBeenCalledTimes(2);
            expect(storageBlobServiceSpy.uploadFile).toHaveBeenCalledWith("storage-acc-1", "test-custom-container",
                "some/path/file1.txt", `${uploadFolder}/custom/path/file1.txt`);
            expect(storageBlobServiceSpy.uploadFile).toHaveBeenCalledWith("storage-acc-1", "test-custom-container",
                "some/other/file2.txt", `${uploadFolder}/custom/path/file2.txt`);
        });
    });
});
