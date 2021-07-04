import {
    AfterViewInit,
    Component,
    ElementRef,
    Input,
    OnChanges,
    OnDestroy,
    ViewChild,
} from "@angular/core";
import { defaultTheme, getTheme } from "@batch/ui-react";
import { ThemeProvider } from '@fluentui/react-theme-provider';
import * as React from "react";
import * as ReactDOM from "react-dom";

const theme = getTheme(defaultTheme);

export const ReactWrapper: React.FC = props => {
    return React.createElement(ThemeProvider, {theme: theme.get()}, props.children);
};

export const NoComponentFound: React.FC = props => {
    return React.createElement("div", {className: "be-no-component-found"});
};

@Component({
    selector: "bl-reactcontainer",
    template: `<div class="react-root" #container></div>`
})
export class ReactContainerComponent<P> implements AfterViewInit, OnChanges, OnDestroy {

    @ViewChild('container') rootElement: ElementRef;

    @Input() public component: React.FC<P> | React.ComponentClass<P>
    @Input() public props: P;

    private _initialized: boolean = false;
    private _isMounted: boolean = false;

    ngAfterViewInit() {
        this._initialized = true;
        this._render();
        this._isMounted = true;
    }

    ngOnChanges() {
        if (this._initialized) {
            this._render();
        }
    }

    private _render() {
        ReactDOM.render(
            React.createElement(ReactWrapper, null,
                React.createElement(this.component ?? NoComponentFound, this.props)
            )
        , this.rootElement.nativeElement);
    }

    ngOnDestroy(): void {
        if (this._isMounted) {
            ReactDOM.unmountComponentAtNode(this.rootElement.nativeElement);
        }
    }

}
