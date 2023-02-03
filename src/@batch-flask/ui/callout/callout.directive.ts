import { ConnectionPositionPair, Overlay, OverlayConfig, OverlayRef } from "@angular/cdk/overlay";
import { TemplatePortal } from "@angular/cdk/portal";
import { Directive, ElementRef, HostListener, Input, ViewContainerRef } from "@angular/core";
import { focusWithin } from "@batch-flask/core";
import { KeyCode } from "@batch-flask/core/keys";
import { Subscription } from "rxjs";
import { CalloutComponent } from "./callout.component";

@Directive({
    selector: "[blCallout]",
})
export class CalloutDirective {
    @Input("blCallout") public component: CalloutComponent;

    private _backDropClickSub: Subscription;
    private _overlayRef: OverlayRef | null = null;

    constructor(private elementRef: ElementRef, private overlay: Overlay, private viewContainerRef: ViewContainerRef) {

    }

    @HostListener("click", ["$event"])
    public handleClick(event: Event) {
        event.preventDefault();
        if (this._overlayRef) {
            this.close();
        } else {
            this.open();
        }
    }

    @HostListener("keydown", ["$event"])
    public onKeyDown(event: KeyboardEvent) {
        if (event.key === KeyCode.Enter || event.key === KeyCode.Space) {
            this.handleClick(event);
        }
    }

    public open() {
        this._overlayRef = this.overlay.create(this._getOverlayConfig());
        this._backDropClickSub = this._overlayRef.backdropClick().subscribe(() => {
            this.close();
        });

        const portal = new TemplatePortal(this.component.template, this.viewContainerRef);
        this._overlayRef.attach(portal);
        this._overlayRef.overlayElement.onkeydown = (event: KeyboardEvent) => {
            if (event.key === KeyCode.Escape) {
                this.close();
                this.elementRef.nativeElement.focus();
            }
        }
        focusWithin(this._overlayRef.overlayElement);
    }

    public close() {
        if (this._overlayRef) {
            this._overlayRef.dispose();
            this._overlayRef = null;
        }
        if (this._backDropClickSub) {
            this._backDropClickSub.unsubscribe();
            this._backDropClickSub = null;
        }
    }

    private _getOverlayConfig() {
        const positions: ConnectionPositionPair[] = [
            {
                originX: "start",
                originY: "bottom",
                overlayX: "start",
                overlayY: "top",
                offsetX: 0,
                offsetY: 5,
            },
            {
                originX: "start",
                originY: "top",
                overlayX: "start",
                overlayY: "bottom",
                offsetX: 0,
                offsetY: 5,
            },
            {
                originX: "end",
                originY: "bottom",
                overlayX: "end",
                overlayY: "top",
                offsetX: 0,
                offsetY: 5,
            },
            {
                originX: "end",
                originY: "top",
                overlayX: "end",
                overlayY: "bottom",
                offsetX: 0,
                offsetY: 5,
            },
        ];

        const positionStrategy = this.overlay.position().connectedTo(this.elementRef,
            { originX: "start", originY: "top" },
            { overlayX: "start", overlayY: "bottom" });
        positionStrategy.withPositions(positions);
        return new OverlayConfig({
            positionStrategy: positionStrategy,
            scrollStrategy: this.overlay.scrollStrategies.block(),
            hasBackdrop: true,
            backdropClass: "cdk-overlay-transparent-backdrop",
        });
    }
}
