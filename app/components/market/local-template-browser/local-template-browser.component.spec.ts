import { DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed, fakeAsync, tick } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { RouterTestingModule } from "@angular/router/testing";

import { LocalTemplateBrowserComponent } from "app/components/market/local-template-browser";
import { NcjTemplateType } from "app/models";
import { NcjTemplateService } from "app/services";

describe("LocalTemplateBrowserComponent", () => {
    let fixture: ComponentFixture<LocalTemplateBrowserComponent>;
    let component: LocalTemplateBrowserComponent;
    let de: DebugElement;
    let templateServiceSpy: any;
    let routerSpy: any;

    const mockJobFile: File = { path: "C:\job.json", name: "job.json" } as any;
    const mockPoolFile: File = { path: "C:\pool.json", name: "pool.json" } as any;
    const mockUnkFile: File = { path: "C:\other.json", name: "other.json" } as any;

    beforeEach(() => {
        routerSpy = {
            navigate: jasmine.createSpy("router.navigate"),
        };

        templateServiceSpy = {
            loadLocalTemplateFile: jasmine.createSpy("loadLocalTemplateFile").and.callFake((path: string) => {
                if (path.contains("job")) {
                    return Promise.resolve({ type: NcjTemplateType.job, template: {} });
                } else if (path.contains("pool")) {
                    return Promise.resolve({ type: NcjTemplateType.pool, template: {} });
                } else if (path.contains("other")) {
                    return Promise.resolve({ type: NcjTemplateType.unknown, template: {} });
                } else {
                    return Promise.reject("couldn't parse template due to error");
                }
            }),
        };

        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [LocalTemplateBrowserComponent],
            providers: [
                { provide: Router, useValue: routerSpy },
                { provide: NcjTemplateService, useValue: templateServiceSpy },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });

        fixture = TestBed.createComponent(LocalTemplateBrowserComponent);
        component = fixture.componentInstance;
        de = fixture.debugElement;
        fixture.detectChanges();
    });

    it("should report correct breadcrumb text", () => {
        expect(LocalTemplateBrowserComponent.breadcrumb().name).toBe("Local templates");
    });

    describe("pick template file", () => {
        it("identifies job template", fakeAsync(() => {
            component.pickTemplateFile({ target: { files: [mockJobFile] } });
            tick();

            fixture.detectChanges();
            expect(component.pickedTemplateFile.name).toBe(mockJobFile.name);
            expect(component.pickedTemplateFile.path).toBe(mockJobFile.path);
            expect(component.templateType).toBe(NcjTemplateType.job);
            expect(component.valid).toBe(true);

            const subtitle = de.query(By.css(".subtitle")).nativeElement;
            expect(subtitle.textContent).toContain("This is a Job template");
        }));

        it("identifies pool template", fakeAsync(() => {
            component.pickTemplateFile({ target: { files: [mockPoolFile] } });
            tick();

            fixture.detectChanges();
            expect(component.pickedTemplateFile.name).toBe(mockPoolFile.name);
            expect(component.pickedTemplateFile.path).toBe(mockPoolFile.path);
            expect(component.templateType).toBe(NcjTemplateType.pool);
            expect(component.valid).toBe(true);

            const subtitle = de.query(By.css(".subtitle")).nativeElement;
            expect(subtitle.textContent).toContain("This is a Pool template");
        }));

        it("handles unknown template", fakeAsync(() => {
            component.pickTemplateFile({ target: { files: [mockUnkFile] } });
            tick();

            fixture.detectChanges();
            expect(component.pickedTemplateFile.name).toBe(mockUnkFile.name);
            expect(component.pickedTemplateFile.path).toBe(mockUnkFile.path);
            expect(component.templateType).toBe(NcjTemplateType.unknown);
            expect(component.valid).toBe(false);

            const subtitle = de.query(By.css(".subtitle")).nativeElement;
            expect(subtitle.textContent).toContain("Couldn't determine the type of template");
            expect(de.query(By.css(".template-picker.picked.error"))).not.toBeFalsy();
        }));

        it("handles error reading template", fakeAsync(() => {
            component.pickTemplateFile({
                target: {
                    files: [{ path: "C:\bob.png", name: "bob.png" }],
                },
            });
            tick();

            fixture.detectChanges();
            expect(component.pickedTemplateFile.name).toBe("bob.png");
            expect(component.pickedTemplateFile.path).toBe("C:\bob.png");
            expect(component.templateType).toBe(null);
            expect(component.valid).toBe(false);
            expect(component.error).toBe("couldn't parse template due to error");
            expect(de.query(By.css(".template-picker.picked.error"))).not.toBeFalsy();
        }));
    });

    describe("run this template", () => {
        it("doesnt redirect if no template picked", () => {
            component.runThisTemplate();
            fixture.detectChanges();

            expect(routerSpy.navigate).not.toHaveBeenCalled();
        });

        it("navigates to submit form with template", fakeAsync(() => {
            component.pickTemplateFile({ target: { files: [mockJobFile] } });
            tick();

            fixture.detectChanges();
            component.runThisTemplate();
            expect(routerSpy.navigate).toHaveBeenCalledTimes(1);
        }));
    });
});
