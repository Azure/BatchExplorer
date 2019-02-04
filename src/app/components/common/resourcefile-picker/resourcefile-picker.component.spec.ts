import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { UserConfigurationService } from "@batch-flask/core";
import { I18nTestingModule } from "@batch-flask/core/testing";
import { FileSystemService } from "@batch-flask/electron";
import { DialogService, SelectModule } from "@batch-flask/ui";
import { ButtonsModule } from "@batch-flask/ui/buttons";
import { ResourcefilePickerComponent } from "app/components/task/base";
import { ResourceFileAttributes } from "app/models";
import { AutoStorageService, StorageBlobService, StorageContainerService } from "app/services/storage";
import { of } from "rxjs";
import { click, updateInput } from "test/utils/helpers";
import { ResourceFileCloudFileDialogComponent } from "./resourcefile-cloud-file-dialog";
import { ResourceFileContainerSourceComponent } from "./resourcefile-container-source";
import { ResourceFilePickerRowComponent } from "./resourcefile-picker-row";

@Component({
    template: `<bl-resourcefile-picker [formControl]="files"></bl-resourcefile-picker>`,
})
class TestComponent {
    public files = new FormControl([]);
}

const storageDialogResult: ResourceFileAttributes = {
    autoStorageContainerName: "foobar",
    blobPrefix: "abc/def",
    filePath: "",
};

describe("ResourcefilePickerComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let de: DebugElement;
    let testComponent: TestComponent;
    let component: ResourcefilePickerComponent;
    let storageBlobServiceSpy;
    let fsSpy;
    let settingsServiceSpy;
    let autoStorageServiceSpy;
    let storageContainerServiceSpy;
    let dialogServiceSpy;

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
            watch: jasmine.createSpy("watch").and.returnValue(of({
                defaultUploadContainer: "test-custom-container",
            })),
        };

        dialogServiceSpy = {
            open: jasmine.createSpy("dialog.open").and.returnValue({
                afterClosed: () => of(storageDialogResult),
            }),
        };
        TestBed.configureTestingModule({
            imports: [FormsModule, ReactiveFormsModule, SelectModule, ButtonsModule, I18nTestingModule],
            declarations: [
                ResourcefilePickerComponent,
                TestComponent,
                ResourceFilePickerRowComponent,
                ResourceFileContainerSourceComponent,
            ],
            providers: [
                { provide: StorageContainerService, useValue: storageContainerServiceSpy },
                { provide: StorageBlobService, useValue: storageBlobServiceSpy },
                { provide: AutoStorageService, useValue: autoStorageServiceSpy },
                { provide: FileSystemService, useValue: fsSpy },
                { provide: UserConfigurationService, useValue: settingsServiceSpy },
                { provide: DialogService, useValue: dialogServiceSpy },
            ],
        });
        fixture = TestBed.createComponent(TestComponent);
        de = fixture.debugElement;
        testComponent = fixture.componentInstance;
        component = fixture.debugElement.query(By.css("bl-resourcefile-picker")).componentInstance;
        fixture.detectChanges();
    });

    it("starts with no rows", () => {
        const rows = de.queryAll(By.css("bl-resourcefile-picker-row"));
        expect(rows.length).toBe(0);
    });

    it("set pass values from parent", () => {
        testComponent.files.setValue([
            { httpUrl: "https://example.com/remote/foo.sh", filePath: "some/local/path/foo.sh" },
        ]);
        fixture.detectChanges();

        const rows = de.queryAll(By.css("bl-resourcefile-picker-row"));
        expect(rows.length).toBe(1);
        expect(rows[0].query(By.css(".fa-file"))).not.toBeFalsy();
        expect(rows[0].query(By.css("input[formControlName=httpUrl]"))).not.toBeFalsy();
        expect(rows[0].query(By.css("input[formControlName=filePath]"))).not.toBeFalsy();
    });

    describe("Adding a file by URL", () => {
        beforeEach(() => {
            click(de.query(By.css(".add-by-url")));
            fixture.detectChanges();
        });

        it("adds a new row of http url type", () => {
            const rows = de.queryAll(By.css("bl-resourcefile-picker-row"));
            expect(rows.length).toBe(1);
            expect(rows[0].query(By.css(".fa-file"))).not.toBeFalsy();
            expect(rows[0].query(By.css("input[formControlName=httpUrl]"))).not.toBeFalsy();
            expect(rows[0].query(By.css("input[formControlName=filePath]"))).not.toBeFalsy();

            // Doesn't show this
            expect(rows[0].query(By.css(".fa-folder"))).toBeFalsy();
            expect(rows[0].query(By.css("bl-resourcefile-container-source"))).toBeFalsy();
        });

        it("propagate the changes", () => {
            const rows = de.queryAll(By.css("bl-resourcefile-picker-row"));
            expect(rows.length).toBe(1);

            const sourceInput = rows[0].query(By.css("input[formControlName=httpUrl]"));
            updateInput(sourceInput, "https://example.com/remote/foo.sh");

            const localPathInput = rows[0].query(By.css("input[formControlName=filePath]"));
            updateInput(localPathInput, "some/local/path/foo.sh");

            expect(testComponent.files.value).toEqual([
                { httpUrl: "https://example.com/remote/foo.sh", filePath: "some/local/path/foo.sh" },
            ]);
        });
    });

    describe("Adding from Azure Storage", () => {
        beforeEach(() => {
            click(de.query(By.css(".add-from-storage")));
            fixture.detectChanges();
        });

        it("prompted and dialog", () => {
            expect(dialogServiceSpy.open).toHaveBeenCalledOnce();
            expect(dialogServiceSpy.open).toHaveBeenCalledWith(ResourceFileCloudFileDialogComponent);
        });

        it("adds a new row of container type", () => {
            const rows = de.queryAll(By.css("bl-resourcefile-picker-row"));
            expect(rows.length).toBe(1);
            expect(rows[0].query(By.css(".fa-folder"))).not.toBeFalsy();
            expect(rows[0].query(By.css("bl-resourcefile-container-source"))).not.toBeFalsy();
            expect(rows[0].query(By.css("input[formControlName=filePath]"))).not.toBeFalsy();

            // Doesn't show this
            expect(rows[0].query(By.css(".fa-file"))).toBeFalsy();
            expect(rows[0].query(By.css("input[formControlName=httpUrl]"))).toBeFalsy();
        });

        it("propagate the changes", () => {
            const rows = de.queryAll(By.css("bl-resourcefile-picker-row"));
            expect(rows.length).toBe(1);

            const localPathInput = rows[0].query(By.css("input[formControlName=filePath]"));
            updateInput(localPathInput, "some/local/path/foo.sh");

            expect(testComponent.files.value).toEqual([
                {
                    autoStorageContainerName: "foobar",
                    blobPrefix: "abc/def",
                    filePath: "some/local/path/foo.sh",
                },
            ]);
        });
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
