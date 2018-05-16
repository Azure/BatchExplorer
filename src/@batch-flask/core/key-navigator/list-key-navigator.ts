import {
    A,
    DOWN_ARROW,
    NINE,
    UP_ARROW,
    Z,
    ZERO,
} from "@angular/cdk/keycodes";
import { Subject, Subscription } from "rxjs";
import { debounceTime, filter, map, tap } from "rxjs/operators";

export interface KeyNavigableListItem {
    disabled: boolean;
    label: string;
}

export class ListKeyNavigator<T extends KeyNavigableListItem> {
    /** Stream that emits whenever the active item of the list manager changes. */
    public change = new Subject<number>();

    public set items(items: T[]) {
        this._items = items;
        if (this._focusedItem) {
            const newIndex = items.indexOf(this._focusedItem);

            if (newIndex > -1 && newIndex !== this._focusedItemIndex) {
                this._focusedItemIndex = newIndex;
            }
        }
    }
    public get items() { return this._items; }

    private _items: T[] = [];
    private _letterKeyStream = new Subject<string>();
    // Buffer for the letters that the user has pressed when the typeahead option is turned on.
    private _pressedLetters: string[] = [];
    private _focusedItemIndex = -1;
    private _focusedItem: T = null;
    private _wrap = false;
    private _typeaheadSubscription = Subscription.EMPTY;

    public get focusedItemIndex(): number {
        return this._focusedItemIndex;
    }

    public get focusedItem(): T {
        return this._focusedItem;
    }

    public dispose() {
        this.change.complete();
    }

    /**
     * Turns on wrapping mode, which ensures that the active item will wrap to
     * the other end of list when there are no more items in the given direction.
     */
    public withWrap(): this {
        this._wrap = true;
        return this;
    }

    /**
     * Turns on typeahead mode which allows users to set the active item by typing.
     * @param debounceInterval Time to wait after the last keystroke before setting the active item.
     */
    public withTypeAhead(debounceInterval: number = 200): this {
        this._typeaheadSubscription.unsubscribe();

        // Debounce the presses of non-navigational keys, collect the ones that correspond to letters
        // and convert those letters back into a string. Afterwards find the first item that starts
        // with that string and select it.
        this._typeaheadSubscription = this._letterKeyStream.pipe(
            tap(keyCode => this._pressedLetters.push(keyCode)),
            debounceTime(debounceInterval),
            filter(() => this._pressedLetters.length > 0),
            map(() => this._pressedLetters.join("")),
        ).subscribe(inputString => {
            const items = this._items;

            // Start at 1 because we want to start searching at the item immediately
            // following the current active item.
            for (let i = 1; i < items.length + 1; i++) {
                const index = (this._focusedItemIndex + i) % items.length;
                const item = items[index];

                if (!this._skipPredicateFn(item) &&
                    item.label.toUpperCase().trim().indexOf(inputString) === 0) {

                    this.focusItem(index);
                    break;
                }
            }

            this._pressedLetters = [];
        });

        return this;
    }

    /**
     * Focus the item by index or by the actual item
     * @param item
     */
    public focusItem(item: number | T) {
        const previousIndex = this._focusedItemIndex;
        this.updateFocusedItem(item);
        if (this._focusedItemIndex !== previousIndex) {
            this.change.next(this._focusedItemIndex);
        }
    }

    public updateFocusedItem(item: number | T): void {
        const items = this._items;
        const index = typeof item === "number" ? item : items.indexOf(item);

        this._focusedItemIndex = index;
        this._focusedItem = items[index];
    }

    /**
     * Focus the next/previous item depending on the key event passed in.
     * @param event Keyboard event to be used for determining which element should be active.
     */
    public onKeydown(event: KeyboardEvent): void {
        const keyCode = event.keyCode;
        switch (keyCode) {
            case DOWN_ARROW:
                this.focusNextItem();
                break;
            case UP_ARROW:
                this.focusPreviousItem();
                break;
            default:
                // Attempt to use the `event.key` which also maps it to the user's keyboard language,
                // otherwise fall back to resolving alphanumeric characters via the keyCode.
                if (event.key && event.key.length === 1) {
                    this._letterKeyStream.next(event.key.toLocaleUpperCase());
                } else if ((keyCode >= A && keyCode <= Z) || (keyCode >= ZERO && keyCode <= NINE)) {
                    this._letterKeyStream.next(String.fromCharCode(keyCode));
                }

                // Note that we return here, in order to avoid preventing
                // the default action of non-navigational keys.
                return;
        }

        this._pressedLetters = [];
        event.preventDefault();
    }

    public focusNextItem(): void {
        this._focusedItemIndex < 0 ? this.focusFirstItem() : this._moveFocus(1);
    }

    /** Sets the active item to a previous enabled item in the list. */
    public focusPreviousItem(): void {
        this._focusedItemIndex < 0 && this._wrap ? this.focusLastItem() : this._moveFocus(-1);
    }

    public focusFirstItem() {
        this._focusByIndex(0, 1);
    }

    public focusLastItem() {
        this._focusByIndex(this._items.length - 1, -1);
    }

    /**
     * This method sets the active item, given a list of items and the delta between the
     * currently active item and the new active item. It will calculate differently
     * depending on whether wrap mode is turned on.
     */
    private _moveFocus(delta: -1 | 1): void {
        this._focusByIndex(this._focusedItemIndex + delta, delta);
    }

    /**
     * Sets the active item to the first enabled item starting at the index specified. If the
     * item is disabled, it will move in the fallbackDelta direction until it either
     * finds an enabled item or encounters the end of the list.
     */
    private _focusByIndex(index: number, fallbackDelta: -1 | 1): void {
        const items = this._items;

        index = this._wrapIndex(index);

        if (!items[index]) {
            return;
        }

        while (this._skipPredicateFn(items[index])) {
            index += fallbackDelta;
            index = this._wrapIndex(index);

            if (!items[index]) {
                return;
            }
        }

        this.focusItem(index);
    }

    /**
     * Wrap the index if in wrap mode
     * @param index: Index to wrap
     */
    private _wrapIndex(index: number): number {
        if (this._wrap) {
            return (index + this._items.length) % this._items.length;
        } else {
            return index;
        }
    }

    /**
     * Predicate function that can be used to check whether an item should be skipped
     * by the key manager. By default, disabled items are skipped.
     */
    private _skipPredicateFn = (item: T) => item.disabled;
}
