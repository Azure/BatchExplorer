import { Component, DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { ClipboardService } from "@batch-flask/ui";
import { PropertyListModule } from "@batch-flask/ui/property-list";
import { EditorMockComponent, EditorTestingModule } from "@batch-flask/ui/testing";
import { BatchExplorerService } from "app/services";
import * as Fixtures from "test/fixture";

import { ProgramingSampleComponent } from "./programing-sample.component";

const account1 = Fixtures.account.create();
@Component({
    template: `
        <bl-programing-sample [target]="target" [sharedKeyCredentials]="sharedKeyCredentials" [account]="account">
        </bl-programing-sample>`,
})
class TestComponent {
    public target = null;
    public sharedKeyCredentials = {
        batchAccount: {
            resource: account1,
            primary: "primary-key",
            secondary: "secondary-key",
        },
    };
    public account = account1;
}

describe("ProgramingSampleComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let component: ProgramingSampleComponent;
    let de: DebugElement;
    let codeEl: DebugElement;
    let code: EditorMockComponent;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [PropertyListModule, FormsModule, ReactiveFormsModule, EditorTestingModule],
            declarations: [ProgramingSampleComponent, TestComponent],
            schemas: [NO_ERRORS_SCHEMA],
            providers: [
                { provide: ClipboardService, useValue: {} },
                { provide: BatchExplorerService, useValue: {} },
            ],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-programing-sample"));
        component = de.componentInstance;
        fixture.detectChanges();
        codeEl = de.query(By.css("bl-editor"));
        code = codeEl.componentInstance;
    });

    describe("when language/engine is the same", () => {
        beforeEach(() => {
            testComponent.target = "csharp";
            fixture.detectChanges();
        });

        it("should compute the right language for the editor", () => {
            expect(component.editorConfig.language).toEqual("csharp");
        });

        it("show the prerequisites", () => {
            expect(de.query(By.css(".prerequisites")).nativeElement.textContent)
                .toContain("dotnet add package Azure.Batch");
        });

        it("show right code in the editor", () => {
            expect(code.value).toContain("namespace Microsoft.Azure.Batch.Samples.HelloWorld");
            expect(code.value).toContain(`public const string name = "${account1.name}";`);
            expect(code.value).toContain(`public const string url = "https://${account1.properties.accountEndpoint}";`);
            expect(code.value).toContain(`public const string key = "primary-key";`);
        });
    });

    describe("when language is engine(nodejs)", () => {
        beforeEach(() => {
            testComponent.target = "nodejs";
            fixture.detectChanges();
        });

        it("should compute the right language for the editor", () => {
            expect(component.editorConfig.language).toEqual("javascript");
        });

        it("show the prerequisites", () => {
            expect(de.query(By.css(".prerequisites")).nativeElement.textContent)
                .toContain("npm install azure-batch");
        });

        it("show right code in the editor", () => {
            expect(code.value).toContain(
                `const { SharedKeyCredentials, ServiceClient } = require("azure-batch");`);
            expect(code.value).toContain(`const accountName = "${account1.name}";`);
            expect(code.value).toContain(`const accountUrl = "https://${account1.properties.accountEndpoint}";`);
            expect(code.value).toContain(`const accountKey = "primary-key";`);
        });
    });
});
