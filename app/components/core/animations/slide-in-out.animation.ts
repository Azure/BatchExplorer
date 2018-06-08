import { animate, state, style, transition, trigger } from "@angular/animations";


export enum SlideDirection {
    LeftToRight,
    RightToLeft,
}

export interface SlideInAndOutOptions {
    time?: string;
    direction?: SlideDirection;
}

const defaultOptions: SlideInAndOutOptions = {
    time: "0.2s",
    direction: SlideDirection.RightToLeft,
};

const inPosition = {
    [SlideDirection.RightToLeft]: "100%",
    [SlideDirection.LeftToRight]: "-100%",
};

const outPosition = {
    [SlideDirection.RightToLeft]: "-100%",
    [SlideDirection.LeftToRight]: "100%",
};

export function slideInAndOutAnimation(name: string, options: SlideInAndOutOptions = {}) {
    options = Object.assign({}, defaultOptions, options);
    return trigger(name, [
        state("*",
            style({
                transform: "translateX(0)",
            }),
        ),
        transition(":enter", [
            style({
                transform: `translateX(${inPosition[options.direction]})`,
            }),
            animate(`${options.time} ease-in`),
        ]),
        transition(":leave", [
            animate(`${options.time} ease-out`, style({
                transform: `translateX(${outPosition[options.direction]})`,
            })),
        ]),
    ]);
}
