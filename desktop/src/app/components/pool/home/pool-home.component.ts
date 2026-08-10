import { Component, OnDestroy } from "@angular/core";
import { UserConfigurationService, autobind } from "@batch-flask/core";
import { DialogService } from "@batch-flask/ui/dialogs";
import { SidebarManager } from "@batch-flask/ui/sidebar";
import { BEUserConfiguration, DEFAULT_BE_USER_CONFIGURATION } from "common";
import { Subscription, from } from "rxjs";
import { finalize } from "rxjs/operators";
import { PoolCreateBasicDialogComponent } from "../action";

@Component({
    standalone: false,
    selector: "bl-pool-home",
    templateUrl: "pool-home.html",
})
export class PoolHomeComponent implements OnDestroy {
    public config: BEUserConfiguration = DEFAULT_BE_USER_CONFIGURATION;
    public isRunning = false;
    private _configSub: Subscription;

    private _multiRegionPoolBootstrapService = {
        run: () => new Promise<void>((resolve) => {
            setTimeout(resolve, 150);
        }),
    };

    public static breadcrumb() {
        return { name: "Pools" };
    }
    constructor(
        private sidebarManager: SidebarManager,
        private dialogService: DialogService,
        private userConfigService: UserConfigurationService<BEUserConfiguration>) {
        this._configSub = this.userConfigService.config.subscribe((config) => {
            this.config = config;
        });
    }

    @autobind()
    public addPool() {
        this.sidebarManager.open("add-pool", PoolCreateBasicDialogComponent);
    }

    @autobind()
    public startMultiRegionPoolBootstrap() {
        if (this.isRunning) {
            return;
        }

        this.dialogService.confirm("Start multi-region pool bootstrap?", {
            description: "This starts the multi-region pool bootstrap flow.",
            yes: () => {
                this.isRunning = true;
                return from(this._multiRegionPoolBootstrapService.run()).pipe(
                    finalize(() => {
                        this.isRunning = false;
                    }),
                );
            },
        });
    }

    public ngOnDestroy() {
        if (this._configSub) {
            this._configSub.unsubscribe();
        }
    }
}
