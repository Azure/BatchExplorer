import { ChangeDetectionStrategy, Component } from "@angular/core";

import "./getting-started-card.scss";

@Component({
    selector: "bl-getting-started-card",
    templateUrl: "getting-started-card.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GettingStartedCardComponent {
    constructor() {

    }
}
