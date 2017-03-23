import { Component } from "@angular/core";

enum ListType {
    Favourite,
    All,
};

@Component({
    selector: "bl-account-home",
    templateUrl: "account-home.html",
})
export class AccountHomeComponent {
    public ListType = ListType;
    public showType: ListType = ListType.All;
}
