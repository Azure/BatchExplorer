import { DOWN_ARROW } from "@angular/cdk/keycodes";
import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed, fakeAsync, tick } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { MatAutocompleteModule, MatAutocompleteTrigger, _MatAutocompleteBase } from "@angular/material/autocomplete";
import { By } from "@angular/platform-browser";
import { KeyCode } from "@batch-flask/core/keys";
import { I18nTestingModule } from "@batch-flask/core/testing";
import { File } from "@batch-flask/ui/file/file.model";
import { List } from "immutable";
import { of } from "rxjs";
import { keydown, updateInput } from "test/utils/helpers";
import { MockFileNavigator } from "test/utils/mocks";
import { FilePathNavigatorComponent } from "./file-path-navigator.component";

const files = [
    new File({ name: "foo/bar1.txt" }),
    new File({ name: "foo/bar2.txt" }),
    new File({ name: "foo/bar3.txt" }),
    new File({ name: "deep/in/dir/file.json" }),
    new File({ name: "package.json" }),
    new File({ name: "package-lock.json" }),
];

@Component({
    template: `
        <bl-file-path-navigator [navigator]="navigator" [path]="path" [name]="name" (navigate)="navigate($event)">
        </bl-file-path-navigator>
    `,
})
class TestComponent {
    public navigator: MockFileNavigator = new MockFileNavigator(files);
    public name = "Custom";
    public path = "";
    public navigate = jasmine.createSpy("navigate");
}

describe("FilePathNavigatorComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let component: FilePathNavigatorComponent;
    let de: DebugElement;
    let inputEl: DebugElement;

    // Using the abstract base class here looks odd, but it matches the typings of
    // MatAutocompleteTrigger.autocomplete. In reality this is an instance of MatAutocomplete.
    let autocomplete: _MatAutocompleteBase;

    function setup() {

        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-file-path-navigator"));
        component = de.componentInstance;
        fixture.detectChanges();
        inputEl = de.query(By.css("input"));
        autocomplete = de.query(By.directive(MatAutocompleteTrigger)).injector.get(MatAutocompleteTrigger).autocomplete;
    }

    beforeEach( () => {
        TestBed.configureTestingModule({
            imports: [MatAutocompleteModule, ReactiveFormsModule, I18nTestingModule],
            declarations: [FilePathNavigatorComponent, TestComponent],
        });
        setup();
    });

    it("shows the path in the input", async () => {
        expect(inputEl.nativeElement.value).toEqual("");
        testComponent.path = "deep/";
        fixture.detectChanges();
        await fixture.whenStable();
        expect(inputEl.nativeElement.value).toEqual("deep/");
    });

    it("shows name before the input", async () => {
        expect(de.query(By.css(".prefix")).nativeElement.textContent).toContain("Custom");
    });

    it("map all the options", async () => {
        expect(autocomplete.options.length).toEqual(files.length);
    });

    it("propose autocomplete paths when typeing paths ", fakeAsync(() => {
        setup();
        const listFilesSpy = spyOn(testComponent.navigator, "listFiles").and.returnValue(of(List([files[4]])));
        updateInput(inputEl, "deep/");
        tick(50); // Debounce time
        fixture.detectChanges();
        expect(listFilesSpy).toHaveBeenCalledOnce();
        expect(listFilesSpy).toHaveBeenCalledWith("deep/", 5);
        expect(component.availablePaths.toArray()).toEqual([files[4]]);
        fixture.destroy();
    }));

    it("output the current path when pressing enter", () => {
        updateInput(inputEl, "invalid/file");
        fixture.detectChanges();
        keydown(de, null, KeyCode.Enter);
        expect(testComponent.navigate).toHaveBeenCalledOnce();
        expect(testComponent.navigate).toHaveBeenCalledWith("invalid/file");
    });

    it("update the input with the active autocomplete when pressing ArrowRight", async () => {
        inputEl.nativeElement.focus();
        fixture.detectChanges();
        keydown(inputEl, null, KeyCode.ArrowDown, DOWN_ARROW);
        keydown(inputEl, null, KeyCode.ArrowDown, DOWN_ARROW);
        keydown(de, null, KeyCode.ArrowRight);
        fixture.detectChanges();
        await fixture.whenStable();
        expect(inputEl.nativeElement.value).toEqual("foo/bar2.txt");
    });
});
