import { isArray } from "lodash";

export interface ODataListJson<T> {
    value: T[];
    "odata.nextLink": string;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
export function isODataListJson<T>(obj: any): obj is ODataListJson<T> {
    return obj && obj.value && isArray(obj.value);
}
