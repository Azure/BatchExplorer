import { ChangeDetectionStrategy, Component, Input } from "@angular/core";

import "./location.scss";

export const countryCodes = {
    eastasia: "HK",
    southeastasia: "SG",
    centralus: "US",
    eastus: "US",
    eastus2: "US",
    westus: "US",
    northcentralus: "US",
    southcentralus: "US",
    northeurope: "IE",
    westeurope: "NL",
    japanwest: "jp",
    japaneast: "jp",
    brazilsouth: "br",
    australiaeast: "AU",
    australiasoutheast: "AU",
    southindia: "IN",
    centralindia: "IN",
    westindia: "IN",
    canadacentral: "CA",
    canadaeast: "CA",
    uksouth: "GB",
    ukwest: "GB",
    westcentralus: "US",
    westus2: "US",
    koreacentral: "KR",
    koreasouth: "KR",
    francecentral: "FR",
    francesouth: "FR",
    australiacentral: "AU",
    australiacentral2: "AU",
    eastus2euap: "US",
    centraluseuap: "US",
};

@Component({
    selector: "bl-location",
    templateUrl: "location.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocationComponent {
    @Input() public location: string;

}
