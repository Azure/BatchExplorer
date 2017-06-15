import { Component, DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";

import { FileContentComponent } from "app/components/file/details";
import { File } from "app/models";
import { FileService, StorageService } from "app/services";

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

    let storageServiceSpy;
    let fileServiceSpy;

    beforeEach(() => {
        storageServiceSpy = {};
        fileServiceSpy = {
            fileFromNode: () => Observable.of([
                new File({})
            ]),
        };
        TestBed.configureTestingModule({
            imports: [],
            declarations: [FileContentComponent, TestComponent],
            schemas: [NO_ERRORS_SCHEMA],
            providers: [
                { provide: StorageService, useValue: storageServiceSpy },
                { provide: FileService, useValue: fileServiceSpy },
            ],
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
