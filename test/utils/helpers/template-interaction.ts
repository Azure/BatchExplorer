import { DebugElement } from "@angular/core";

/**
 * Button events to pass to `DebugElement.triggerEventHandler` for RouterLink event handler
 */
export const ButtonClickEvents = {
    left: { button: 0, stopImmediatePropagation: () => null },
    right: { button: 2, stopImmediatePropagation: () => null },
};

/**
 * Simulate element click. Defaults to mouse left-button click event.
 */
export function click(el: DebugElement | HTMLElement | Node, eventObj: any = ButtonClickEvents.left): void {
    if (el instanceof DebugElement) {
        el.triggerEventHandler("click", eventObj);
    } else if ((el as any).click) {
        (el as any).click();
    } else if (el.dispatchEvent) {
        const evt = document.createEvent("MouseEvents");
        evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        el.dispatchEvent(evt);
    }
}

/**
 * Simulate a mouseenter event
 */
export function mouseenter(el: DebugElement | HTMLElement) {
    if (el instanceof HTMLElement) {
        el.dispatchEvent(new Event("mouseenter"));
    } else {
        el.triggerEventHandler("mouseenter", {});
    }
}

/**
 * Simulate a mouseleave event
 */
export function mouseleave(el: DebugElement | HTMLElement) {
    if (el instanceof HTMLElement) {
        el.dispatchEvent(new Event("mouseleave"));
    } else {
        el.triggerEventHandler("mouseleave", {});
    }
}
