import { Component, DebugElement, OnDestroy } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { I18nTestingModule } from "@batch-flask/core/testing";
import { ElectronTestingModule } from "@batch-flask/electron/testing";
import {
    ButtonsModule,
    DialogService,
    File,
    ToolbarModule,
} from "@batch-flask/ui";
import { FocusSectionModule } from "@batch-flask/ui/focus-section";
import { I18nUIModule } from "@batch-flask/ui/i18n";
import { click, rightClick } from "test/utils/helpers";
import {
    ContextMenuServiceMock,
    MockFileNavigator,
    NotificationServiceMock,
} from "test/utils/mocks";
import { FileTreeViewRowComponent } from "./file-tree-view-row";
import { FileTreeViewComponent } from "./file-tree-view.component";

const files = [
    new File({ name: "foo", isDirectory: true, properties: {} }),
    new File({ name: "foo/bar1.txt", properties: {} }),
    new File({ name: "foo/bar2.txt", properties: {} }),
    new File({ name: "foo/bar3.txt", properties: {} }),
    new File({ name: "deep", isDirectory: true, properties: {} }),
    new File({ name: "deep/dir", isDirectory: true, properties: {} }),
    new File({ name: "deep/dir/file.json", properties: {} }),
    new File({ name: "package.json", properties: {} }),
    new File({ name: "package-lock.json", properties: {} }),
];
@Component({
    template: `
        <bl-file-tree-view
            name="MyTreeView"
            [fileNavigator]="navigator"
            [currentPath]="currentPath"
            (navigate)="navigate($event)">

        </bl-file-tree-view>
    `,
})
class TestComponent implements OnDestroy {
    public navigator: MockFileNavigator;
    public currentPath: string = "";
    public navigate: jasmine.Spy;

    constructor() {
        this.navigator = new MockFileNavigator(files);
        this.navigate = jasmine.createSpy("navigate");
    }

    public ngOnDestroy() {
        this.navigator.dispose();
    }
}

function expectToBeFolderRow(el: DebugElement) {
    const icon = el.query(By.css(".file-icon .fa"));
    const content = el.nativeElement.textContent;
    expect(icon.classes["fa-folder"]).toBe(true, `'${content}' Should be a closed folder`);
    expect(icon.classes["fa-folder-open"]).toBe(false, `'${content}' Should not be an open folder`);
    expect(icon.classes["fa-file"]).toBe(false, `'${content}' Should not be a file`);
}

function expectToBeOpenFolderRow(el: DebugElement) {
    const icon = el.query(By.css(".file-icon .fa"));
    const content = el.nativeElement.textContent;
    expect(icon.classes["fa-folder-open"]).toBe(true, `'${content}' Should be an open folder`);
    expect(icon.classes["fa-folder"]).toBe(false, `'${content}' Should not be a closed folder`);
    expect(icon.classes["fa-file"]).toBe(false, `'${content}' Should not be a file`);
}

function expectToBeFileRow(el: DebugElement) {
    const icon = el.query(By.css(".file-icon .fa"));
    const content = el.nativeElement.textContent;

    expect(icon.classes["fa-file"]).toBe(true, `'${content}' Should be a file`);
    expect(icon.classes["fa-folder"]).toBe(false, `'${content}' Should NOT be a folder`);
    expect(icon.classes["fa-folder-open"]).toBe(false, `'${content}' Should NOT be an open folder`);
}

