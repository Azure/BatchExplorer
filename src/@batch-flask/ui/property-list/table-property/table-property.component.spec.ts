import { Component, DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";

import { ButtonComponent } from "@batch-flask/ui/buttons";
import { ClipboardService } from "@batch-flask/electron";
import { PermissionService } from "@batch-flask/ui/permission";
import { click } from "test/utils/helpers";
import {
    TablePropertyCellComponent, TablePropertyComponent, TablePropertyHeaderComponent, TablePropertyRowComponent,
} from "./table-property.component";

// tslint:disable:trackBy-function
@Component({
    template: `
        <bl-table-property label="Files">
            <bl-table-property-header>
                <div tp-column>File path</div>
                <div tp-column>Source</div>
            </bl-table-property-header>
            <bl-table-property-row *ngFor="let file of files">
                <bl-tp-cell [value]="file.path"></bl-tp-cell>
                <bl-tp-cell [value]="file.source"></bl-tp-cell>
            </bl-table-property-row>
        </bl-table-property>
    `,
})
class TestTableComponent {
    public files = [
        { path: "file1.txt", source: "http://github.com/repo/file1.txt" },
        { path: "file2.txt", source: "http://github.com/repo/file2.txt" },
    ];
}

describe("TablePropertyComponent", () => {
    let fixture: ComponentFixture<TestTableComponent>;
    let de: DebugElement;
    let component: TestTableComponent;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NoopAnimationsModule],
            declarations: [TestTableComponent,
                TablePropertyComponent,
                TablePropertyCellComponent,
                TablePropertyHeaderComponent,
                TablePropertyRowComponent,
                ButtonComponent,
            ],
            providers: [
                { provide: PermissionService, useValue: null },
                { provide: ClipboardService, useValue: {} },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });
        fixture = TestBed.createComponent(TestTableComponent);
        de = fixture.debugElement;
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("Should show the label", () => {
        const label = de.query(By.css("[propertyLabel]"));
        expect(label.nativeElement.textContent).toContain("Files");
    });

    describe("when there is 2 or less files", () => {
        it("should not show the expand button", () => {
            const expandContainer = de.query(By.css(".expand-container"));
            expect(expandContainer).toBeNull();
        });

        it("all the rows should be displayed", () => {
            expect(de.nativeElement.textContent).toContain("file1.txt");
            expect(de.nativeElement.textContent).toContain("file2.txt");
            expect(de.nativeElement.textContent).toContain("http://github.com/repo/file1.txt");
            expect(de.nativeElement.textContent).toContain("http://github.com/repo/file2.txt");
        });
    });

    describe("when there is more than 2 files", () => {
        beforeEach(() => {
            component.files.push({ path: "file3.txt", source: "http://github.com/repo/file3.txt" });
            fixture.detectChanges();
        });

        it("should show the expand button", () => {
            const expandContainer = de.query(By.css(".expand-container"));
            expect(expandContainer).not.toBeNull();
            const expandBtn = expandContainer.query(By.css(".expand"));
            const collapseBtn = expandContainer.query(By.css(".collapse"));

            expect(expandBtn).not.toBeNull();
            expect(collapseBtn).toBeNull();
        });

        it("should only show the first 2 files", () => {
            expect(de.nativeElement.textContent).toContain("file1.txt");
            expect(de.nativeElement.textContent).toContain("file2.txt");
            expect(de.nativeElement.textContent).toContain("http://github.com/repo/file1.txt");
            expect(de.nativeElement.textContent).toContain("http://github.com/repo/file2.txt");

            expect(de.nativeElement.textContent).not.toContain("file3.txt");
            expect(de.nativeElement.textContent).not.toContain("http://github.com/repo/file3.txt");
        });

        it("should expand when click expand button", () => {
            const expandBtn = de.query(By.css(".expand"));

            click(expandBtn);
            fixture.detectChanges();

            expect(de.nativeElement.textContent).toContain("file1.txt");
            expect(de.nativeElement.textContent).toContain("file2.txt");
            expect(de.nativeElement.textContent).toContain("file3.txt");
            expect(de.nativeElement.textContent).toContain("http://github.com/repo/file1.txt");
            expect(de.nativeElement.textContent).toContain("http://github.com/repo/file2.txt");
            expect(de.nativeElement.textContent).toContain("http://github.com/repo/file3.txt");

            const collapseBtn = de.query(By.css(".collapse"));
            expect(collapseBtn).not.toBeNull();
            click(collapseBtn);
            fixture.detectChanges();
            expect(de.nativeElement.textContent).not.toContain("file3.txt");
            expect(de.nativeElement.textContent).not.toContain("http://github.com/repo/file3.txt");
        });
    });
});
