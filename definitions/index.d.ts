
/* eslint-disable */

declare type Environment = "production" | "development" | "test";
declare const ELECTRON_ENV: "renderer" | "main";

// Gloval variables set by webpack
declare const ENV: Environment;


type StringMap<V> = { [key: string]: V };

type AttrOf<T> = {
    [P in keyof T]: T[P];
};

type ComponentSize = "small" | "normal" | "large";
