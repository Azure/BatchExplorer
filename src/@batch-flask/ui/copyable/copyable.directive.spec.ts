import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { I18nTestingModule } from "@batch-flask/core/testing";
import { ClipboardService } from "@batch-flask/electron";
import { click } from "test/utils/helpers";
import { CopyableDirective } from "./copyable.directive";

const sampleText = "target clipboard text";

@Component({
    template: `<div beCopyable>${sampleText}</div>`
})
class TestCopyableComponent {}

describe("CopyableDirective", () => {
    let fixture: ComponentFixture<TestCopyableComponent>;
    let clipboardServiceSpy;

    beforeEach(() => {
        clipboardServiceSpy = {
            writeText: jasmine.createSpy("ClipboardService.writeText")
        };

        TestBed.configureTestingModule({
            imports: [I18nTestingModule],
            declarations: [CopyableDirective, TestCopyableComponent],
            providers: [
                {
                    provide: ClipboardService,
                    useValue: clipboardServiceSpy
                }
            ]
        });
        fixture = TestBed.createComponent(TestCopyableComponent);
        fixture.detectChanges();
    });

    it("copies to the clipboard", () => {
        const clipboardElement =
            fixture.nativeElement.querySelector(".be-copyable");
        expect(clipboardElement.style.display).toBe("none");

        // TODO: Fix mouseenter simulation to test that clipboard button appears
        // mouseenter(fixture.nativeElement);
        // fixture.detectChanges();
        // expect(clipboardElement.style.display).toBeNull();

        click(clipboardElement);
        expect(clipboardServiceSpy.writeText).toHaveBeenCalledOnce();
        expect(clipboardServiceSpy.writeText).toHaveBeenCalledWith(sampleText);
    });
});
