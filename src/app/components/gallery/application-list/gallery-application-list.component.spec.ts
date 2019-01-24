import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { I18nTestingModule } from "@batch-flask/core/testing";
import { ClickableComponent } from "@batch-flask/ui";
import { Application } from "app/models";
import { NcjTemplateService } from "app/services";
import { List } from "immutable";
import { BehaviorSubject } from "rxjs";
import { click } from "test/utils/helpers";
import { ApplicationSelection, GalleryApplicationListComponent } from "./gallery-application-list.component";

const applications = [
    new Application({
        id: "maya",
        name: "Maya",
        icon: "fixtures/images/maya.svg",
        description: "maya is a rendering software",
        portfolioId: "portfolio-1",
    }),
    new Application({
        id: "3dsmax",
        name: "3dsmax",
        icon: "fixtures/images/3dsmax.svg",
        description: "3dsmax is a rendering software",
        portfolioId: "portfolio-1",
    }),
    new Application({
        id: "arnold",
        name: "Arnold",
        icon: "fixtures/images/arnold.svg",
        description: "arnold is a renderer",
        portfolioId: "portfolio-2",
    }),
];

@Component({
    template: `
        <bl-gallery-application-list [filter]="filter" [active]="current" (activeChange)="selectApplication($event)">
        </bl-gallery-application-list>
    `,
})
class TestComponent {
    public filter = "";
    public current: ApplicationSelection | null = null;
    public selectApplication = jasmine.createSpy("");
}

describe("GalleryApplicationList", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let de: DebugElement;
    let templateServiceSpy;

    beforeEach(() => {

        templateServiceSpy = {
            applications: new BehaviorSubject<List<Application>>(List(applications)),
        };
        TestBed.configureTestingModule({
            imports: [I18nTestingModule],
            declarations: [GalleryApplicationListComponent, TestComponent, ClickableComponent],
            providers: [
                { provide: NcjTemplateService, useValue: templateServiceSpy },
            ],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-gallery-application-list"));
        fixture.detectChanges();
    });

    it("shows all applications labels", () => {
        const apps = de.queryAll(By.css(".application"));
        expect(apps.length).toBe(4);
        expect(apps[0].query(By.css(".name")).nativeElement.textContent).toContain("gallery.myLibrary");
        expect(apps[1].query(By.css(".name")).nativeElement.textContent).toContain("Maya");
        expect(apps[2].query(By.css(".name")).nativeElement.textContent).toContain("3dsmax");
        expect(apps[3].query(By.css(".name")).nativeElement.textContent).toContain("Arnold");
    });

    it("shows all applications icons", () => {
        const apps = de.queryAll(By.css(".application"));
        expect(apps.length).toBe(4);
        expect(apps[0].query(By.css(".logo")).nativeElement.classList).toContain("fa-book");
        expect(apps[1].query(By.css(".logo")).nativeElement.getAttribute("src")).toEqual(applications[0].icon);
        expect(apps[2].query(By.css(".logo")).nativeElement.getAttribute("src")).toEqual(applications[1].icon);
        expect(apps[3].query(By.css(".logo")).nativeElement.getAttribute("src")).toEqual(applications[2].icon);
    });

    it("fitler", () => {
        testComponent.filter = "m";
        fixture.detectChanges();

        let apps = de.queryAll(By.css(".application"));
        expect(apps.length).toBe(3);
        expect(apps[0].nativeElement.textContent).toContain("gallery.myLibrary");
        expect(apps[1].nativeElement.textContent).toContain("Maya");
        expect(apps[2].nativeElement.textContent).toContain("3dsmax");

        testComponent.filter = "max";
        fixture.detectChanges();

        apps = de.queryAll(By.css(".application"));
        expect(apps.length).toBe(2);
        expect(apps[0].nativeElement.textContent).toContain("gallery.myLibrary");
        expect(apps[1].nativeElement.textContent).toContain("3dsmax");
    });

    it("select the application when clicking on it", () => {
        const apps = de.queryAll(By.css(".application"));
        expect(apps.length).toBe(4);

        click(apps[1]);
        fixture.detectChanges();
        expect(apps[0].classes["active"]).toBeFalsy();
        expect(apps[1].classes["active"]).toBe(true);
        expect(apps[2].classes["active"]).toBeFalsy();
        expect(apps[3].classes["active"]).toBeFalsy();
        expect(testComponent.selectApplication).toHaveBeenCalledOnce();
        expect(testComponent.selectApplication).toHaveBeenCalledWith({
            portfolioId: "portfolio-1",
            applicationId: "maya",
        });
    });
});
