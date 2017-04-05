import { Record } from "immutable";

export type IconSources = "svg" | "fa";
export const IconSources = {
    svg: "svg" as IconSources,
    fa: "fa" as IconSources,
};

const IconRecord = Record({
    src: IconSources.fa,
    name: null,
});

export interface IconAttributes {
    src: IconSources;
    name: string;
}

export class Icon extends IconRecord {
    public src: IconSources;
    public name: string;

    constructor(data: IconAttributes)
    constructor(src: IconSources, name?: string)
    constructor(dataOrSrc: IconAttributes | IconSources, name?: string) {
        if (typeof dataOrSrc === "string") {
            super({ src: dataOrSrc, name });
        } else {
            super(dataOrSrc);
        }
    }
}
