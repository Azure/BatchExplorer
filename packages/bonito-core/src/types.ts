export type JsonValue = JsonPrimitive | JsonArray | JsonObject;
export type JsonPrimitive = string | boolean | number | undefined | null;
export type JsonObject = { [key: string]: JsonValue };
export type JsonArray = JsonValue[];

export type Mutable<T> = {
    -readonly [K in keyof T]: T[K];
};
