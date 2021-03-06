import { Component, DebugElement, Injector, forwardRef } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { RouterTestingModule } from "@angular/router/testing";
import { I18nTestingModule } from "@batch-flask/core/testing";
import { click } from "test/utils/helpers";
import { ListBaseComponent } from "../abstract-list";
import { ButtonsModule } from "../buttons";
import { ScrollableModule } from "../scrollable";
import { SplitPaneModule } from "../split-pane";
import { BrowseLayoutAdvancedFilterDirective } from "./browse-layout-advanced-filter";
import { BrowseLayoutListDirective } from "./browse-layout-list";
import { BrowseLayoutComponent } from "./browse-layout.component";
import { ToggleFilterButtonComponent } from "./toggle-filter-button";

@Component({
    selector: "bl-fake-list",
    template: `
    `,
    providers: [{
        provide: ListBaseComponent,
        useExisting: forwardRef(() => FakeListComponent),
    }],
})
class FakeListComponent extends ListBaseComponent {
    constructor(injector: Injector) {
        super(injector);
    }
}

@Component({
    template: `
        <bl-browse-layout>
            <div blBrowseLayoutTitle>
                Jobs
            </div>
            <div blBrowseLayoutButtons>
            </div>
            <bl-fake-list blBrowseLayoutList></bl-fake-list>
            <div blBrowseLayoutAdvancedFilter >
                Advanced filter contents
            </div>
        </bl-browse-layout>
    `,
})
class TestComponent {
}

describe("BrowseLayoutComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let fakeList: FakeListComponent;
    let de: DebugElement;

    let advFilterEl: DebugElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                ScrollableModule,
                ButtonsModule,
                SplitPaneModule,
                FormsModule,
                ReactiveFormsModule,
                RouterTestingModule,
                I18nTestingModule,
            ],
            declarations: [
                BrowseLayoutComponent,
                TestComponent,
                FakeListComponent,
                BrowseLayoutComponent,
                BrowseLayoutListDirective,
                ToggleFilterButtonComponent,
                BrowseLayoutAdvancedFilterDirective,
            ],
        });
        fixture = TestBed.createComponent(TestComponent);
        de = fixture.debugElement.query(By.css("bl-browse-layout"));
        fixture.detectChanges();

        fakeList = de.query(By.directive(FakeListComponent)).componentInstance;
        advFilterEl = de.query(By.css(".advanced-filter-content"));
    });

    describe("When the advanced filter is opened", () => {
        beforeEach(async () => {
            click(de.query(By.css("bl-toggle-filter-button bl-clickable")));
            fixture.detectChanges();
            await fixture.whenStable();
        });

        it("has the advanced filter open", () => {
            expect(advFilterEl).toBeVisible();
        });

        it("close the advanced filters when selecting an item", () => {
            fakeList.activeItemChange.emit("foo");
            fixture.detectChanges();
            expect(advFilterEl).not.toBeVisible();
        });
    });
});