describe("FileTreeViewComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let de: DebugElement;
    let contextMenuServiceSpy: ContextMenuServiceMock;
    let notificationServiceSpy: NotificationServiceMock;

    function getContent() {
        return de.query(By.css(".tree-view-content"));
    }

    function getRows() {
        return de.queryAll(By.css("bl-file-tree-view-row"));
    }

    beforeEach(() => {
        contextMenuServiceSpy = new ContextMenuServiceMock();
        notificationServiceSpy = new NotificationServiceMock();
        TestBed.configureTestingModule({
            imports: [
                ButtonsModule, FocusSectionModule, ElectronTestingModule,
                ToolbarModule, I18nTestingModule, I18nUIModule,
            ],
            declarations: [FileTreeViewComponent, FileTreeViewRowComponent, TestComponent],
            providers: [
                { provide: DialogService, useValue: null },
                contextMenuServiceSpy.asProvider(),
                notificationServiceSpy.asProvider(),
            ],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-file-tree-view"));
        fixture.detectChanges();

    });

    beforeEach((done) => {
        testComponent.navigator.init().subscribe(() => {
            fixture.detectChanges();
            done();
        });
    });

    it("show the tree view name in the header", () => {
        const header = de.query(By.css(".tree-view-header"));
        expect(header.nativeElement.textContent).toContain("MyTreeView");
    });

    it("container has tabindex 0", () => {
        expect(getContent().attributes.tabindex).toEqual("0");
    });

    it("container has tree role", () => {
        expect(getContent().attributes.role).toEqual("tree");
    });

    it("rows have the treeitem role", () => {
        const rows = getRows();
        expect(rows.length).toBe(4);
        expect(rows[0].attributes.role).toEqual("treeitem");
        expect(rows[1].attributes.role).toEqual("treeitem");
        expect(rows[2].attributes.role).toEqual("treeitem");
        expect(rows[3].attributes.role).toEqual("treeitem");
    });

    it("hide the tree view content when clicking the toolbar caret", () => {
        const caret = de.query(By.css(".tree-view-header .caret"));
        expect(caret.attributes["aria-expanded"]).toEqual("true");
        expect(getContent()).not.toBeFalsy();
        click(caret);
        fixture.detectChanges();
        expect(caret.attributes["aria-expanded"]).toEqual("false");
        expect(getContent()).toBeFalsy();

        click(caret);
        fixture.detectChanges();
        expect(caret.attributes["aria-expanded"]).toEqual("true");
        expect(getContent()).not.toBeFalsy();
    });

    it("list root files and folders alphabetically", () => {
        const rows = getRows();
        expect(rows.length).toBe(4);
        expect(rows[0].nativeElement.textContent).toContain("deep");
        expectToBeFolderRow(rows[0]);
        expect(rows[1].nativeElement.textContent).toContain("foo");
        expectToBeFolderRow(rows[1]);
        expect(rows[2].nativeElement.textContent).toContain("package-lock.json");
        expectToBeFileRow(rows[2]);
        expect(rows[3].nativeElement.textContent).toContain("package.json");
        expectToBeFileRow(rows[3]);
    });

    it("expand folder when clicking on folder row", () => {
        let rows = getRows();
        click(rows[1]);
        fixture.detectChanges();

        rows = getRows();

        expect(rows.length).toBe(7);
        expect(rows[0].nativeElement.textContent).toContain("deep");
        expectToBeFolderRow(rows[0]);
        expect(rows[1].nativeElement.textContent).toContain("foo");
        expectToBeOpenFolderRow(rows[1]);
        expect(rows[2].nativeElement.textContent).toContain("bar1.txt");
        expectToBeFileRow(rows[2]);
        expect(rows[3].nativeElement.textContent).toContain("bar2.txt");
        expectToBeFileRow(rows[3]);
        expect(rows[4].nativeElement.textContent).toContain("bar3.txt");
        expectToBeFileRow(rows[4]);
        expect(rows[5].nativeElement.textContent).toContain("package-lock.json");
        expectToBeFileRow(rows[5]);
        expect(rows[6].nativeElement.textContent).toContain("package.json");
        expectToBeFileRow(rows[6]);
    });

    it("expand nested folder when clicking on folder row", () => {
        let rows = getRows();
        click(rows[0]);
        fixture.detectChanges();

        rows = getRows();

        expect(rows.length).toBe(5);
        expect(rows[0].nativeElement.textContent).toContain("deep");
        expectToBeOpenFolderRow(rows[0]);
        expect(rows[1].nativeElement.textContent).toContain("dir");
        expectToBeFolderRow(rows[1]);
        expect(rows[2].nativeElement.textContent).toContain("foo");
        expectToBeFolderRow(rows[2]);
        expect(rows[3].nativeElement.textContent).toContain("package-lock.json");
        expectToBeFileRow(rows[3]);
        expect(rows[4].nativeElement.textContent).toContain("package.json");
        expectToBeFileRow(rows[4]);

        click(rows[1]);
        fixture.detectChanges();

        rows = getRows();
        expect(rows.length).toBe(6);

        expect(rows[0].nativeElement.textContent).toContain("deep");
        expectToBeOpenFolderRow(rows[0]);
        expect(rows[1].nativeElement.textContent).toContain("dir");
        expectToBeOpenFolderRow(rows[1]);
        expect(rows[2].nativeElement.textContent).toContain("file.json");
        expectToBeFileRow(rows[2]);

    });

    it("collapse expanded folder by clicking caret", () => {
        let rows = getRows();
        click(rows[0]);
        fixture.detectChanges();
        rows = getRows();
        expect(rows.length).toBe(5);

        click(rows[0].query(By.css(".caret")));
        fixture.detectChanges();
        rows = getRows();
        expect(rows.length).toBe(4);
    });

    it("collapse all", () => {
        let rows = getRows();
        click(rows[0]);
        fixture.detectChanges();

        rows = getRows();
        click(rows[2]);
        fixture.detectChanges();

        rows = getRows();
        expect(rows.length).toBe(8);

        click(de.query(By.css(".collapse-all")));
        fixture.detectChanges();

        rows = getRows();
        expect(rows.length).toBe(4);
    });

    it("show context menu when right click", () => {
        const rows = getRows();
        rightClick(rows[1]);

        expect(contextMenuServiceSpy.openMenu).toHaveBeenCalledOnce();
    });
});
