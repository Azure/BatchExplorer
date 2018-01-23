import { ChangeDetectionStrategy, Component } from "@angular/core";

import "./card.scss";

@Component({
    selector: "bl-card",
    template: "<ng-content></ng-content>",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {

}
