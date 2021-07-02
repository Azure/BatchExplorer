import { isArray } from "@batch/ui-common/lib/util";

export interface ODataListJson<T> {
    value: T[];
    "odata.nextLink": string | undefined | null;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
export function isODataListJson<T>(obj: any): obj is ODataListJson<T> {
    return obj && obj.value && isArray(obj.value);
}

export function toODataList<T>(
    objList: T[],
    nextLink: string | undefined | null = null
): ODataListJson<T> {
    return {
        value: objList,
        "odata.nextLink": nextLink,
    };
}
