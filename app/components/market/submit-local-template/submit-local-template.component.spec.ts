import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatDialogRef } from "@angular/material";
import { MaterialModule } from "@batch-flask/core";
import { SubmitNcjTemplateComponent } from "app/components/market/submit";
import { SubmitLocalTemplateComponent } from "app/components/market/submit-local-template";
import { NcjTemplateType } from "app/models";
import { LocalTemplateService } from "app/services";

fdescribe("SubmitLocalTemplateComponent", () => {
    let fixture: ComponentFixture<SubmitLocalTemplateComponent>;
    let component: SubmitLocalTemplateComponent;
    let templateServiceSpy: any;

    beforeEach(() => {

        templateServiceSpy = {
            parseNcjTemplate: jasmine.createSpy("parseNcjTemplate").and.callFake((templateStr: string) => {
                const template = JSON.parse(templateStr);
                if (templateStr.contains("job")) {
                    return { type: NcjTemplateType.Job, template};
                } else if (templateStr.contains("pool")) {
                    return { type: NcjTemplateType.Pool, template };
                } else if (templateStr.contains("other")) {
                    return { type: NcjTemplateType.Unknown, template: null };
                } else {
                    throw new Error("couldn't parse template due to error");
                }
            }),
        };

        TestBed.configureTestingModule({
            imports: [ReactiveFormsModule, FormsModule, MaterialModule],
            declarations: [SubmitLocalTemplateComponent, SubmitNcjTemplateComponent],
            providers: [
                { provide: LocalTemplateService, useValue: templateServiceSpy },
                { provide: MatDialogRef, useValue: null },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });

        fixture = TestBed.createComponent(SubmitLocalTemplateComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("page title should be correct", () => {
        component.template = `{"metadata": {"description": "foo desc"}, "job": {}}`;
        expect(component.jobTemplate).toEqual({
            metadata: {description: "foo desc"},
            job: {},
        } as any);
        expect(component.title).toBe("Run template foo desc");
    });
});
