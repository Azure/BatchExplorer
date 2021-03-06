import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { MaterialModule, ServerError } from "@batch-flask/core";
import { ClickableComponent } from "@batch-flask/ui/buttons";
import { click } from "test/utils/helpers";
import { ServerErrorComponent } from "./server-error.component";

const date = new Date(2017, 9, 13, 23, 43, 38);

@Component({
    template: `
       <bl-server-error #errorComponent [error]="error"></bl-server-error>
    `,
})
export class ServerErrorTestComponent {
    public error = null;
}

const fakeErrorNoDetails = new ServerError({
    code: "FakeErrorNoDetails",
    status: 400,
    message: "There was a fake error",
    requestId: "abc-def",
    timestamp: date,
});

const fakeErrorWithDetails = new ServerError({
    code: "FakeErrorWithDetails",
    status: 400,
    message: "There was a fake error with details",
    details: [
        { key: "Detail_1", value: "Very detailed error" },
        { key: "Detail_2", value: "Extremely detailed error" },
    ],
    requestId: "abc-def",
    timestamp: date,
});

describe("ServerErrorComponent", () => {
    let fixture: ComponentFixture<ServerErrorTestComponent>;
    let de: DebugElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MaterialModule],
            declarations: [
                ClickableComponent,
                ServerErrorComponent,
                ServerErrorTestComponent,
            ],
        });

        TestBed.compileComponents();
        fixture = TestBed.createComponent(ServerErrorTestComponent);
        fixture.detectChanges();
        de = fixture.debugElement.query(By.css("bl-server-error"));
    });

    it("should not show anything if there is no error", () => {
        expect(de.nativeElement.textContent).toBeBlank();
        expect(de.query(By.css(".error-banner"))).toBeNull();
    });

    describe("when there is an error", () => {
        let troubleshootBtn: DebugElement;

        beforeEach(() => {
            fixture.componentInstance.error = fakeErrorNoDetails;
            fixture.detectChanges();
            troubleshootBtn = de.query(By.css(".troubleshoot-btn bl-clickable"));
        });

        it("should show the error code and message", () => {
            expect(de.nativeElement.textContent).toContain("FakeErrorNoDetails");
            expect(de.nativeElement.textContent).toContain("There was a fake error");
            expect(troubleshootBtn).not.toBeNull();
        });

        it("should not show the request id and time by default", () => {
            expect(de.nativeElement.textContent).not.toContain("abc-def");
            expect(de.nativeElement.textContent)
                .not.toContain(date.toString());
        });

        it("should show the request id and time after clicking on the debug button", () => {
            click(troubleshootBtn);
            fixture.detectChanges();

            expect(de.nativeElement.textContent).toContain("abc-def");
            expect(de.nativeElement.textContent)
                .toContain(date.toString());
        });
    });

    describe("when error has details", () => {
        beforeEach(() => {
            fixture.componentInstance.error = fakeErrorWithDetails;
            fixture.detectChanges();
        });

        it("show the details", () => {
            const details = de.queryAll(By.css(".details > .detail"));
            expect(details.length).toBe(2);
            expect(details[0].nativeElement.textContent).toContain("Detail_1");
            expect(details[0].nativeElement.textContent).toContain("Very detailed error");
            expect(details[1].nativeElement.textContent).toContain("Detail_2");
            expect(details[1].nativeElement.textContent).toContain("Extremely detailed error");
        });
    });
});
