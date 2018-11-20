import { Component, DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed, fakeAsync, tick } from "@angular/core/testing";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { RouterTestingModule } from "@angular/router/testing";
import { MaterialModule, ServerError } from "@batch-flask/core";
import { I18nTestingModule } from "@batch-flask/core/testing";
import { PermissionService, SelectComponent, SelectModule } from "@batch-flask/ui";
import { ButtonsModule } from "@batch-flask/ui/buttons";
import { DialogService } from "@batch-flask/ui/dialogs";
import { FormModule } from "@batch-flask/ui/form";
import { I18nUIModule } from "@batch-flask/ui/i18n";
import { SidebarManager } from "@batch-flask/ui/sidebar";
import { Subject, of, throwError } from "rxjs";

import { FileGroupPickerComponent } from "app/components/data/shared";
import { CloudFilePickerComponent } from "app/components/data/shared/cloud-file-picker";
import { FileGroupSasComponent } from "app/components/data/shared/file-group-sas";
import { JobIdComponent } from "app/components/data/shared/job-id";
import { NcjParameterExtendedType, NcjParameterWrapper, ParameterInputComponent } from "app/components/market/submit";
import { BlobContainer, NcjParameterRawType } from "app/models";
import { JobService, NcjFileGroupService } from "app/services";
import { AutoStorageService, StorageBlobService, StorageContainerService } from "app/services/storage";
import { Constants } from "common";

import * as Fixtures from "test/fixture";
import { updateInput } from "test/utils/helpers";
import { MockListView } from "test/utils/mocks";
import { NoItemMockComponent } from "test/utils/mocks/components";

@Component({
    template: `
        <bl-parameter-input [formControl]="paramControl" [parameter]="param" [parameterValues]="paramValue">
        </bl-parameter-input>
    `,
})
class TestComponent {
    public paramControl = new FormControl("jobname");

    public param = new NcjParameterWrapper("jobName", {
        defaultValue: "",
        type: NcjParameterRawType.string,
        metadata: {
            description: "Param Description",
        },
    });

    public paramValue = {
        blendFile: "scene.blend",
        frameEnd: 4,
        frameStart: 1,
        jobName: "jobname",
        outputFileGroup: "outputfilegroup",
        outputFileGroupSas: "",
        sceneData: "scenedata",
    };
}

