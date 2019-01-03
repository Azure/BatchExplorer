export enum DropEffect {
    none = "none",
    link = "link",
    copy = "copy",
    move = "move",
}

/**
 * Helper functions for drag and drop
 */
export class DragUtils {
    /**
     * Call this in the draghover callback to allow/disallow dropping
     */
    public static allowDrop(event: DragEvent, allowed: boolean, effect: DropEffect = DropEffect.move) {
        if (!allowed) { return; }
        event.dataTransfer!.dropEffect = effect;
        event.stopPropagation();
        event.preventDefault();
    }
}
