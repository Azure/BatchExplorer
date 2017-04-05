import { Component, EventEmitter, HostBinding, Input, OnChanges, Output } from "@angular/core";
import { Sku } from "app/models";
import { PoolUtils } from "app/utils";

@Component({
    selector: "bl-os-offer-tile",
    templateUrl: "os-offer-tile.html",
})
export class OsOfferTileComponent implements OnChanges {
    @HostBinding("class.active")
    @Input()
    public active: boolean;

    @Input()
    public name: string;

    @Input()
    public selectedSku: string;

    @Input()
    public skus: Sku[];

    @Output()
    public pickOffer = new EventEmitter();

    @Output()
    public pickSku = new EventEmitter();

    public icon: any;

    public ngOnChanges(inputs) {
        if (inputs.name) {
            this.icon = PoolUtils.iconForOffer(this.name);
        }
    }

    public onClickTile() {
        this.pickOffer.emit();
    }

    public onClickSku(sku) {
        this.pickSku.emit(sku);
    }
}
