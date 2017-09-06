import { Component, DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MaterialModule } from "@angular/material";
import { By } from "@angular/platform-browser";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { RouterTestingModule } from "@angular/router/testing";
import { DialogService } from "app/components/base/dialogs";
import { Modes, NcjParameterWrapper, SideMenuComponent } from "app/components/market/submit";
import { BatchApplication, NcjParameterRawType } from "app/models";
import { PricingService, PythonRpcService } from "app/services";
import { Subject } from "rxjs";
import * as Fixtures from "test/fixture";
import { updateInput } from "test/utils/helpers";
import { RxMockListProxy } from "test/utils/mocks";
import { NoItemMockComponent } from "test/utils/mocks/components";

@Component({
    template: `
        <bl-side-menu [logo] = "icon" [title] = "applicationId" [action] = "actionId"
        [modeState] = "modeState" [form] = "form" [poolParametersWrapper] = "poolParametersWrapper"
        [jobParametersWrapper] = "jobParametersWrapper" [poolTemplate] = "poolTemplate"> </bl-side-menu>
    `,
})
class TestComponent {
    public icon;
    public title;
    public applicationId;
    public actionId;
    public Modes = Modes;
    public modeState = Modes.ExistingPoolAndJob;
    public formBuilder: FormBuilder = new FormBuilder();
    public form = this.formBuilder.group({
        pool: new FormGroup({ a: new FormControl("a"), b: new FormControl("b") }),
        job: new FormGroup({ c: new FormControl("c"), d: new FormControl("d") }),
        poolpicker: new FormControl("e"),
    });
    public poolTemplate;
    public jobParametersWrapper = [new NcjParameterWrapper("a", {
        defaultValue: "a",
        type: NcjParameterRawType.string,
        metadata: {
            description: "Param Description",
        },
    }), new NcjParameterWrapper("b", {
        defaultValue: "b",
        type: NcjParameterRawType.string,
        metadata: {
            description: "Param Description",
        },
    })];
    public poolParametersWrapper = [new NcjParameterWrapper("c", {
        defaultValue: "c",
        type: NcjParameterRawType.string,
        metadata: {
            description: "Param Description",
        },
    }), new NcjParameterWrapper("d", {
        defaultValue: "d",
        type: NcjParameterRawType.string,
        metadata: {
            description: "Param Description",
        },
    })];

}

fdescribe("ParameterInputComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let component: SideMenuComponent;
    let de: DebugElement;
    let pricingServiceSpy: any;
    let pythonServiceSpy: any;
    let listProxy: RxMockListProxy<any, BatchApplication>;

    beforeEach(() => {
        pricingServiceSpy = {
            list: () => listProxy,
            onApplicationAdded: new Subject(),
            listContainers: () => listProxy,
        };

        pythonServiceSpy = {
            list: () => listProxy,
            onApplicationAdded: new Subject(),
            listContainers: () => listProxy,
        };

        TestBed.configureTestingModule({
            imports: [RouterTestingModule, ReactiveFormsModule, FormsModule, MaterialModule, NoopAnimationsModule],
            declarations: [NoItemMockComponent, SideMenuComponent,
                TestComponent],
            providers: [
                { provide: PricingService, useValue: pricingServiceSpy },
                { provide: PythonRpcService, useValue: pythonServiceSpy },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });

        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-side-menu"));
        component = de.componentInstance;
        fixture.detectChanges();
    });

    describe("text parameter type", () => {
        it("should work", () => {
            expect(true).toBe(true);
            console.log("hello world", component);
        });
    });

});
