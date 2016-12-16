import { DebugElement } from "@angular/core";

/**
 * Button events to pass to `DebugElement.triggerEventHandler` for RouterLink event handler
 */
export const ButtonClickEvents = {
    left: { button: 0 },
    right: { button: 2 },
};

/**
 * Simulate element click. Defaults to mouse left-button click event.
 */
export function click(el: DebugElement | HTMLElement, eventObj: any = ButtonClickEvents.left): void {
    if (el instanceof HTMLElement) {
        el.click();
    } else {
        el.triggerEventHandler("click", eventObj);
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
