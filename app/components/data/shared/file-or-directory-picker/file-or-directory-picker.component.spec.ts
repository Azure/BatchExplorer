import { Component, DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed, fakeAsync, tick } from "@angular/core/testing";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule, By } from "@angular/platform-browser";

import { EditableTableColumnComponent, EditableTableComponent } from "@batch-flask/ui/form/editable-table";
import { FileSystemService } from "app/services";
import { FileOrDirectoryPickerComponent } from "./file-or-directory-picker.component";

@Component({
    template: `<bl-file-or-directory-picker [formControl]="paths"></bl-file-or-directory-picker>`,
})
class TestComponent {
    public paths = new FormControl([]);
}

fdescribe("FileOrDirectoryPickerComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let component: FileOrDirectoryPickerComponent;
    let de: DebugElement;
    let fsSpy;

    beforeEach(() => {
        fsSpy = {
            exists: jasmine.createSpy("fs.exists").and.callFake((path) => {
                return Promise.resolve(path === "/Users/test/files");
            }),
        };
        TestBed.configureTestingModule({
            imports: [ReactiveFormsModule, BrowserModule],
            declarations: [
                FileOrDirectoryPickerComponent,
                TestComponent,
                EditableTableComponent,
                EditableTableColumnComponent,
            ],
            providers: [
                { provide: FileSystemService, useValue: fsSpy },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-file-or-directory-picker"));
        component = de.componentInstance;
        fixture.detectChanges();
    });

    it("Validate valid paths", fakeAsync(() => {
        testComponent.paths.setValue([
            { path: "/Users/test/files" },
        ]);
        fixture.detectChanges();
        tick();

        expect(testComponent.paths.valid).toBe(true);
        expect(testComponent.paths.status).toBe("VALID");
    }));

    it("Validate invalid paths", fakeAsync(() => {
        testComponent.paths.setValue([
            { path: "/invalid" },
        ]);
        fixture.detectChanges();
        tick();

        expect(testComponent.paths.valid).toBe(false);
        expect(testComponent.paths.status).toBe("INVALID");
    }));

    it("Validate at least one invalid paths", fakeAsync(() => {
        testComponent.paths.setValue([
            { path: "/Users/test/files" },
            { path: "/invalid" },
        ]);
        fixture.detectChanges();
        tick();

        expect(testComponent.paths.valid).toBe(false);
        expect(testComponent.paths.status).toBe("INVALID");
    }));
});
