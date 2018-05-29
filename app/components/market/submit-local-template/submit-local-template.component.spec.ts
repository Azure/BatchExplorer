import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { RouterTestingModule } from "@angular/router/testing";
import { BehaviorSubject } from "rxjs";

import { MaterialModule } from "@batch-flask/core";

import { SubmitNcjTemplateComponent } from "app/components/market/submit";
import { SubmitLocalTemplateComponent } from "app/components/market/submit-local-template";
import { NcjTemplateType } from "app/models";
import { NcjTemplateService } from "app/services";

describe("SubmitLocalTemplateComponent", () => {
    let fixture: ComponentFixture<SubmitLocalTemplateComponent>;
    let component: SubmitLocalTemplateComponent;
    let templateServiceSpy: any;
    let activatedRouteSpy: any;

    const queryParameters = {
        templateFile: "job.json",
    };

    beforeEach(() => {
        activatedRouteSpy = {
            queryParams: new BehaviorSubject(queryParameters),
        };

        templateServiceSpy = {
            loadLocalTemplateFile: jasmine.createSpy("loadLocalTemplateFile").and.callFake((path: string) => {
                if (path.contains("job")) {
                    return Promise.resolve({ type: NcjTemplateType.job, template: { parameters: {}, job: {} } });
                } else if (path.contains("pool")) {
                    return Promise.resolve({ type: NcjTemplateType.pool, template: { pool: {} } });
                } else if (path.contains("other")) {
                    return Promise.resolve({ type: NcjTemplateType.unknown, template: null });
                } else {
                    return Promise.reject("couldn't parse template due to error");
                }
            }),
        };

        TestBed.configureTestingModule({
            imports: [RouterTestingModule, ReactiveFormsModule, FormsModule, MaterialModule],
            declarations: [SubmitLocalTemplateComponent, SubmitNcjTemplateComponent],
            providers: [
                { provide: ActivatedRoute, useValue: activatedRouteSpy },
                { provide: NcjTemplateService, useValue: templateServiceSpy },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });

        fixture = TestBed.createComponent(SubmitLocalTemplateComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should report correct breadcrumb text", () => {
        const breadcrumb = SubmitLocalTemplateComponent.breadcrumb({}, { templateFile: "my-template.json" });
        expect(breadcrumb.name).toBe("my-template.json");
        expect(breadcrumb.label).toBe("Local templates");
    });

    it("page title should be correct", () => {
        expect(component.templateFile).toBe("job.json");
        expect(component.title).toBe("Run template at job.json");
    });
});
