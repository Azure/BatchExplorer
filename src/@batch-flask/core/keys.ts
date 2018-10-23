// tslint:disable:variable-name
export const ENTER = "Enter";
export const SPACE = " ";

/**
 * Mapping of the key to keyCode
 */
export const KeyCodes = {
    [ENTER]: 13,
    [SPACE]: 32,
};

/**
 * Possible values for keyboardEvent.code
 * This corespond to phisical keys on the keyboard
 */
export enum KeyCode {
    ArrowDown = "ArrowDown",
    ArrowUp = "ArrowUp",
    Space = "Space",
    Enter = "Enter",
}