describe("ParameterInputComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let component: ParameterInputComponent;
    let de: DebugElement;
    let fileGroupServiceSpy: any;
    let autoStorageServiceSpy: any;
    let storageContainerSpy: any;
    let dialogServiceSpy: any;
    let storageBlobServiceSpy: any;
    let sidebarSpy: any;
    let jobServiceSpy: any;
    let listProxy: MockListView<BlobContainer, any>;

    beforeEach(() => {
        listProxy = new MockListView(BlobContainer, {
            cacheKey: "id",
            items: [
                Fixtures.container.create(),
            ],
        });

        dialogServiceSpy = {
            open: jasmine.createSpy("open"),
        };

        storageContainerSpy = {
            listView: () => listProxy,
            onContainerAdded: new Subject(),
            generateSharedAccessUrl: (containerId, accessPolicy) => {
                return of(`https://${containerId}.com?sastoken`);
            },
        };

        jobServiceSpy = {
            get: jasmine.createSpy("get").and.callFake((jobId, ...args) => {
                if (jobId === "good") {
                    return throwError(ServerError.fromBatch({
                        statusCode: 404,
                        code: "RandomTestErrorCode",
                        message: { value: "Try again ..." },
                    }));
                }

                return of(Fixtures.job.create({ id: jobId }));
            }),
        };

        storageBlobServiceSpy = {
        };

        fileGroupServiceSpy = {
            addFileGroupPrefix: jasmine.createSpy("addFileGroupPrefix").and.callFake((fgName) => {
                return `${Constants.ncjFileGroupPrefix}${fgName}`;
            }),
        };

        autoStorageServiceSpy = {
            get: () => of("storage-acc-1"),
        };

        sidebarSpy = {
            open: jasmine.createSpy("open"),
        };

        TestBed.configureTestingModule({
            imports: [
                ButtonsModule,
                FormModule,
                FormsModule,
                I18nTestingModule,
                I18nUIModule,
                MaterialModule,
                NoopAnimationsModule,
                RouterTestingModule,
                ReactiveFormsModule,
                SelectModule,
            ],
            declarations: [
                CloudFilePickerComponent,
                FileGroupPickerComponent,
                FileGroupSasComponent,
                JobIdComponent,
                NoItemMockComponent,
                ParameterInputComponent,
                TestComponent,
            ],
            providers: [
                { provide: NcjFileGroupService, useValue: fileGroupServiceSpy },
                { provide: StorageContainerService, useValue: storageContainerSpy },
                { provide: StorageBlobService, useValue: storageBlobServiceSpy },
                { provide: AutoStorageService, useValue: autoStorageServiceSpy },
                { provide: DialogService, useValue: dialogServiceSpy },
                { provide: SidebarManager, useValue: sidebarSpy },
                { provide: PermissionService, useValue: {} },
                { provide: JobService, useValue: jobServiceSpy },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });

        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-parameter-input"));
        component = de.componentInstance;
        fixture.detectChanges();
    });

    it("should propogate form control value to class", () => {
        expect(testComponent.paramControl.value).toBe(component.parameterValue.value);
    });

    describe("text parameter type", () => {
        let inputEl: DebugElement;
        const initialInput = "initial input value";
        const newInput = "new input value";
        const updatedInput = "updated input";

        beforeEach(() => {
            testComponent.param = new NcjParameterWrapper("jobName", {
                type: NcjParameterRawType.string,
                metadata: {
                    description: "Param Description",
                },
                defaultValue: initialInput,
            });
            testComponent.paramControl.setValue(initialInput);
            fixture.detectChanges();
            inputEl = de.query(By.css("input[type=text]"));
            expect(inputEl).not.toBeFalsy();
        });

        it("should show default string input", () => {
            expect(inputEl.nativeElement.value).toBe(initialInput);
        });

        it("should update input when form changes", () => {
            testComponent.paramControl.setValue(newInput);
            fixture.detectChanges();
            expect(inputEl.nativeElement.value).toBe(newInput);
        });

        it("should update form when input changes", () => {
            updateInput(inputEl, updatedInput);
            fixture.detectChanges();
            expect(inputEl.nativeElement.value).toBe(updatedInput);
        });

        it("should validate minimum length constraint", () => {
            const input = "abcde";
            testComponent.param = new NcjParameterWrapper("jobName", {
                type: NcjParameterRawType.string,
                metadata: {
                    description: "Param Description",
                },
                defaultValue: initialInput,
                minLength: 3,
            });
            fixture.detectChanges();
            testComponent.paramControl.setValue(input);
            fixture.detectChanges();
            expect(component.parameterValue.valid).toBe(true);
        });

        it("should invalidate minimum length constraint", () => {
            const input = "abcde";
            testComponent.param = new NcjParameterWrapper("jobName", {
                type: NcjParameterRawType.string,
                metadata: {
                    description: "Param Description",
                },
                defaultValue: initialInput,
                minLength: 10,
            });
            fixture.detectChanges();
            testComponent.paramControl.setValue(input);
            fixture.detectChanges();
            expect(component.parameterValue.valid).toBe(false);
        });

        it("should validate maximum length constraint", () => {
            const input = "abcde";
            testComponent.param = new NcjParameterWrapper("jobName", {
                type: NcjParameterRawType.string,
                metadata: {
                    description: "Param Description",
                },
                defaultValue: initialInput,
                maxLength: 7,
            });
            fixture.detectChanges();
            testComponent.paramControl.setValue(input);
            fixture.detectChanges();
            expect(component.parameterValue.valid).toBe(true);
        });

        it("should invalidate maximum length constraint", () => {
            const input = "abcde";
            testComponent.param = new NcjParameterWrapper("jobName", {
                type: NcjParameterRawType.string,
                metadata: {
                    description: "Param Description",
                },
                defaultValue: initialInput,
                maxLength: 2,
            });
            fixture.detectChanges();
            testComponent.paramControl.setValue(input);
            fixture.detectChanges();
            expect(component.parameterValue.valid).toBe(false);
        });

    });

    describe("text parameter type validation", () => {
        beforeEach(() => {
            testComponent.param = new NcjParameterWrapper("jobName", {
                type: NcjParameterRawType.string,
                metadata: {
                    description: "Param Description",
                },
                minLength: 3,
                maxLength: 6,
            });
            fixture.detectChanges();
        });

        it("should validate minimum/maximum length constraint", () => {
            testComponent.paramControl.setValue("abcd");
            fixture.detectChanges();
            expect(component.parameterValue.valid).toBe(true);
            expect(component.parameterValue.errors).toBeNull();
        });

        it("should invalidate minimum length constraint", () => {
            testComponent.paramControl.setValue("ab");
            fixture.detectChanges();
            expect(component.parameterValue.valid).toBe(false);
            expect(component.parameterValue.errors.minlength).not.toBeUndefined();
        });

        it("should invalidate maximum length constraint", () => {
            testComponent.paramControl.setValue("abcdefg");
            fixture.detectChanges();
            expect(component.parameterValue.valid).toBe(false);
            expect(component.parameterValue.errors.maxlength).not.toBeUndefined();
        });

    });

    describe("int parameter type", () => {
        let inputEl: DebugElement;
        const initialInput = 10;
        const newInput = 12;
        const updatedInput = 13;

        beforeEach(() => {
            testComponent.param = new NcjParameterWrapper("frameEnd", {
                type: NcjParameterRawType.int,
                metadata: {
                    description: "description",
                },
                defaultValue: initialInput,
            });

            testComponent.paramControl.setValue(initialInput);
            fixture.detectChanges();
            inputEl = de.query(By.css("input[type=number]"));
            expect(inputEl).not.toBeFalsy();
        });

        it("should show default int input", () => {
            expect(inputEl.nativeElement.value).toBe(String(initialInput));
        });

        it("should update input when form changes", () => {
            testComponent.paramControl.setValue(newInput);
            fixture.detectChanges();
            expect(inputEl.nativeElement.value).toBe(String(newInput));
        });

        it("should update form when input changes", () => {
            updateInput(inputEl, updatedInput);
            fixture.detectChanges();
            expect(inputEl.nativeElement.value).toBe(String(updatedInput));
        });

        it("should update form when input changes", () => {
            updateInput(inputEl, updatedInput);
            fixture.detectChanges();
            expect(inputEl.nativeElement.value).toBe(String(updatedInput));
        });

    });

    describe("int parameter type validation", () => {
        beforeEach(() => {
            testComponent.param = new NcjParameterWrapper("frameEnd", {
                type: NcjParameterRawType.int,
                metadata: {
                    description: "Param Description",
                },
                minValue: 3,
                maxValue: 6,
            });
            fixture.detectChanges();
        });

        it("should validate minimum/maximum value constraint", () => {
            testComponent.paramControl.setValue(4);
            fixture.detectChanges();
            expect(component.parameterValue.valid).toBe(true);
            expect(component.parameterValue.errors).toBeNull();
        });

        it("should invalidate minimum value constraint", () => {
            testComponent.paramControl.setValue(2);
            fixture.detectChanges();
            expect(component.parameterValue.valid).toBe(false);
            expect(component.parameterValue.errors.min).not.toBeUndefined();
        });

        it("should invalidate maximum value constraint", () => {
            testComponent.paramControl.setValue(7);
            fixture.detectChanges();
            expect(component.parameterValue.valid).toBe(false);
            expect(component.parameterValue.errors.max).not.toBeUndefined();
        });

    });

    describe("dropdown parameter type", () => {
        let selectEl: DebugElement;
        let selectComponent: SelectComponent;
        const initialInput = "a";
        const newInput = "b";

        beforeEach(() => {
            testComponent.param = new NcjParameterWrapper("jobName", {
                type: NcjParameterRawType.string,
                metadata: {
                    description: "description",
                },
                allowedValues: ["a", "b", "c"],
                defaultValue: initialInput,
            });
            testComponent.paramControl.setValue(initialInput);
            fixture.detectChanges();
            selectEl = de.query(By.css("bl-select"));
            expect(selectEl).not.toBeFalsy();
            selectComponent = selectEl.componentInstance;
        });

        it("should show all options", () => {
            const options = selectComponent.options.toArray();
            expect(options.length).toBe(3);
            expect(options[0].value).toEqual("a");
            expect(options[1].value).toEqual("b");
            expect(options[2].value).toEqual("c");
        });

        it("should select new input", () => {
            testComponent.paramControl.setValue(newInput);
            fixture.detectChanges();
            expect(selectComponent.value).toBe(newInput);
        });
    });

    describe("filegroup parameter type", () => {
        const initialInput = "blender-outputs";
        const newInput = "newinput";
        let fileGroupComponent: FileGroupPickerComponent;
        let fileGroupEl: DebugElement;

        beforeEach(() => {
            testComponent.param = new NcjParameterWrapper("outputFileGroup", {
                type: NcjParameterRawType.string,
                metadata: {
                    description: "description",
                    advancedType: NcjParameterExtendedType.fileGroup,
                },
            });

            testComponent.paramControl.setValue(initialInput);
            fixture.detectChanges();
            fileGroupEl = de.query(By.css("bl-file-group-picker"));
            expect(fileGroupEl).not.toBeFalsy();
            fileGroupComponent = fileGroupEl.componentInstance;
        });

        it("should show initial input", () => {
            expect(fileGroupComponent.value.value).toBe(initialInput);
        });

        it("should show updated input", () => {
            testComponent.paramControl.setValue(newInput);
            fixture.detectChanges();
            fileGroupComponent = fileGroupEl.componentInstance;
            expect(fileGroupComponent.value.value).toBe(`fgrp-${newInput}`);
        });
    });

    describe("fileinput parameter type", () => {
        const initialInput = "scene.blend";
        const newInput = "newinput";
        const containerIdValue = "fgrp-scenedata";
        let fileInputComponent: CloudFilePickerComponent;
        let fileInputEl: DebugElement;

        beforeEach(() => {
            testComponent.param = new NcjParameterWrapper("blendFile", {
                type: NcjParameterRawType.string,
                metadata: {
                    description: "description",
                    advancedType: NcjParameterExtendedType.fileInFileGroup,
                    dependsOn: "sceneData",
                },
            });
            testComponent.paramControl.setValue(initialInput);
            fixture.detectChanges();
            fileInputEl = de.query(By.css("bl-cloud-file-picker"));
            expect(fileInputEl).not.toBeFalsy();
            fileInputComponent = fileInputEl.componentInstance;
        });

        it("should show initial input", () => {
            expect(fileInputComponent.value.value).toBe(initialInput);
        });

        it("should be ensure containerId is set to input of dependsOn", () => {
            expect(fileInputComponent.containerId).toBe(containerIdValue);
        });

        it("should show updated input", () => {
            testComponent.paramControl.setValue(newInput);
            fixture.detectChanges();
            expect(fileInputComponent.value.value).toBe(newInput);
        });
    });

    describe("filegroup sas parameter type", () => {
        const initialInput = "";
        const newInput = "newinput";
        const containerIdValue = "fgrp-scenedata";
        let fileInputComponent: FileGroupSasComponent;
        let fileInputEl: DebugElement;

        beforeEach(() => {
            testComponent.param = new NcjParameterWrapper("outputFileGroupSas", {
                type: NcjParameterRawType.string,
                metadata: {
                    description: "description",
                    advancedType: NcjParameterExtendedType.fileGroupSas,
                    dependsOn: "sceneData",
                },
            });
            testComponent.paramControl.setValue(initialInput);
            fixture.detectChanges();
            fileInputEl = de.query(By.css("bl-file-group-sas"));
            expect(fileInputEl).not.toBeFalsy();
            fileInputComponent = fileInputEl.componentInstance;
        });

        it("should show initial input", () => {
            expect(fileInputComponent.value.value).toBe(initialInput);
        });

        it("should be ensure containerId is set to input of dependsOn", () => {
            expect(fileInputComponent.containerId).toBe(containerIdValue);
        });

        it("should show updated input", () => {
            testComponent.paramControl.setValue(newInput);
            fixture.detectChanges();
            expect(fileInputComponent.value.value).toBe(newInput);
        });

        it("generates sas token", () => {
            fileInputComponent.generateSasToken();
            fixture.detectChanges();
            expect(fileInputComponent.value.value).toBe(`https://storage-acc-1.com?sastoken`);
        });

        it("auto-generates token when inputs change", () => {
            fileInputComponent.containerId = "fgrp-bob";
            fileInputComponent.ngOnChanges({
                containerId: {
                    previousValue: undefined,
                    currentValue: fileInputComponent.containerId,
                    firstChange: true,
                },
            });
            fixture.detectChanges();
            expect(fileInputComponent.value.value).toBe(`https://storage-acc-1.com?sastoken`);
        });
    });

    describe("job-id parameter type", () => {
        const initialInput = "";
        const goodJobId = "good";
        const badJobId = "bad";
        let jobIdComponent: JobIdComponent;
        let jobIdInputEl: DebugElement;

        beforeEach(() => {
            testComponent.param = new NcjParameterWrapper("jobName", {
                type: NcjParameterRawType.string,
                metadata: {
                    description: "description",
                    advancedType: NcjParameterExtendedType.jobId,
                },
            });

            testComponent.paramControl.setValue(initialInput);
            fixture.detectChanges();
            jobIdInputEl = de.query(By.css("bl-job-id"));
            expect(jobIdInputEl).not.toBeFalsy();
            jobIdComponent = jobIdInputEl.componentInstance;
        });

        it("should show initial input", () => {
            expect(jobIdComponent.value.value).toBe(initialInput);
        });

        it("should show updated input and validate", fakeAsync(() => {
            testComponent.paramControl.setValue(goodJobId);
            fixture.detectChanges();
            tick(250);

            expect(jobIdComponent.value.value).toBe(goodJobId);
            expect(component.parameterValue.valid).toBe(true);
        }));

        it("should update but fail validation with non-existent job-id", fakeAsync(() => {
            testComponent.paramControl.setValue(badJobId);
            fixture.detectChanges();
            tick(250);

            expect(jobIdComponent.value.value).toBe(badJobId);
            expect(component.parameterValue.valid).toBe(false);
        }));
    });
});
