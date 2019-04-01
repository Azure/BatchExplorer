import { Directive, EventEmitter, HostListener, Output } from "@angular/core";
import { KeyBinding } from "@batch-flask/core";
import { KeyCode } from "@batch-flask/core/keys";

@Directive({
    selector: "[blKeyBindingListener]",
})
export class KeyBindingListenerDirective {
    public binding: KeyBinding;

    // Send the key binding being currently pressed to the parent. Will emit null when user press Escape to get out
    @Output("blKeyBindingListener") public output = new EventEmitter<KeyBinding | null>();
    private _keys = new Set();

    @HostListener("keydown", ["$event"])
    public handleKeydown(event: KeyboardEvent) {
        if (event.code === KeyCode.Escape) {
            if (this.binding.hash === "escape") {
                this.output.emit(null);
                return;
            }
        }
        this._keys.add(event.key.toLowerCase());
        this._computeAndEmitBinding();

        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
    }

    @HostListener("keyup", ["$event"])
    public handleKeyup(event: KeyboardEvent) {
        this._keys.delete(event.key.toLowerCase());
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
    }

    @HostListener("blur") public handleBlur() {
        this._keys.clear();
        console.log("Blur");
    }

    private _computeAndEmitBinding() {
        this.binding = new KeyBinding([...this._keys]);
        this.output.emit(this.binding);
    }

}
