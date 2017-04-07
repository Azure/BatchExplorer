import { Component, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { RouterTestingModule } from "@angular/router/testing";

import { NodeFileListComponent } from "app/components/file/browse";
import { File } from "app/models";
import { FileService } from "app/services";
import { Filter, FilterBuilder } from "app/utils/filter-builder";
import { RxMockListProxy } from "test/utils/mocks";

@Component({
    template: `
        <bl-node-file-list [poolId]="poolId" [nodeId]="nodeId" [folder]="folder" [filter]="filter">
        </bl-node-file-list>
    `,
})
class TestComponent {
    public poolId: string;
    public nodeId: string;
    public filter: Filter;
    public folder: string;
}

describe("NodeFileListComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let component: NodeFileListComponent;
    let nodeServiceSpy: any;
    let listProxy: RxMockListProxy<any, File>;

    beforeEach(() => {
        listProxy = new RxMockListProxy(File, {
            cacheKey: "url",
            items: [
                new File({ name: "file1.txt", url: "http://example.com/file1.txt", properties: { contentLength: 1 } }),
                new File({ name: "file2.txt", url: "http://example.com/file2.txt", properties: { contentLength: 1 } }),
                new File({ name: "file3.txt", url: "http://example.com/file3.txt", properties: { contentLength: 1 } }),
            ],
        });

        nodeServiceSpy = {
            listFromComputeNode: () => listProxy,
        };

        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [NodeFileListComponent, TestComponent],
            providers: [
                { provide: FileService, useValue: nodeServiceSpy },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });

        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;

        component = fixture.debugElement.query(By.css("bl-node-file-list")).componentInstance;
        component.quickList = false;
        component.manualLoading = true;
        testComponent.poolId = "pool-1";
        testComponent.nodeId = "node-1";
        fixture.detectChanges();
    });

    it("should change the params of the list proxy when changing pool or node", () => {
        testComponent.poolId = "pool-2";
        fixture.detectChanges();
        expect(listProxy.params).toEqual({ poolId: "pool-2", nodeId: "node-1" });

        testComponent.nodeId = "node-2";
        fixture.detectChanges();

        expect(listProxy.params).toEqual({ poolId: "pool-2", nodeId: "node-2" });
    });

    describe("setup the filter correctly", () => {
        it("doesn't filter when both folder and filter are empty", () => {
            expect(listProxy.options.original).toEqual({});
            expect(listProxy.options.isEmpty()).toBe(true);
        });

        it("filter by folder when folder is specify and filter is empty", () => {
            testComponent.folder = "startup";
            fixture.detectChanges();

            expect(listProxy.options.filter).toEqual(`startswith(name, 'startup')`);
        });

        it("use the filter when provided and folder is not there", () => {
            testComponent.filter = FilterBuilder.prop("name").startswith("something");
            fixture.detectChanges();

            expect(listProxy.options.filter).toEqual(`startswith(name, 'something')`);
        });

        it("merge the folder and filter when both are provided", () => {
            testComponent.folder = "startup";
            testComponent.filter = FilterBuilder.prop("name").startswith("something");
            fixture.detectChanges();

            expect(listProxy.options.filter).toEqual( `startswith(name, 'startup/something')`);
        });
    });
});
