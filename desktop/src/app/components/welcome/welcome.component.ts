import { Component, OnInit } from "@angular/core";
import { AuthService, NavigatorService, SafeStorageService } from "app/services";
import { autobind } from "@batch-flask/core";
import { first } from "rxjs/operators";

@Component({
    selector: "be-welcome",
    templateUrl: "./welcome.html",
})
export class WelcomeComponent implements OnInit {
    public encryptionUnavailable = false;

    public static breadcrumb() {
        return { name: "Home" };
    }

    constructor(
        private authService: AuthService,
        private navigationService: NavigatorService,
        private safeStorage: SafeStorageService
    ) {}

    public async ngOnInit() {
        // Check if encryption is available
        try {
            this.encryptionUnavailable = !(await this.safeStorage.isEncryptionAvailable());
        } catch (error) {
            console.warn("Failed to check encryption availability:", error);
            this.encryptionUnavailable = true;
        }
    }

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
