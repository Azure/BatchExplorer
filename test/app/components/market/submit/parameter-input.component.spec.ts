import { Component, DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";

import { FormControl } from "@angular/forms";
import { ParameterInputComponent } from "app/components/market/submit";
import { NcjParameterWrapper } from "app/components/market/submit";
import { NcjParameterRawType } from "app/models";

@Component({
    template: `
        <bl-parameter-input [formControl]="paramControl" [parameter]="param" [parameterValues]="paramValue">
        </bl-parameter-input>
    `,
})
class TestComponent {
    public paramControl = new FormControl("blender-render-movie-213wads");

    public param = new NcjParameterWrapper("jobName", {
        defaultValue: "blender-render-movie-",
        type: NcjParameterRawType.string,
        metadata : {
            description: "The prefix of the name of the Azure Batch job, also used to prefix rendered outputs",
        },
        allowedValues: [],
    });

    public paramValue = {
        blendFile: "scene.blend",
        frameEnd: 4,
        frameStart: 1,
        jobName: "blender-render-movie-213wads",
        outputFileGroup: "blender-outputs",
        sceneData: "blender-data",
    };
}

fdescribe("ParameterInputComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let component: ParameterInputComponent;
    let de: DebugElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            declarations: [ParameterInputComponent, TestComponent],
            schemas: [NO_ERRORS_SCHEMA],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-parameter-input"));
        component = de.componentInstance;
        fixture.detectChanges();
    });

    describe("1st tests", () => {
        it("true is true", () => expect(true).toBe(true));
    });
});
