import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";

import { FileContentComponent } from "app/components/file/details";

@Component({
    template: `<bl-file-content [poolId]="poolId" [nodeId]="nodeId" [filename]="filename"></bl-file-content>`,
})
class TestComponent {
    public poolId = "pool-1";
    public nodeId = "pool-1";
    public filename = "some.txt";
}

fdescribe("FileContentComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let component: FileContentComponent;
    let de: DebugElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            declarations: [FileContentComponent, TestComponent],
            schemas: [NO_ERROR_SCHEMA],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-file-content"));
        component = de.componentInstance;
        fixture.detectChanges();
    });

    it("", () => {
    });
});
