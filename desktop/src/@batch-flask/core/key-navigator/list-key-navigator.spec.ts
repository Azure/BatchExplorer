import { TAB } from "@angular/cdk/keycodes";
import { fakeAsync, tick } from "@angular/core/testing";
import { createKeyboardEvent } from "test/utils/helpers";
import { KeyCode } from "../keys";
import { ListKeyNavigator } from "./list-key-navigator";

class FakeFocusable {
    /** Whether the item is disabled or not. */
    public disabled = false;
    /** Test property that can be used to test the `skipPredicate` functionality. */
    public skipItem = false;
    constructor(private _label = "") { }
    public getLabel() { return this._label; }
}

describe("List key navigator", () => {
    let fakeKeyEvents: {
        downArrow: KeyboardEvent,
        upArrow: KeyboardEvent,
        leftArrow: KeyboardEvent,
        rightArrow: KeyboardEvent,
        tab: KeyboardEvent,
        unsupported: KeyboardEvent,
    };
    let keyNavigator: ListKeyNavigator<FakeFocusable>;
    let items = [];

    function updateNavigatorItems() {
        keyNavigator.items = [...items];
    }
    beforeEach(() => {
        fakeKeyEvents = {
            downArrow: createKeyboardEvent("keydown", KeyCode.ArrowDown),
            upArrow: createKeyboardEvent("keydown", KeyCode.ArrowUp),
            leftArrow: createKeyboardEvent("keydown", KeyCode.ArrowLeft),
            rightArrow: createKeyboardEvent("keydown", KeyCode.ArrowRight),
            tab: createKeyboardEvent("keydown", KeyCode.Tab, TAB),
            unsupported: createKeyboardEvent("keydown", null, 192), // ~
        };
        keyNavigator = new ListKeyNavigator<FakeFocusable>();
        items = [
            new FakeFocusable("one"),
            new FakeFocusable("two"),
            new FakeFocusable("three"),
        ];
        updateNavigatorItems();

        // Focus first item
        keyNavigator.focusFirstItem();

        spyOn(keyNavigator, "focusItem").and.callThrough();
    });

    afterEach(() => {
        keyNavigator.dispose();
    });

    it("should maintain the active item if the amount of items changes", () => {
        keyNavigator.focusFirstItem();
        expect(keyNavigator.focusedItemIndex).toBe(0);
        expect(keyNavigator.focusedItem.getLabel()).toBe("one");

        keyNavigator.items = [new FakeFocusable("zero")].concat(keyNavigator.items);

        expect(keyNavigator.focusedItemIndex).toBe(1);
        expect(keyNavigator.focusedItem!.getLabel()).toBe("one");
    });

    describe("when using columns", () => {
        beforeEach(() => {
            keyNavigator.withColumns(2);
        });

        it("focus no columns by default", () => {
            expect(keyNavigator.focusedColumn).toEqual(null);
            keyNavigator.onKeydown(fakeKeyEvents.downArrow);
            expect(keyNavigator.focusedColumn).toEqual(null);
        });

        it("focus does nothing when using left arrow", () => {
            expect(keyNavigator.focusedColumn).toEqual(null);
            keyNavigator.onKeydown(fakeKeyEvents.leftArrow);
            expect(keyNavigator.focusedColumn).toEqual(null);
        });

        it("focus the first column when using the right arrow", () => {
            expect(keyNavigator.focusedColumn).toEqual(null);
            keyNavigator.onKeydown(fakeKeyEvents.rightArrow);
            expect(keyNavigator.focusedColumn).toEqual(0);
        });

        it("blocks when reaching the last column", () => {
            expect(keyNavigator.focusedColumn).toEqual(null);
            keyNavigator.onKeydown(fakeKeyEvents.rightArrow);
            expect(keyNavigator.focusedColumn).toEqual(0);
            keyNavigator.onKeydown(fakeKeyEvents.rightArrow);
            expect(keyNavigator.focusedColumn).toEqual(1);
            keyNavigator.onKeydown(fakeKeyEvents.rightArrow);
            expect(keyNavigator.focusedColumn).toEqual(1, "Should stay on the last column");
        });

        it("stop focusing column when going left on the first one", () => {
            expect(keyNavigator.focusedColumn).toEqual(null);
            keyNavigator.onKeydown(fakeKeyEvents.rightArrow);
            expect(keyNavigator.focusedColumn).toEqual(0);
            keyNavigator.onKeydown(fakeKeyEvents.leftArrow);
            expect(keyNavigator.focusedColumn).toEqual(null, "Should now not have a column focused");
        });

        it("pressing left multiple times doesn't change", () => {
            expect(keyNavigator.focusedColumn).toEqual(null);
            keyNavigator.onKeydown(fakeKeyEvents.rightArrow);
            expect(keyNavigator.focusedColumn).toEqual(0);
            keyNavigator.onKeydown(fakeKeyEvents.leftArrow);
            expect(keyNavigator.focusedColumn).toEqual(null);
            keyNavigator.onKeydown(fakeKeyEvents.leftArrow);
            expect(keyNavigator.focusedColumn).toEqual(null);

            keyNavigator.onKeydown(fakeKeyEvents.rightArrow);
            expect(keyNavigator.focusedColumn).toEqual(0);
        });

        it("focus a specific column", () => {
            keyNavigator.focusColumn(1);
            expect(keyNavigator.focusedColumn).toEqual(1);
            keyNavigator.focusColumn(null);
            expect(keyNavigator.focusedColumn).toEqual(null);
        });

        it("block if the focus column ask is more than the column count", () => {
            keyNavigator.focusColumn(2);
            expect(keyNavigator.focusedColumn).toEqual(1);
        });
    });
    describe("Key events", () => {
        it("should emit an event whenever the active item changes", () => {
            const spy = jasmine.createSpy("change spy");
            keyNavigator.change.subscribe(spy);

            keyNavigator.onKeydown(fakeKeyEvents.downArrow);
            expect(spy).toHaveBeenCalledTimes(1);

            keyNavigator.onKeydown(fakeKeyEvents.upArrow);
            expect(spy).toHaveBeenCalledTimes(2);
        });

        it("should activate the first item when pressing down on a clean key manager", () => {
            keyNavigator.dispose();
            keyNavigator = new ListKeyNavigator();
            updateNavigatorItems();

            expect(keyNavigator.focusedItemIndex).toBe(-1, "Expected active index to default to -1.");

            keyNavigator.onKeydown(fakeKeyEvents.downArrow);

            expect(keyNavigator.focusedItemIndex).toBe(0, "Expected first item to become active.");
        });

        it("should not prevent the default keyboard action when pressing tab", () => {
            expect(fakeKeyEvents.tab.defaultPrevented).toBe(false);

            keyNavigator.onKeydown(fakeKeyEvents.tab);

            expect(fakeKeyEvents.tab.defaultPrevented).toBe(false);
        });

        it("should not do anything for unsupported key presses", () => {
            keyNavigator.focusItem(1);

            expect(keyNavigator.focusedItemIndex).toBe(1);
            expect(fakeKeyEvents.unsupported.defaultPrevented).toBe(false);

            keyNavigator.onKeydown(fakeKeyEvents.unsupported);

            expect(keyNavigator.focusedItemIndex).toBe(1);
            expect(fakeKeyEvents.unsupported.defaultPrevented).toBe(false);
        });

        it("should set subsequent items as active when the next key is pressed", () => {
            keyNavigator.onKeydown(fakeKeyEvents.downArrow);

            expect(keyNavigator.focusedItemIndex)
                .toBe(1, "Expected active item to be 1 after one next key event.");
            expect(keyNavigator.focusItem).not.toHaveBeenCalledWith(0);
            expect(keyNavigator.focusItem).toHaveBeenCalledWith(1);
            expect(keyNavigator.focusItem).not.toHaveBeenCalledWith(2);

            keyNavigator.onKeydown(fakeKeyEvents.downArrow);
            expect(keyNavigator.focusedItemIndex)
                .toBe(2, "Expected active item to be 2 after two next key events.");
            expect(keyNavigator.focusItem).toHaveBeenCalledWith(2);
            expect(keyNavigator.focusItem).not.toHaveBeenCalledWith(0);
        });

        it("should set first item active when the next key is pressed if no active item", () => {
            keyNavigator.focusItem(-1);
            keyNavigator.onKeydown(fakeKeyEvents.downArrow);

            expect(keyNavigator.focusedItemIndex)
                .toBe(0, "Expected active item to be 0 after next key if active item was null.");
            expect(keyNavigator.focusItem).toHaveBeenCalledWith(0);
            expect(keyNavigator.focusItem).not.toHaveBeenCalledWith(1);
            expect(keyNavigator.focusItem).not.toHaveBeenCalledWith(2);
        });

        it("should set previous items as active when the previous key is pressed", () => {
            keyNavigator.onKeydown(fakeKeyEvents.downArrow);

            expect(keyNavigator.focusedItemIndex)
                .toBe(1, "Expected active item to be 1 after one next key event.");
            expect(keyNavigator.focusItem).not.toHaveBeenCalledWith(0);
            expect(keyNavigator.focusItem).toHaveBeenCalledWith(1);

            keyNavigator.onKeydown(fakeKeyEvents.upArrow);
            expect(keyNavigator.focusedItemIndex)
                .toBe(0, "Expected active item to be 0 after one next and one previous key event.");
            expect(keyNavigator.focusItem).toHaveBeenCalledWith(0);
        });

        it("should do nothing when the prev key is pressed if no active item and not wrap", () => {
            keyNavigator.focusItem(-1);
            keyNavigator.onKeydown(fakeKeyEvents.upArrow);

            expect(keyNavigator.focusedItemIndex)
                .toBe(-1, "Expected nothing to happen if prev event occurs and no active item.");
            expect(keyNavigator.focusItem).not.toHaveBeenCalledWith(0);
            expect(keyNavigator.focusItem).not.toHaveBeenCalledWith(1);
            expect(keyNavigator.focusItem).not.toHaveBeenCalledWith(2);
        });

        it("should skip disabled items", () => {
            items[1].disabled = true;
            updateNavigatorItems();

            // Next event should skip past disabled item from 0 to 2
            keyNavigator.onKeydown(fakeKeyEvents.downArrow);
            expect(keyNavigator.focusedItemIndex)
                .toBe(2, "Expected active item to skip past disabled item on next event.");
            expect(keyNavigator.focusItem).not.toHaveBeenCalledWith(0);
            expect(keyNavigator.focusItem).not.toHaveBeenCalledWith(1);
            expect(keyNavigator.focusItem).toHaveBeenCalledWith(2);

            // Previous event should skip past disabled item from 2 to 0
            keyNavigator.onKeydown(fakeKeyEvents.upArrow);
            expect(keyNavigator.focusedItemIndex)
                .toBe(0, "Expected active item to skip past disabled item on up arrow.");
            expect(keyNavigator.focusItem).toHaveBeenCalledWith(0);
            expect(keyNavigator.focusItem).not.toHaveBeenCalledWith(1);
        });

        it("should work normally when disabled property does not exist", () => {
            items[0].disabled = undefined;
            items[1].disabled = undefined;
            items[2].disabled = undefined;
            updateNavigatorItems();

            keyNavigator.onKeydown(fakeKeyEvents.downArrow);
            expect(keyNavigator.focusedItemIndex)
                .toBe(1, "Expected active item to be 1 after one next event when disabled not set.");
            expect(keyNavigator.focusItem).not.toHaveBeenCalledWith(0);
            expect(keyNavigator.focusItem).toHaveBeenCalledWith(1);
            expect(keyNavigator.focusItem).not.toHaveBeenCalledWith(2);

            keyNavigator.onKeydown(fakeKeyEvents.downArrow);
            expect(keyNavigator.focusedItemIndex)
                .toBe(2, "Expected active item to be 2 after two next events when disabled not set.");
            expect(keyNavigator.focusItem).not.toHaveBeenCalledWith(0);
            expect(keyNavigator.focusItem).toHaveBeenCalledWith(2);
        });

        it("should not move active item past either end of the list", () => {
            keyNavigator.onKeydown(fakeKeyEvents.downArrow);
            keyNavigator.onKeydown(fakeKeyEvents.downArrow);
            expect(keyNavigator.focusedItemIndex)
                .toBe(2, `Expected last item of the list to be active.`);

            // This next event would move active item past the end of the list
            keyNavigator.onKeydown(fakeKeyEvents.downArrow);
            expect(keyNavigator.focusedItemIndex)
                .toBe(2, `Expected active item to remain at the end of the list.`);

            keyNavigator.onKeydown(fakeKeyEvents.upArrow);
            keyNavigator.onKeydown(fakeKeyEvents.upArrow);
            expect(keyNavigator.focusedItemIndex)
                .toBe(0, `Expected first item of the list to be active.`);

            // This prev event would move active item past the beginning of the list
            keyNavigator.onKeydown(fakeKeyEvents.upArrow);
            expect(keyNavigator.focusedItemIndex)
                .toBe(0, `Expected active item to remain at the beginning of the list.`);
        });

        it("should not move active item to end when the last item is disabled", () => {
            items[2].disabled = true;
            updateNavigatorItems();

            keyNavigator.onKeydown(fakeKeyEvents.downArrow);
            expect(keyNavigator.focusedItemIndex)
                .toBe(1, `Expected second item of the list to be active.`);

            // This next key event would set active item to the last item, which is disabled
            keyNavigator.onKeydown(fakeKeyEvents.downArrow);
            expect(keyNavigator.focusedItemIndex)
                .toBe(1, `Expected the second item to remain active.`);
            expect(keyNavigator.focusItem).not.toHaveBeenCalledWith(2);
        });

        it("should prevent the default keyboard action of handled events", () => {
            expect(fakeKeyEvents.downArrow.defaultPrevented).toBe(false);
            keyNavigator.onKeydown(fakeKeyEvents.downArrow);
            expect(fakeKeyEvents.downArrow.defaultPrevented).toBe(true);

            expect(fakeKeyEvents.upArrow.defaultPrevented).toBe(false);
            keyNavigator.onKeydown(fakeKeyEvents.upArrow);
            expect(fakeKeyEvents.upArrow.defaultPrevented).toBe(true);
        });
    });

    describe("wrap mode", () => {
        it("should return itself to allow chaining", () => {
            expect(keyNavigator.withWrap())
                .toEqual(keyNavigator, `Expected withWrap() to return an instance of ListkeyNavigator.`);
        });

        it("should wrap focus when arrow keying past items while in wrap mode", () => {
            keyNavigator.withWrap();
            keyNavigator.onKeydown(fakeKeyEvents.downArrow);
            keyNavigator.onKeydown(fakeKeyEvents.downArrow);

            expect(keyNavigator.focusedItemIndex).toBe(2, "Expected last item to be active.");

            // this down arrow moves down past the end of the list
            keyNavigator.onKeydown(fakeKeyEvents.downArrow);
            expect(keyNavigator.focusedItemIndex).toBe(0, "Expected active item to wrap to beginning.");

            // this up arrow moves up past the beginning of the list
            keyNavigator.onKeydown(fakeKeyEvents.upArrow);
            expect(keyNavigator.focusedItemIndex).toBe(2, "Expected active item to wrap to end.");
        });

        it("should set last item active when up arrow is pressed if no active item", () => {
            keyNavigator.withWrap();
            keyNavigator.focusItem(-1);
            keyNavigator.onKeydown(fakeKeyEvents.upArrow);

            expect(keyNavigator.focusedItemIndex)
                .toBe(2, "Expected last item to be active on up arrow if no active item.");
            expect(keyNavigator.focusItem).not.toHaveBeenCalledWith(0);
            expect(keyNavigator.focusItem).toHaveBeenCalledWith(2);

            keyNavigator.onKeydown(fakeKeyEvents.downArrow);
            expect(keyNavigator.focusedItemIndex)
                .toBe(0, "Expected active item to be 0 after wrapping back to beginning.");
            expect(keyNavigator.focusItem).toHaveBeenCalledWith(0);
        });

        // This test should pass if all items are disabled and the down arrow key got pressed.
        // If the test setup crashes or this test times out, this test can be considered as failed.
        it("should not get into an infinite loop if all items are disabled", () => {
            keyNavigator.withWrap();
            keyNavigator.focusItem(0);

            items.forEach(item => item.disabled = true);
            updateNavigatorItems();

            keyNavigator.onKeydown(fakeKeyEvents.downArrow);
        });
    });

    describe("typeahead mode", () => {
        const debounceInterval = 300;

        beforeEach(() => {
            keyNavigator.withTypeAhead(debounceInterval);
            keyNavigator.focusItem(-1);
        });

        it("should debounce the input key presses", fakeAsync(() => {
            keyNavigator.onKeydown(createKeyboardEvent("keydown", null, 79, undefined, "o")); // types "o"
            keyNavigator.onKeydown(createKeyboardEvent("keydown", null, 78, undefined, "n")); // types "n"
            keyNavigator.onKeydown(createKeyboardEvent("keydown", null, 69, undefined, "e")); // types "e"
            expect(keyNavigator.focusedItem).not.toBe(items[0]);

            tick(debounceInterval);

            expect(keyNavigator.focusedItem).toBe(items[0]);
        }));

        it("should focus the first item that starts with a letter", fakeAsync(() => {
            keyNavigator.onKeydown(createKeyboardEvent("keydown", null, 84, undefined, "t")); // types "t"
            tick(debounceInterval);

            expect(keyNavigator.focusedItem).toBe(items[1]);
        }));

        it("should focus the first item that starts with sequence of letters", fakeAsync(() => {
            keyNavigator.onKeydown(createKeyboardEvent("keydown", null, 84, undefined, "t")); // types "t"
            keyNavigator.onKeydown(createKeyboardEvent("keydown", null, 72, undefined, "h")); // types "h"
            tick(debounceInterval);

            expect(keyNavigator.focusedItem).toBe(items[2]);
        }));

        it("should cancel any pending timers if a navigation key is pressed", fakeAsync(() => {
            keyNavigator.onKeydown(createKeyboardEvent("keydown", null, 84, undefined, "t")); // types "t"
            keyNavigator.onKeydown(createKeyboardEvent("keydown", null, 72, undefined, "h")); // types "h"
            keyNavigator.onKeydown(fakeKeyEvents.downArrow);

            tick(debounceInterval);

            expect(keyNavigator.focusedItem).toBe(items[0]);
        }));

        it("should handle non-English input", fakeAsync(() => {
            items = [
                new FakeFocusable("едно"),
                new FakeFocusable("две"),
                new FakeFocusable("три"),
            ];
            updateNavigatorItems();

            const keyboardEvent = createKeyboardEvent("keydown", null, 68, undefined, "д");

            keyNavigator.onKeydown(keyboardEvent); // types "д"
            tick(debounceInterval);

            expect(keyNavigator.focusedItem).toBe(items[1]);
        }));

        it("should handle non-letter characters", fakeAsync(() => {
            items = [
                new FakeFocusable("[]"),
                new FakeFocusable("321"),
                new FakeFocusable("`!?"),
            ];
            updateNavigatorItems();

            keyNavigator.onKeydown(createKeyboardEvent("keydown", null, 192, undefined, "`")); // types "`"
            tick(debounceInterval);
            expect(keyNavigator.focusedItem).toBe(items[2]);

            keyNavigator.onKeydown(createKeyboardEvent("keydown", null, 51, undefined, "3")); // types "3"
            tick(debounceInterval);
            expect(keyNavigator.focusedItem).toBe(items[1]);

            keyNavigator.onKeydown(createKeyboardEvent("keydown", null, 219, undefined, "[")); // types "["
            tick(debounceInterval);
            expect(keyNavigator.focusedItem).toBe(items[0]);
        }));

        it("should not focus disabled items", fakeAsync(() => {
            expect(keyNavigator.focusedItem).toBeFalsy();

            items[0].disabled = true;
            updateNavigatorItems();

            keyNavigator.onKeydown(createKeyboardEvent("keydown", null, 79, undefined, "o")); // types "o"
            tick(debounceInterval);

            expect(keyNavigator.focusedItem).toBeFalsy();
        }));

        it("should start looking for matches after the active item", fakeAsync(() => {
            items = [
                new FakeFocusable("Bilbo"),
                new FakeFocusable("Frodo"),
                new FakeFocusable("Pippin"),
                new FakeFocusable("Boromir"),
                new FakeFocusable("Aragorn"),
            ];
            updateNavigatorItems();

            keyNavigator.focusItem(1);
            keyNavigator.onKeydown(createKeyboardEvent("keydown", null, 66, undefined, "b"));
            tick(debounceInterval);

            expect(keyNavigator.focusedItem).toBe(items[3]);
        }));

        it("should wrap back around if there were no matches after the active item", fakeAsync(() => {
            items = [
                new FakeFocusable("Bilbo"),
                new FakeFocusable("Frodo"),
                new FakeFocusable("Pippin"),
                new FakeFocusable("Boromir"),
                new FakeFocusable("Aragorn"),
            ];
            updateNavigatorItems();

            keyNavigator.focusItem(3);
            keyNavigator.onKeydown(createKeyboardEvent("keydown", null, 66, undefined, "b"));
            tick(debounceInterval);

            expect(keyNavigator.focusedItem).toBe(items[0]);
        }));

        it("should wrap back around if the last item is active", fakeAsync(() => {
            keyNavigator.focusItem(2);
            keyNavigator.onKeydown(createKeyboardEvent("keydown", null, 79, undefined, "o"));
            tick(debounceInterval);

            expect(keyNavigator.focusedItem).toBe(items[0]);
        }));

        it("should be able to select the first item", fakeAsync(() => {
            keyNavigator.focusItem(-1);
            keyNavigator.onKeydown(createKeyboardEvent("keydown", null, 79, undefined, "o"));
            tick(debounceInterval);

            expect(keyNavigator.focusedItem).toBe(items[0]);
        }));

        it("should not do anything if there is no match", fakeAsync(() => {
            keyNavigator.focusItem(1);
            keyNavigator.onKeydown(createKeyboardEvent("keydown", null, 87, undefined, "w"));
            tick(debounceInterval);

            expect(keyNavigator.focusedItem).toBe(items[1]);
        }));
    });
});
