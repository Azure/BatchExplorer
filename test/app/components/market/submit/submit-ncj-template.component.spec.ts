import { Component, DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormBuilder, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { ActivatedRoute, Router } from "@angular/router";
import { RouterTestingModule } from "@angular/router/testing";
import { Observable } from "rxjs/Observable";

import { FileGroupPickerComponent } from "app/components/data/shared";
import { CloudFilePickerComponent } from "app/components/data/shared/cloud-file-picker";
import { FileGroupSasComponent } from "app/components/data/shared/file-group-sas";
import {
    // NcjParameterExtendedType,
    // NcjParameterWrapper,
    SubmitNcjTemplateComponent,
} from "app/components/market/submit";
import { MaterialModule } from "app/core";
import { NcjJobTemplate, NcjParameterRawType, NcjPoolTemplate, NcjTemplateMode } from "app/models";
import { NcjSubmitService, NcjTemplateService } from "app/services";
// import * as Fixtures from "test/fixture";
// import { updateInput } from "test/utils/helpers";
// import { ActivatedRouteMock } from "test/utils/mocks";
import { NoItemMockComponent } from "test/utils/mocks/components";

@Component({
    template: `
        <bl-submit-ncj-template
            title="test title"
            [jobTemplate]="jobTemplate"
            [poolTemplate]="poolTemplate">
        </bl-submit-ncj-template>
    `,
})
class TestComponent {
    // TODO: add to fixtures to make reusable.
    public jobTemplate: NcjJobTemplate = {
        parameters: {
            poolId: {
                type: NcjParameterRawType.string,
                defaultValue: "test-pool",
                metadata: {},
            },
            inputData: {
                type: NcjParameterRawType.string,
                metadata: {
                    advancedType: "file-group",
                },
            },
            blendFile: {
                type: NcjParameterRawType.string,
                metadata: {
                    advancedType: "file-in-file-group",
                    dependsOn: "inputData",
                },
            },
        },
        job: {
            type: "Microsoft.Batch/batchAccounts/jobs",
            properties: {
                poolId: "[parameters('poolId')]",
                fileGroup: "[parameters('inputData')]",
                blendFile: "[parameters('blendFile')]",
            },
        },
    };

    // TODO: add to fixtures to make reusable.
    public poolTemplate: NcjPoolTemplate = {
        parameters: {
            poolId: {
                type: NcjParameterRawType.string,
                defaultValue: "test-pool",
                metadata: {
                    description: "test pool data",
                },
            },
        },
        variables: null,
        pool: {
            id: "[parameters('poolId')]",
        },
    };
}

// TODO: remove fdescribe
fdescribe("SubmitNcjTemplateComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let component: SubmitNcjTemplateComponent;
    let de: DebugElement;

    let activatedRouteSpy: any;
    let templateServiceSpy: any;
    let ncjSubmitServiceSpy: any;
    let routerSpy: any;

    beforeEach(() => {
        activatedRouteSpy = {
            snapshot: {
                queryParams: { useAutoPool: "1", blendFile: "myfile.blend" },
            },
        };

        routerSpy = {
            navigate: jasmine.createSpy("router.navigate"),
            navigateByUrl: jasmine.createSpy("router.navigateByUrl"),
            createUrlTree: jasmine.createSpy("router.createUrlTree"),
        };

        templateServiceSpy = {
            addRecentSubmission: jasmine.createSpy("addRecentSubmission"),
        };

        ncjSubmitServiceSpy = {
            expandPoolTemplate: jasmine.createSpy("expandPoolTemplate").and.callFake((poolTemplate, poolParams) => {
                return Observable.of({});
            }),
            submitJob: jasmine.createSpy("submitJob").and.callFake((jobTemplate, jobParams) => {
                return Observable.of({});
            }),
            createPool: jasmine.createSpy("createPool").and.callFake((poolTemplate, poolParams) => {
                return Observable.of({});
            }),
        };

        TestBed.configureTestingModule({
            imports: [RouterTestingModule, ReactiveFormsModule, FormsModule, MaterialModule, NoopAnimationsModule],
            declarations: [NoItemMockComponent, SubmitNcjTemplateComponent, FileGroupSasComponent,
                TestComponent, FileGroupPickerComponent, CloudFilePickerComponent],
            providers: [
                { provide: FormBuilder, useValue: new FormBuilder() },
                { provide: ActivatedRoute, useValue: activatedRouteSpy },
                { provide: Router, useValue: routerSpy },
                { provide: NcjTemplateService, useValue: templateServiceSpy },
                { provide: NcjSubmitService, useValue: ncjSubmitServiceSpy },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });

        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-submit-ncj-template"));
        component = de.componentInstance;
        fixture.detectChanges();
    });

    it("should set mode to pool and job due to initial query params", () => {
        console.log(component.modeState);
        expect(component.modeState).toBe(NcjTemplateMode.NewPoolAndJob);
    });

    // describe("text parameter type", () => {
    //     let inputEl: DebugElement;
    //     const initialInput = "initial input value";
    //     const newInput = "new input value";
    //     const updatedInput = "updated input";

    //     beforeEach(() => {
    //         testComponent.param = new NcjParameterWrapper("jobName", {
    //             type: NcjParameterRawType.string,
    //             metadata: {
    //                 description: "Param Description",
    //             },
    //             defaultValue: initialInput,
    //         });
    //         testComponent.paramControl.setValue(initialInput);
    //         fixture.detectChanges();
    //         inputEl = de.query(By.css("input[type=text]"));
    //         expect(inputEl).not.toBeFalsy();
    //     });

    //     it("should show default string input", () => {
    //         expect(inputEl.nativeElement.value).toBe(initialInput);
    //     });

    //     it("should update input when form changes", () => {
    //         testComponent.paramControl.setValue(newInput);
    //         fixture.detectChanges();
    //         expect(inputEl.nativeElement.value).toBe(newInput);
    //     });

    //     it("should update form when input changes", () => {
    //         updateInput(inputEl, updatedInput);
    //         fixture.detectChanges();
    //         expect(inputEl.nativeElement.value).toBe(updatedInput);
    //     });

    //     it("should validate minimum length constraint", () => {
    //         const input = "abcde";
    //         testComponent.param = new NcjParameterWrapper("jobName", {
    //             type: NcjParameterRawType.string,
    //             metadata: {
    //                 description: "Param Description",
    //             },
    //             defaultValue: initialInput,
    //             minLength: 3,
    //         });
    //         fixture.detectChanges();
    //         testComponent.paramControl.setValue(input);
    //         fixture.detectChanges();
    //         expect(component.parameterValue.valid).toBe(true);
    //     });

    //     it("should invalidate minimum length constraint", () => {
    //         const input = "abcde";
    //         testComponent.param = new NcjParameterWrapper("jobName", {
    //             type: NcjParameterRawType.string,
    //             metadata: {
    //                 description: "Param Description",
    //             },
    //             defaultValue: initialInput,
    //             minLength: 10,
    //         });
    //         fixture.detectChanges();
    //         testComponent.paramControl.setValue(input);
    //         fixture.detectChanges();
    //         expect(component.parameterValue.valid).toBe(false);
    //     });

    //     it("should validate maximum length constraint", () => {
    //         const input = "abcde";
    //         testComponent.param = new NcjParameterWrapper("jobName", {
    //             type: NcjParameterRawType.string,
    //             metadata: {
    //                 description: "Param Description",
    //             },
    //             defaultValue: initialInput,
    //             maxLength: 7,
    //         });
    //         fixture.detectChanges();
    //         testComponent.paramControl.setValue(input);
    //         fixture.detectChanges();
    //         expect(component.parameterValue.valid).toBe(true);
    //     });

    //     it("should invalidate maximum length constraint", () => {
    //         const input = "abcde";
    //         testComponent.param = new NcjParameterWrapper("jobName", {
    //             type: NcjParameterRawType.string,
    //             metadata: {
    //                 description: "Param Description",
    //             },
    //             defaultValue: initialInput,
    //             maxLength: 2,
    //         });
    //         fixture.detectChanges();
    //         testComponent.paramControl.setValue(input);
    //         fixture.detectChanges();
    //         expect(component.parameterValue.valid).toBe(false);
    //     });

    // });

    // describe("text parameter type validation", () => {
    //     beforeEach(() => {
    //         testComponent.param = new NcjParameterWrapper("jobName", {
    //             type: NcjParameterRawType.string,
    //             metadata: {
    //                 description: "Param Description",
    //             },
    //             minLength: 3,
    //             maxLength: 6,
    //         });
    //         fixture.detectChanges();
    //     });

    //     it("should validate minimum/maximum length constraint", () => {
    //         testComponent.paramControl.setValue("abcd");
    //         fixture.detectChanges();
    //         expect(component.parameterValue.valid).toBe(true);
    //         expect(component.parameterValue.errors).toBeNull();
    //     });

    //     it("should invalidate minimum length constraint", () => {
    //         testComponent.paramControl.setValue("ab");
    //         fixture.detectChanges();
    //         expect(component.parameterValue.valid).toBe(false);
    //         expect(component.parameterValue.errors.minlength).not.toBeUndefined();
    //     });

    //     it("should invalidate maximum length constraint", () => {
    //         testComponent.paramControl.setValue("abcdefg");
    //         fixture.detectChanges();
    //         expect(component.parameterValue.valid).toBe(false);
    //         expect(component.parameterValue.errors.maxlength).not.toBeUndefined();
    //     });

    // });

    // describe("int parameter type", () => {
    //     let inputEl: DebugElement;
    //     const initialInput = 10;
    //     const newInput = 12;
    //     const updatedInput = 13;

    //     beforeEach(() => {
    //         testComponent.param = new NcjParameterWrapper("frameEnd", {
    //             type: NcjParameterRawType.int,
    //             metadata: {
    //                 description: "description",
    //             },
    //             defaultValue: initialInput,
    //         });

    //         testComponent.paramControl.setValue(initialInput);
    //         fixture.detectChanges();
    //         inputEl = de.query(By.css("input[type=number]"));
    //         expect(inputEl).not.toBeFalsy();
    //     });

    //     it("should show default int input", () => {
    //         expect(inputEl.nativeElement.value).toBe(String(initialInput));
    //     });

    //     it("should update input when form changes", () => {
    //         testComponent.paramControl.setValue(newInput);
    //         fixture.detectChanges();
    //         expect(inputEl.nativeElement.value).toBe(String(newInput));
    //     });

    //     it("should update form when input changes", () => {
    //         updateInput(inputEl, updatedInput);
    //         fixture.detectChanges();
    //         expect(inputEl.nativeElement.value).toBe(String(updatedInput));
    //     });

    //     it("should update form when input changes", () => {
    //         updateInput(inputEl, updatedInput);
    //         fixture.detectChanges();
    //         expect(inputEl.nativeElement.value).toBe(String(updatedInput));
    //     });

    // });

    // describe("int parameter type validation", () => {
    //     beforeEach(() => {
    //         testComponent.param = new NcjParameterWrapper("frameEnd", {
    //             type: NcjParameterRawType.int,
    //             metadata: {
    //                 description: "Param Description",
    //             },
    //             minValue: 3,
    //             maxValue: 6,
    //         });
    //         fixture.detectChanges();
    //     });

    //     it("should validate minimum/maximum value constraint", () => {
    //         testComponent.paramControl.setValue(4);
    //         fixture.detectChanges();
    //         expect(component.parameterValue.valid).toBe(true);
    //         expect(component.parameterValue.errors).toBeNull();
    //     });

    //     it("should invalidate minimum value constraint", () => {
    //         testComponent.paramControl.setValue(2);
    //         fixture.detectChanges();
    //         expect(component.parameterValue.valid).toBe(false);
    //         expect(component.parameterValue.errors.min).not.toBeUndefined();
    //     });

    //     it("should invalidate maximum value constraint", () => {
    //         testComponent.paramControl.setValue(7);
    //         fixture.detectChanges();
    //         expect(component.parameterValue.valid).toBe(false);
    //         expect(component.parameterValue.errors.max).not.toBeUndefined();
    //     });

    // });

    // describe("dropdown parameter type", () => {
    //     let selectEl: DebugElement;
    //     let selectComponent: MatSelect;
    //     const initialInput = "a";
    //     const newInput = "b";

    //     beforeEach(() => {
    //         testComponent.param = new NcjParameterWrapper("jobName", {
    //             type: NcjParameterRawType.string,
    //             metadata: {
    //                 description: "description",
    //             },
    //             allowedValues: ["a", "b", "c"],
    //             defaultValue: initialInput,
    //         });
    //         testComponent.paramControl.setValue(initialInput);
    //         fixture.detectChanges();
    //         selectEl = de.query(By.css("mat-select"));
    //         expect(selectEl).not.toBeFalsy();
    //         selectComponent = selectEl.componentInstance;
    //     });

    //     it("should show all options", () => {
    //         const options = selectComponent.options.toArray();
    //         expect(options.length).toBe(3);
    //         expect(options[0].value).toEqual("a");
    //         expect(options[1].value).toEqual("b");
    //         expect(options[2].value).toEqual("c");
    //     });

    //     it("should select new input", () => {
    //         testComponent.paramControl.setValue(newInput);
    //         fixture.detectChanges();
    //         expect((selectComponent.selected as MatOption).value).toBe(newInput);
    //     });
    // });

    // describe("filegroup parameter type", () => {
    //     const initialInput = "blender-outputs";
    //     const newInput = "newinput";
    //     let fileGroupComponent: FileGroupPickerComponent;
    //     let fileGroupEl: DebugElement;

    //     beforeEach(() => {
    //         testComponent.param = new NcjParameterWrapper("outputFileGroup", {
    //             type: NcjParameterRawType.string,
    //             metadata: {
    //                 description: "description",
    //                 advancedType: NcjParameterExtendedType.fileGroup,
    //             },
    //         });

    //         testComponent.paramControl.setValue(initialInput);
    //         fixture.detectChanges();
    //         fileGroupEl = de.query(By.css("bl-file-group-picker"));
    //         expect(fileGroupEl).not.toBeFalsy();
    //         fileGroupComponent = fileGroupEl.componentInstance;
    //     });

    //     it("should show initial input", () => {
    //         expect(fileGroupComponent.value.value).toBe(initialInput);
    //     });

    //     it("should show updated input", () => {
    //         testComponent.paramControl.setValue(newInput);
    //         fixture.detectChanges();
    //         fileGroupComponent = fileGroupEl.componentInstance;
    //         expect(fileGroupComponent.value.value).toBe(newInput);
    //     });
    // });

    // describe("fileinput parameter type", () => {
    //     const initialInput = "scene.blend";
    //     const newInput = "newinput";
    //     const containerIdValue = "fgrp-scenedata";
    //     let fileInputComponent: CloudFilePickerComponent;
    //     let fileInputEl: DebugElement;

    //     beforeEach(() => {
    //         testComponent.param = new NcjParameterWrapper("blendFile", {
    //             type: NcjParameterRawType.string,
    //             metadata: {
    //                 description: "description",
    //                 advancedType: NcjParameterExtendedType.fileInFileGroup,
    //                 dependsOn: "sceneData",
    //             },
    //         });
    //         testComponent.paramControl.setValue(initialInput);
    //         fixture.detectChanges();
    //         fileInputEl = de.query(By.css("bl-cloud-file-picker"));
    //         expect(fileInputEl).not.toBeFalsy();
    //         fileInputComponent = fileInputEl.componentInstance;
    //     });

    //     it("should show initial input", () => {
    //         expect(fileInputComponent.value.value).toBe(initialInput);
    //     });

    //     it("should be ensure containerId is set to input of dependsOn", () => {
    //         expect(fileInputComponent.containerId).toBe(containerIdValue);
    //     });

    //     it("should show updated input", () => {
    //         testComponent.paramControl.setValue(newInput);
    //         fixture.detectChanges();
    //         expect(fileInputComponent.value.value).toBe(newInput);
    //     });
    // });

    // describe("filegroup sas parameter type", () => {
    //     const initialInput = "";
    //     const newInput = "newinput";
    //     const containerIdValue = "fgrp-scenedata";
    //     let fileInputComponent: FileGroupSasComponent;
    //     let fileInputEl: DebugElement;

    //     beforeEach(() => {
    //         testComponent.param = new NcjParameterWrapper("outputFileGroupSas", {
    //             type: NcjParameterRawType.string,
    //             metadata: {
    //                 description: "description",
    //                 advancedType: NcjParameterExtendedType.fileGroupSas,
    //                 dependsOn: "sceneData",
    //             },
    //         });
    //         testComponent.paramControl.setValue(initialInput);
    //         fixture.detectChanges();
    //         fileInputEl = de.query(By.css("bl-file-group-sas"));
    //         expect(fileInputEl).not.toBeFalsy();
    //         fileInputComponent = fileInputEl.componentInstance;
    //     });

    //     it("should show initial input", () => {
    //         expect(fileInputComponent.value.value).toBe(initialInput);
    //     });

    //     it("should be ensure containerId is set to input of dependsOn", () => {
    //         expect(fileInputComponent.containerId).toBe(containerIdValue);
    //     });

    //     it("should show updated input", () => {
    //         testComponent.paramControl.setValue(newInput);
    //         fixture.detectChanges();
    //         expect(fileInputComponent.value.value).toBe(newInput);
    //     });

    //     it("generates sas token", () => {
    //         fileInputComponent.generateSasToken();
    //         fixture.detectChanges();
    //         expect(fileInputComponent.value.value).toBe(`https://${containerIdValue}.com?sastoken`);
    //     });

    //     it("auto-generates token when inputs change", () => {
    //         fileInputComponent.containerId = "fgrp-bob";
    //         fileInputComponent.ngOnChanges({
    //             containerId: {
    //                 previousValue: undefined,
    //                 currentValue: fileInputComponent.containerId,
    //                 firstChange: true,
    //             },
    //         });
    //         fixture.detectChanges();
    //         expect(fileInputComponent.value.value).toBe(`https://${fileInputComponent.containerId}.com?sastoken`);
    //     });
    // });
});
