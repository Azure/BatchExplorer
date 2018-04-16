/**
 * Decorator to be used on boolean angular input.
 * This will allow the flag to be provided without expliclitly setting to true.
 *
 * @example
 * Same for true:
 * <my-input flag></my-input>
 * <my-input [flag]="true"></my-input>
 *
 * Same for false:
 * <my-input></my-input>
 * <my-input [flag]="false"></my-input>
 */
export function FlagInput(): any {
    return flagMethod;
}

function flagMethod(target, key: string, descriptor: TypedPropertyDescriptor<boolean>) {
    Object.defineProperty(target, key, {
        configurable: true,
        get: function () {
            return this[`_${key}`];
        },
        set: function (value) {
            this[`_${key}`] = coerceBooleanProperty(value);
        },
    });
}

export function coerceBooleanProperty(value: boolean | undefined | null): boolean {
    return value != null && `${value}` !== "false";
}
