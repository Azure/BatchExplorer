import { Component } from "@angular/core";
import { AuthService, NavigatorService } from "app/services";
import { autobind } from "@batch-flask/core";
import { first } from "rxjs/operators";

@Component({
    selector: "be-welcome",
    templateUrl: "./welcome.html",
})
export class WelcomeComponent {
    public static breadcrumb() {
        return { name: "Home" };
    }

    constructor(
        private authService: AuthService,
        private navigationService: NavigatorService
    ) {}

    @autobind()
    public async signIn() {
        await this.authService.login();
        this.authService.isLoggedIn().pipe(first()).subscribe((isLoggedIn) => {
            if (isLoggedIn) {
                this.navigationService.goto("/accounts");
            }
        });
    }
}
