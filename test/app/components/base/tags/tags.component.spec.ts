import { Component, DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { List } from "immutable";
import { Observable } from "rxjs";

import { TagsComponent } from "app/components/base/tags";
import { click } from "test/utils/helpers";

@Component({
    template: `<bl-tags [tags]="tags" [editable]="editable" [save]="save"></bl-tags>`,
})
class TestComponent {
    public tags = List(["tag1", "tag2"]);
    public editable = false;

    public save: jasmine.Spy;
}

describe("TagsComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let component: TagsComponent;
    let de: DebugElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            declarations: [TagsComponent, TestComponent],
            schemas: [NO_ERRORS_SCHEMA],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        testComponent.save = jasmine.createSpy("save").and.returnValue(Observable.of(true));
        de = fixture.debugElement.query(By.css("bl-tags"));
        component = de.componentInstance;
        fixture.detectChanges();
    });

    it("should show all tabs", () => {
        const tagList = de.query(By.css(".tag-list"));
        expect(tagList).not.toBeFalsy();
        const tags = tagList.queryAll(By.css(".tag"));

        expect(tags.length).toBe(2);
        expect(tags[0].nativeElement.textContent).toContain("tag1");
        expect(tags[1].nativeElement.textContent).toContain("tag2");
    });

    describe("when not editable", () => {

        it("should should not show the edit button", () => {
            const editButton = de.query(By.css(".edit"));
            expect(editButton).toBeFalsy();
        });

        it("should should not show the save or cancel button", () => {
            const saveButton = de.query(By.css(".save"));
            expect(saveButton).toBeFalsy();

            const cancelButton = de.query(By.css(".cancel"));
            expect(cancelButton).toBeFalsy();
        });
    });

    describe("when editable", () => {
        beforeEach(() => {
            testComponent.editable = true;
            fixture.detectChanges();
        });

        it("should should show the edit button", () => {
            const editButton = de.query(By.css(".edit"));
            expect(editButton).not.toBeFalsy();
        });

        it("should should not show the save or cancel button at start", () => {
            const saveButton = de.query(By.css(".save"));
            expect(saveButton).toBeFalsy();

            const cancelButton = de.query(By.css(".cancel"));
            expect(cancelButton).toBeFalsy();
        });

        describe("when clicking on edit button", () => {
            beforeEach(() => {
                const editButton = de.query(By.css(".edit"));
                click(editButton);
                fixture.detectChanges();
            });

            it("should hide the edit button", () => {
                const editButton = de.query(By.css(".edit"));
                expect(editButton).toBeFalsy();
            });

            it("should should now show the save or cancel button", () => {
                const saveButton = de.query(By.css(".save"));
                expect(saveButton).not.toBeFalsy();

                const cancelButton = de.query(By.css(".cancel"));
                expect(cancelButton).not.toBeFalsy();
            });

            it("should show the form when clicking on edit", () => {
                const input = de.query(By.css("input"));
                expect(input).not.toBeFalsy();
                expect(component.tagEditString).toEqual("tag1,tag2");
            });

            it("should call save with the new values", () => {
                component.tagEditString = "tag1,tag3,tag4";
                const saveButton = de.query(By.css(".save"));
                expect(saveButton).not.toBeFalsy();
                click(saveButton);
                expect(testComponent.save).toHaveBeenCalledOnce();
                expect(testComponent.save).toHaveBeenCalledWith(List(["tag1", "tag3", "tag4"]));

                // SHould now show the edit button again
                fixture.detectChanges();
                const editButton = de.query(By.css(".edit"));
                expect(editButton).not.toBeFalsy();
            });
        });
    });
});
