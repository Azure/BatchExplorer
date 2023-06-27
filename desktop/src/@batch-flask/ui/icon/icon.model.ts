import { Model, Prop, Record } from "@batch-flask/core/record";

export enum IconSources {
    svg = "svg",
    fa = "fa",
}

export interface IconAttributes {
    src: IconSources;
    name: string;
}

@Model()
export class Icon extends Record<IconAttributes> {
    @Prop() public src: IconSources;
    @Prop() public name: string;

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
