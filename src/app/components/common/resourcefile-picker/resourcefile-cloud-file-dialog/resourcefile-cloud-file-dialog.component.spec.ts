import { Component, DebugElement, EventEmitter, Input, Output } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatDialogRef } from "@angular/material";
import { By } from "@angular/platform-browser";
import { ListResponse } from "@batch-flask/core";
import {
    I18nTestingModule, MockControlValueAccessorComponent, controlValueAccessorProvider,
} from "@batch-flask/core/testing";
import { File, FileExplorerConfig, FormModule, I18nUIModule } from "@batch-flask/ui";
import { ArmBatchAccount, StorageAccount, Subscription } from "app/models";
import { BatchAccountService, StorageAccountService } from "app/services";
import { AutoStorageService, StorageBlobService, StorageContainerService } from "app/services/storage";
import { BlobUtilities } from "azure-storage";
import { List } from "immutable";
import { of } from "rxjs";
import { ResourceFileCloudFileDialogComponent } from "./resourcefile-cloud-file-dialog.component";

@Component({
    selector: "bl-storage-account-picker", template: "",
    providers: [controlValueAccessorProvider(() => FakeStorageAccountPickerComponent)],
})
class FakeStorageAccountPickerComponent extends MockControlValueAccessorComponent<string | null> {

}

@Component({
    selector: "bl-blob-container-picker", template: "",
    providers: [controlValueAccessorProvider(() => FakeBlobContainerPickerComponent)],
})
class FakeBlobContainerPickerComponent extends MockControlValueAccessorComponent<string | null> {
    @Input() public label: string;
    @Input() public storageAccountId: string;
}

@Component({
    selector: "bl-blob-files-browser", template: "",
})
class FakeBlobFileBrowserComponent {
    @Input() public storageAccountId: string;
    @Input() public container: string;

    @Input() public fileExplorerConfig: FileExplorerConfig;
    @Input() public activeFile: string;
    @Output() public activeFileChange = new EventEmitter<string>();
}

const sub1 = new Subscription({
    id: "/subscriptions/sub1",
    subscriptionId: "sub1",
});

