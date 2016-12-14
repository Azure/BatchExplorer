import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MaterialModule } from "@angular/material";
import { By } from "@angular/platform-browser";

import { ServerErrorComponent } from "app/components/base/form/server-error";
import { BatchError } from "app/models";

@Component({
    template: `
       <bex-server-error #errorComponent [error]="error"></bex-server-error>
    `,
})
export class ServerErrorTestComponent {
    public error = null;
}

const fakeError: BatchError = {
    code: "FakeErrorCode",
    message: {
        value: "There was a fake error\nRequestId:abc-def-ghi\nTime:time:2016-12-08T18:23:14",
    },
};

describe("ServerErrorComponent", () => {
    let fixture: ComponentFixture<ServerErrorTestComponent>;
    let serverErrorElement: DebugElement;
    let serverErrorComponent: ServerErrorComponent;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MaterialModule.forRoot()],
            declarations: [
                ServerErrorComponent,
                ServerErrorTestComponent,
            ],
        });

        TestBed.compileComponents();
        fixture = TestBed.createComponent(ServerErrorTestComponent);
        fixture.detectChanges();
        serverErrorElement = fixture.debugElement.query(By.css("bex-server-error"));
        serverErrorComponent = serverErrorElement.componentInstance;
    });

    it("should not show anything if there is no error", () => {
        expect(serverErrorElement.nativeElement.textContent).toBeBlank();
        expect(serverErrorElement.query(By.css(".error-banner"))).toBeNull();
    });

    describe("when there is an error", () => {
        let troubleshootBtn: DebugElement;

        beforeEach(() => {
            fixture.componentInstance.error = fakeError;
            fixture.detectChanges();
            troubleshootBtn = serverErrorElement.query(By.css(".troubleshoot-btn i"));
        });

        it("should show the error code and message", () => {
            expect(serverErrorElement.nativeElement.textContent).toContain("FakeErrorCode");
            expect(serverErrorElement.nativeElement.textContent).toContain("There was a fake error");
            expect(troubleshootBtn).not.toBeNull();
        });

        it("should not show the request id and time by default", () => {
            expect(serverErrorElement.nativeElement.textContent).not.toContain("abc-def-ghi");
            expect(serverErrorElement.nativeElement.textContent).not.toContain("2016-12-08T18:23:14");
        });

        it("should show the request id and time after clicking on the debug button", () => {
            troubleshootBtn.nativeElement.click();
            fixture.detectChanges();

            expect(serverErrorElement.nativeElement.textContent).toContain("abc-def-ghi");
            expect(serverErrorElement.nativeElement.textContent).toContain("2016-12-08T18:23:14");
        });
    });
});
