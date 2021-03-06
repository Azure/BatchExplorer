import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { I18nTestingModule } from "@batch-flask/core/testing";
import { CloudFileService, PropertyListModule } from "@batch-flask/ui";
import { ResourceFile } from "app/models";
import { List } from "immutable";
import { click } from "test/utils/helpers";
import { ResourceFilesPropertiesComponent } from "./resource-files-properties.component";

const file1 = new ResourceFile({ filePath: "local/foo", httpUrl: "https://example.com/some/file.sh" });
const file2 = new ResourceFile({
    autoStorageContainerName: "container-1",
    blobPrefix: "foo/bar",
    filePath: "other/local",
});
const file3 = new ResourceFile({
    storageContainerUrl: "https://foo.westus.blob.azure.com?sig=abc",
    blobPrefix: "foo/bar",
    filePath: "other/local",
});

@Component({
    template: `
        <bl-resource-files-properties [files]="files"></bl-resource-files-properties>
    `,
})
class TestComponent {
    public files: List<ResourceFile> | null = null;
}

describe("ResourceFilesPropertiesComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let de: DebugElement;
    let cloudFileServiceSpy;

    beforeEach(() => {
        cloudFileServiceSpy = {
            openFile: jasmine.createSpy("openFile"),
        };

        TestBed.configureTestingModule({
            imports: [PropertyListModule, I18nTestingModule],
            declarations: [ResourceFilesPropertiesComponent, TestComponent],
            providers: [
                { provide: CloudFileService, useValue: cloudFileServiceSpy },
            ],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-resource-files-properties"));
        fixture.detectChanges();
    });

    function getTableEl() {
        return de.query(By.css("bl-table-property"));
    }

    it("shows no files when passed null", () => {
        testComponent.files = null;
        fixture.detectChanges();

        const tableEl = getTableEl();
        expect(tableEl).toBeFalsy();

        const el = de.query(By.css("bl-text-property"));
        expect(el).not.toBeFalsy();
        expect(el.nativeElement.textContent).toContain("resource-files-properties.none");
    });

    it("shows no files when passed empty list", () => {
        testComponent.files = List([]);
        fixture.detectChanges();

        const tableEl = getTableEl();
        expect(tableEl).toBeFalsy();

        const el = de.query(By.css("bl-text-property"));
        expect(el).not.toBeFalsy();
        expect(el.nativeElement.textContent).toContain("resource-files-properties.none");
    });

    describe("when files are provided", () => {
        let tableEl: DebugElement;

        beforeEach(() => {
            testComponent.files = List([file1, file2, file3]);
            fixture.detectChanges();
            const el = de.query(By.css("bl-text-property"));
            expect(el).toBeFalsy();

            tableEl = getTableEl();
            expect(tableEl).not.toBeFalsy();
            tableEl.componentInstance.expand();
            fixture.detectChanges();
        });

        it("shows all the files", () => {
            const rows = tableEl.queryAll(By.css("tr:not(.head)"));
            expect(rows.length).toBe(3);
            expect(rows[0].nativeElement.textContent).toContain(file1.filePath);
            expect(rows[0].nativeElement.textContent).toContain(file1.httpUrl);

            expect(rows[1].nativeElement.textContent).toContain(file2.filePath);
            expect(rows[1].nativeElement.textContent).toContain(file2.autoStorageContainerName);
            expect(rows[1].nativeElement.textContent).toContain(file2.blobPrefix);

            expect(rows[2].nativeElement.textContent).toContain(file3.filePath);
            expect(rows[2].nativeElement.textContent).toContain(file3.storageContainerUrl);
            expect(rows[2].nativeElement.textContent).toContain(file3.blobPrefix);

            const openCell = rows[0].query(By.css("bl-tp-plain-cell"));
            expect(openCell).not.toBeFalsy();
            click(openCell);
        });

        it("lets you view the content of single files", () => {
            const rows = tableEl.queryAll(By.css("tr:not(.head)"));
            expect(rows.length).toBe(3);

            const openCell = rows[0].query(By.css("bl-tp-plain-cell"));
            expect(openCell).not.toBeFalsy();
            click(openCell);
            expect(cloudFileServiceSpy.openFile).toHaveBeenCalledOnce();
            expect(cloudFileServiceSpy.openFile).toHaveBeenCalledWith(file1.httpUrl);
        });
    });
});
