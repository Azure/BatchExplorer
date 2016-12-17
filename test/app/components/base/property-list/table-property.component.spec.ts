import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";

import {
    TablePropertyCellComponent, TablePropertyComponent, TablePropertyHeaderComponent, TablePropertyRowComponent,
} from "app/components/base/property-list";
import { click } from "test/utils/helpers";

@Component({
    template: `
        <bex-table-property label="Files">
            <bex-table-property-header>
                <div tp-column>File path</div>
                <div tp-column>Source</div>
            </bex-table-property-header>
            <bex-table-property-row *ngFor="let file of files">
                <bex-tp-cell [value]="file.path"></tp-cell>
                <bex-tp-cell [value]="file.source"></tp-cell>
            </bex-table-property-row>
        </bex-table-property>
    `,
})
class TestTableComponent {
    public files = [
        { path: "file1.txt", source: "http://github.com/repo/file1.txt" },
        { path: "file2.txt", source: "http://github.com/repo/file2.txt" },
    ];
}

describe("TextPropertyComponent", () => {
    let fixture: ComponentFixture<TestTableComponent>;
    let de: DebugElement;
    let component: TestTableComponent;
    let section: DebugElement;
    let table: TablePropertyComponent;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [TestTableComponent,
                TablePropertyComponent,
                TablePropertyCellComponent,
                TablePropertyHeaderComponent,
                TablePropertyRowComponent,
            ],
        });
        fixture = TestBed.createComponent(TestTableComponent);
        de = fixture.debugElement;
        component = fixture.componentInstance;
        section = de.query(By.css("section"));
        fixture.detectChanges();
        table = de.query(By.css("bex-table-property")).componentInstance;
    });

    it("Should show the label", () => {
        const label = de.query(By.css(".head td.label"));
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
