import { Directive,  HostListener } from "@angular/core";

import "./single-line-textarea.scss";

@Directive({
    standalone: false,
    selector: "[blSingleLineTextarea]",
})
export class SingleLineTextareaDirective {
    @HostListener("keydown", ["$event"])
    public preventEnter(event: KeyboardEvent) {
        if (event.keyCode === 13) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
        }
    }
}
