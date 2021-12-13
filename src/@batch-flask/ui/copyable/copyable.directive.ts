import { Directive, ElementRef, HostListener } from "@angular/core";
import { I18nService } from "@batch-flask/core";
import { ClipboardService } from "@batch-flask/electron";

import "./copyable.scss";

@Directive({ selector: "[beCopyable]" })
export class CopyableDirective {
    private button: HTMLElement;
    private copiedAlert: HTMLElement;

    constructor(
        private element: ElementRef,
        private clipboard: ClipboardService,
        i18n: I18nService
    ) {
        this.button = document.createElement("span");
        this.button.style.display = "none";
        this.button.className = "clipboard be-copyable";
        this.button.addEventListener("click", () => this.copyToClipboard());

        const icon = document.createElement("i");
        icon.className = "fa fa-clipboard";
        this.button.appendChild(icon);

        this.copiedAlert = document.createElement("span");
        this.copiedAlert.setAttribute("role", "alert");
        this.copiedAlert.innerText = i18n.t("be-copyable.copied");
        this.copiedAlert.style.color = "transparent";
        this.copiedAlert.style.display = "none";
        this.button.appendChild(this.copiedAlert);

        const container = this.element.nativeElement;
        container.classList.add("be-copyable-container");
        container.appendChild(this.button);
    }

    @HostListener("mouseenter")
    onMouseEnter() {
        this.button.style.display = null;
    }

    @HostListener("mouseleave")
    onMouseLeave() {
        this.button.style.display = "none";
    }

    copyToClipboard() {
        this.clipboard.writeText(this.element.nativeElement.innerText);
        this.copiedAlert.style.display = null;
        setTimeout(() => this.copiedAlert.style.display = "none", 3000);
    }
}
