import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { MaterialModule, ServerError } from "@batch-flask/core";

import { ServerErrorComponent } from "@batch-flask/ui/form/server-error";

const date = new Date(2017, 9, 13, 23, 43, 38);

@Component({
    template: `
       <bl-server-error #errorComponent [error]="error"></bl-server-error>
    `,
})
export class ServerErrorTestComponent {
    public error = null;
}

const fakeError = ServerError.fromBatch({
    statusCode: 408,
    code: "FakeErrorCode",
    message: {
        value: `There was a fake error\nRequestId:abc-def\nTime:${date.toISOString()}`,
    },
});

describe("ServerErrorComponent", () => {
    let fixture: ComponentFixture<ServerErrorTestComponent>;
    let serverErrorElement: DebugElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MaterialModule],
            declarations: [
                ServerErrorComponent,
                ServerErrorTestComponent,
            ],
        });

        TestBed.compileComponents();
        fixture = TestBed.createComponent(ServerErrorTestComponent);
        fixture.detectChanges();
        serverErrorElement = fixture.debugElement.query(By.css("bl-server-error"));
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
            expect(serverErrorElement.nativeElement.textContent).not.toContain("abc-def");
            expect(serverErrorElement.nativeElement.textContent)
                .not.toContain(date.toString());
        });

        it("should show the request id and time after clicking on the debug button", () => {
            troubleshootBtn.nativeElement.click();
            fixture.detectChanges();

            expect(serverErrorElement.nativeElement.textContent).toContain("abc-def");
            expect(serverErrorElement.nativeElement.textContent)
                .toContain(date.toString());
        });
    });
});
