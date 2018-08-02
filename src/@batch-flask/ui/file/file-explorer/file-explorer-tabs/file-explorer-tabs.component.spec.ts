import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { MouseButton } from "@batch-flask/core";
import { ClickableComponent, File } from "@batch-flask/ui";
import { click, mouseup } from "test/utils/helpers";
import { ContextMenuServiceMock, MockFileNavigator } from "test/utils/mocks";
import { CurrentNode, FileExplorerWorkspace } from "..";
import { FileExplorerTabsComponent } from "./file-explorer-tabs.component";

@Component({
    template: `<bl-file-explorer-tabs [workspace]="workspace"></bl-file-explorer-tabs>`,
})
class TestComponent {
    public workspace;

    public fileNavigator: MockFileNavigator = null;
}

const files = [
    new File({ name: "foo/bar1.txt" }),
    new File({ name: "foo/bar2.txt" }),
    new File({ name: "foo/bar3.txt" }),
    new File({ name: "deep/in/dir/file.json" }),
    new File({ name: "package.json" }),
    new File({ name: "package-lock.json" }),
];

describe("FileExplorerTabsComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let component: FileExplorerTabsComponent;
    let de: DebugElement;
    let workspace: FileExplorerWorkspace;
    let navigator: MockFileNavigator;
    let contextMenuSpy: ContextMenuServiceMock;
    let currentNode: CurrentNode;

    beforeEach(() => {
        contextMenuSpy = new ContextMenuServiceMock();
        navigator = new MockFileNavigator(files);
        workspace = new FileExplorerWorkspace(navigator);

        workspace.currentNode.subscribe((node) => {
            currentNode = node;
        });

        TestBed.configureTestingModule({
            imports: [],
            declarations: [FileExplorerTabsComponent, TestComponent, ClickableComponent],
            providers: [
                contextMenuSpy.asProvider(),
            ],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        testComponent.workspace = workspace;
        de = fixture.debugElement.query(By.css("bl-file-explorer-tabs"));
        component = de.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        navigator.dispose();
        workspace.dispose();
    });

    it("show 1 open tabs when no open files (table view tab)", () => {
        const tabs = de.queryAll(By.css(".tab"));
        expect(tabs.length).toBe(1);
        expect(tabs[0].nativeElement.classList).toContain("main");
    });

    it("table view is active by default", () => {
        const tabs = de.queryAll(By.css(".tab.main"));
        expect(tabs.length).toBe(1);
        expect(tabs[0].nativeElement.classList).toContain("active");
    });

    describe("when files are open", () => {
        beforeEach(() => {
            workspace.openFile("foo/bar1.txt");
            workspace.openFile("package.json");
            workspace.openFile("package-lock.json");
            fixture.detectChanges();
        });

        it("show a tab per opened file plus table view tab", () => {
            const tabs = de.queryAll(By.css(".tab"));
            expect(tabs.length).toBe(4);
        });

        it("each tab show the filename", () => {
            const tabs = de.queryAll(By.css(".tab"));
            expect(tabs.length).toBe(4);
            expect(tabs[1].nativeElement.textContent).toContain("bar1.txt");
            expect(tabs[2].nativeElement.textContent).toContain("package.json");
            expect(tabs[3].nativeElement.textContent).toContain("package-lock.json");
        });

        it("activate a file when clicking on it", () => {
            const tabs = de.queryAll(By.css(".tab"));

            click(tabs[2]);
            fixture.detectChanges();
            expect(tabs[0].nativeElement.classList).not.toContain("active");
            expect(tabs[1].nativeElement.classList).not.toContain("active");
            expect(tabs[2].nativeElement.classList).toContain("active");
            expect(tabs[3].nativeElement.classList).not.toContain("active");

            expect(currentNode.path).toEqual("package.json");
        });

        it("middle click on a tab closes it", () => {
            let tabs = de.queryAll(By.css(".tab"));

            mouseup(tabs[1], MouseButton.middle);
            fixture.detectChanges();
            tabs = de.queryAll(By.css(".tab"));
            expect(tabs.length).toBe(3);
            expect(tabs[1].nativeElement.textContent).toContain("package.json");
            expect(tabs[2].nativeElement.textContent).toContain("package-lock.json");
        });

        it("click on close icon close the tab", () => {
            let tabs = de.queryAll(By.css(".tab"));

            click(tabs[2].query(By.css(".tab-close")));
            fixture.detectChanges();
            tabs = de.queryAll(By.css(".tab"));
            expect(tabs.length).toBe(3);
            expect(tabs[1].nativeElement.textContent).toContain("bar1.txt");
            expect(tabs[2].nativeElement.textContent).toContain("package-lock.json");
        });

        it("closing current active tab goes to previous", () => {
            let tabs = de.queryAll(By.css(".tab"));
            click(tabs[2]);
            fixture.detectChanges();
            mouseup(tabs[2], MouseButton.middle);
            fixture.detectChanges();
            tabs = de.queryAll(By.css(".tab"));
            expect(tabs.length).toBe(3);
            expect(tabs[1].nativeElement.textContent).toContain("bar1.txt");
            expect(tabs[2].nativeElement.textContent).toContain("package-lock.json");
            expect(tabs[0].nativeElement.classList).not.toContain("active");
            expect(tabs[1].nativeElement.classList).toContain("active");
            expect(tabs[2].nativeElement.classList).not.toContain("active");
        });

        it("close all tabs", () => {
            component.closeAllTabs();
            fixture.detectChanges();

            const tabs = de.queryAll(By.css(".tab"));
            expect(tabs.length).toBe(1);

            expect(currentNode.path).toBe("");

            expect(tabs[0].nativeElement.classList).toContain("active");
        });
    });
});
