import { Component, EventEmitter, HostBinding, Input, Output } from "@angular/core";
import { Sku } from "app/models";

const iconMapping = {
    "UbuntuServer": { src: "svg", name: "ubuntu" },
    "CentOS": { src: "svg", name: "centos" },
    "CentOS-HPC": { src: "svg", name: "centos" },
    "WindowsServer": { src: "fa", name: "fa-windows" },
    "Debian": { src: "svg", name: "debian" },
    "Oracle-Linux": { src: "svg", name: "oracle" },
    "linux-data-science-vm": { src: "fa", name: "fa-linux" },
    "openSUSE-Leap": { src: "svg", name: "suse" },
    "SLES": { src: "svg", name: "suse" },
    "SLES-HPC": { src: "svg", name: "suse" },
    "standard-data-science-vm": { src: "fa", name: "fa-windows" },
};


@Component({
    selector: "bl-os-offer-tile",
    templateUrl: "os-offer-tile.html",
})
export class OsOfferTileComponent {
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

    public onClickTile() {
        this.pickOffer.emit();
    }

    public onClickSku(sku) {
        this.pickSku.emit(sku);
    }

    public get icon() {
        const icon = iconMapping[this.name];
        if (icon) {
            return icon;
        } else {
            return { src: "fa", name: "" }; // TODO find unknown icon
        }
    }
}