describe("ResourceFileCloudFileDialogComponent", () => {
    let fixture: ComponentFixture<ResourceFileCloudFileDialogComponent>;
    let component: ResourceFileCloudFileDialogComponent;
    let de: DebugElement;
    let storageAccountPicker: FakeStorageAccountPickerComponent;
    let containerPicker: FakeBlobContainerPickerComponent;

    let autoStorageServiceSpy;
    let storageAccountServiceSpy;
    let containerServiceSpy;
    let blobServiceSpy;
    let batchAccountServiceSpy;

    beforeEach(() => {
        autoStorageServiceSpy = {
            get: () => of("auto-storage-id"),
        };

        storageAccountServiceSpy = {
            findByName: jasmine.createSpy("findByName").and.returnValue(
                of(new StorageAccount({ id: "found-by-name" } as any))),
        };

        blobServiceSpy = {
            list: jasmine.createSpy("blob.list").and.callFake((_, _1, { folder }) => {
                if (folder === "path/to/folder") {
                    return of({ items: List([new File({ isDirectory: true })]) } as ListResponse<File>);
                } else if (folder === "path/to/file.sh") {
                    return of({ items: List([new File({ isDirectory: false })]) } as ListResponse<File>);
                }
                return of({ items: List([]) });
            }),
            generateSharedAccessBlobUrl: jasmine.createSpy("generateSharedAccessBlobUrl").and.returnValue(
                of("https://sas-url-blob")),
        };

        containerServiceSpy = {
            generateSharedAccessUrl: jasmine.createSpy("generateSharedAccessUrl").and.returnValue(
                of("https://sas-url-container")),
        };

        batchAccountServiceSpy = {
            currentAccount: of(new ArmBatchAccount({ id: "/", subscription: sub1 } as any)),
        };
        TestBed.configureTestingModule({
            imports: [
                I18nTestingModule,
                I18nUIModule,
                FormsModule,
                ReactiveFormsModule,
                FormModule,
            ],
            declarations: [
                ResourceFileCloudFileDialogComponent,
                FakeStorageAccountPickerComponent,
                FakeBlobContainerPickerComponent,
                FakeBlobFileBrowserComponent,
            ],
            providers: [
                { provide: AutoStorageService, useValue: autoStorageServiceSpy },
                { provide: StorageAccountService, useValue: storageAccountServiceSpy },
                { provide: StorageBlobService, useValue: blobServiceSpy },
                { provide: StorageContainerService, useValue: containerServiceSpy },
                { provide: BatchAccountService, useValue: batchAccountServiceSpy },
                { provide: MatDialogRef, useValue: null },
            ],
        });
        fixture = TestBed.createComponent(ResourceFileCloudFileDialogComponent);
        de = fixture.debugElement;
        component = fixture.componentInstance;
        fixture.detectChanges();

        storageAccountPicker = de.query(By.directive(FakeStorageAccountPickerComponent)).componentInstance;
        containerPicker = de.query(By.directive(FakeBlobContainerPickerComponent)).componentInstance;
    });

    function getFileBrowser(): FakeBlobFileBrowserComponent {
        const el = de.query(By.directive(FakeBlobFileBrowserComponent));
        return el && el.componentInstance;
    }

    function getPathInputEl(): DebugElement {
        return de.query(By.css("input[formControlName=path]"));
    }

    it("It preset the storage account picker with the auto storage account", () => {
        expect(storageAccountPicker.value).toEqual("auto-storage-id");
        expect(containerPicker.storageAccountId).toEqual("auto-storage-id");

    });

    it("It doesnt' show the file explorer and path input at the start", () => {
        expect(getFileBrowser()).toBeFalsy();
        expect(getPathInputEl()).toBeFalsy();
    });

    it("It updates the input of container picker and file browser when storage account id changes", () => {
        storageAccountPicker.updateValue("new-storage-acc-1");
        fixture.detectChanges();

        expect(containerPicker.storageAccountId).toEqual("new-storage-acc-1");
        const fileBrowser = getFileBrowser();
        expect(fileBrowser).toBeFalsy();
    });

    it("set all the controls when calling setFile with autoStorageContainerName file", async () => {
        await component.setFile({
            autoStorageContainerName: "foobar",
            blobPrefix: "path/to/folder",
            filePath: "",
        });
        fixture.detectChanges();

        expect(storageAccountPicker.value).toEqual("auto-storage-id");
        expect(containerPicker.value).toEqual("foobar");
        const pathEl = getPathInputEl();
        expect(pathEl).not.toBeFalsy();
        expect(pathEl.nativeElement.value).toEqual("path/to/folder");
    });

    it("set all the controls by parsing storageContainerUrl when calling setFile", async () => {
        await component.setFile({
            storageContainerUrl: "https://found-by-name.blob.core.windows.net/foobar?st=2019-05-05&sig=abcdef",
            blobPrefix: "path/to/folder",
            filePath: "",
        });
        fixture.detectChanges();

        expect(storageAccountPicker.value).toEqual("found-by-name");
        expect(containerPicker.value).toEqual("foobar");
        const pathEl = getPathInputEl();
        expect(pathEl).not.toBeFalsy();
        expect(pathEl.nativeElement.value).toEqual("path/to/folder");
    });

    describe("when setting a value to container picker with autostorage", () => {
        beforeEach(() => {
            containerPicker.updateValue("foobar");
            fixture.detectChanges();
        });

        it("It updates the input of file browser when container name changes", () => {
            const fileBrowser = getFileBrowser();
            expect(fileBrowser).not.toBeFalsy();
            expect(fileBrowser.container).toEqual("foobar");

            expect(getPathInputEl()).not.toBeFalsy();
        });

        describe("when it selects a folder in the file browser", () => {
            beforeEach(() => {
                const fileBrowser = getFileBrowser();
                expect(fileBrowser).not.toBeFalsy();
                fileBrowser.activeFileChange.emit("path/to/folder");
                fixture.detectChanges();
            });

            it("It updates the path input", () => {
                const pathEl = getPathInputEl();
                expect(pathEl).not.toBeFalsy();
                expect(pathEl.nativeElement.value).toEqual("path/to/folder");

                expect(de.query(By.css("[blFormFieldPrefix] .fa-folder"))).not.toBeFalsy();
                expect(de.query(By.css("[blFormFieldPrefix] .fa-file"))).toBeFalsy();
            });

            it("doesn't call the container service to get SAS as will be using autostorage ", () => {
                expect(blobServiceSpy.list).toHaveBeenCalledOnce();
                expect(blobServiceSpy.list).toHaveBeenCalledWith("auto-storage-id", "foobar", {
                    folder: "path/to/folder",
                    limit: 1,
                }, true);

                expect(containerServiceSpy.generateSharedAccessUrl).not.toHaveBeenCalledOnce();
            });

            it("updated the current selection", () => {
                expect(component.currentSelection).toEqual({
                    autoStorageContainerName: "foobar",
                    blobPrefix: "path/to/folder",
                    filePath: "",
                });
            });
        });

        describe("when it selects a folder in the file browser", () => {
            beforeEach(() => {
                const fileBrowser = getFileBrowser();
                expect(fileBrowser).not.toBeFalsy();
                fileBrowser.activeFileChange.emit("path/to/file.sh");
                fixture.detectChanges();
            });

            it("It updates the path input", () => {
                const pathEl = getPathInputEl();
                expect(pathEl).not.toBeFalsy();
                expect(pathEl.nativeElement.value).toEqual("path/to/file.sh");

                expect(de.query(By.css("[blFormFieldPrefix] .fa-file"))).not.toBeFalsy();
                expect(de.query(By.css("[blFormFieldPrefix] .fa-folder"))).toBeFalsy();
            });

            it("calls the blob service to generate SAS ", () => {
                expect(blobServiceSpy.list).toHaveBeenCalledOnce();
                expect(blobServiceSpy.list).toHaveBeenCalledWith("auto-storage-id", "foobar", {
                    folder: "path/to/file.sh",
                    limit: 1,
                }, true);
                expect(blobServiceSpy.generateSharedAccessBlobUrl).toHaveBeenCalledOnce();
                expect(blobServiceSpy.generateSharedAccessBlobUrl).toHaveBeenCalledWith(
                    "auto-storage-id", "foobar", "path/to/file.sh", {
                        AccessPolicy: jasmine.objectContaining({
                            Permissions: BlobUtilities.SharedAccessPermissions.READ,
                        }),
                    });
            });

            it("updated the current selection", () => {
                expect(component.currentSelection).toEqual({
                    httpUrl: "https://sas-url-blob",
                    filePath: "",
                });
            });
        });
    });

    describe("when setting a value to container picker with other storage account", () => {
        beforeEach(() => {
            storageAccountPicker.updateValue("new-storage-acc-1");
            fixture.detectChanges();
            containerPicker.updateValue("foobar");
            fixture.detectChanges();
        });

        describe("when it selects a folder in the file browser", () => {
            beforeEach(() => {
                const fileBrowser = getFileBrowser();
                expect(fileBrowser).not.toBeFalsy();
                fileBrowser.activeFileChange.emit("path/to/folder");
                fixture.detectChanges();
            });

            it("It updates the path input", () => {
                const pathEl = getPathInputEl();
                expect(pathEl).not.toBeFalsy();
                expect(pathEl.nativeElement.value).toEqual("path/to/folder");

                expect(de.query(By.css("[blFormFieldPrefix] .fa-folder"))).not.toBeFalsy();
                expect(de.query(By.css("[blFormFieldPrefix] .fa-file"))).toBeFalsy();
            });

            it("call the container service to get SAS for container", () => {
                expect(blobServiceSpy.list).toHaveBeenCalledOnce();
                expect(blobServiceSpy.list).toHaveBeenCalledWith("new-storage-acc-1", "foobar", {
                    folder: "path/to/folder",
                    limit: 1,
                }, true);

                expect(containerServiceSpy.generateSharedAccessUrl).toHaveBeenCalled();
                expect(containerServiceSpy.generateSharedAccessUrl).toHaveBeenCalledWith(
                    "new-storage-acc-1", "foobar", {
                        AccessPolicy: jasmine.objectContaining({
                            Permissions: BlobUtilities.SharedAccessPermissions.READ,
                        }),
                    });
            });

            it("updated the current selection", () => {
                expect(component.currentSelection).toEqual({
                    storageContainerUrl: "https://sas-url-container",
                    blobPrefix: "path/to/folder",
                    filePath: "",
                });
            });
        });
    });
});
