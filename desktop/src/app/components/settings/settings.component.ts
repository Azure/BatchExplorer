import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { EntityConfigurationView, UserConfigurationService, autobind } from "@batch-flask/core";
import { BEUserConfiguration, DEFAULT_BE_USER_CONFIGURATION } from "common";
import { Subject } from "rxjs";
import { debounceTime, takeUntil } from "rxjs/operators";

import "./settings.scss";

export interface SettingsSelection {
    entityConfigurationDefaultView: EntityConfigurationView;
    subscriptionsIgnore: Array<{ pattern: string }>;
    fileAssociations: Array<{ extension: string, type: string }>;
    defaultUploadContainer: string;
    nodeConnectDefaultUsername: string;
    updateChannel: string;
    updateOnQuit: boolean;
    githubDataRepo: string;
    githubDataBranch: string;
    theme: string;
    externalBrowserAuth: boolean;
}

@Component({
    selector: "bl-settings",
    templateUrl: "settings.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent implements OnDestroy {
    public static breadcrumb(params, queryParams) {
        return { name: "Settings" };
    }

    public form: FormGroup<SettingsSelection>;
    public viewerOptions = ["log", "code", "image"];
    public saved = false;
    public modified = false;
    private _destroy = new Subject();
    private _lastValue: string | null = null;

    constructor(
        private userConfigurationService: UserConfigurationService<BEUserConfiguration>,
        private changeDetector: ChangeDetectorRef,
        formBuilder: FormBuilder) {
        this.form = formBuilder.group({
            theme: [null],
            externalBrowserAuth: [true],
            entityConfigurationDefaultView: [null],
            subscriptionsIgnore: [[]],
            fileAssociations: [[]],
            defaultUploadContainer: [""],
            nodeConnectDefaultUsername: [""],
            updateChannel: [""],
            updateOnQuit: [true],
            githubDataRepo: [""],
            githubDataBranch: [""],
        });

        this.userConfigurationService.config.pipe(takeUntil(this._destroy))
        .subscribe((config: BEUserConfiguration) => {
            this.modified = JSON.stringify(config) !== JSON.stringify(DEFAULT_BE_USER_CONFIGURATION);
            this.changeDetector.markForCheck();

            const selection: SettingsSelection = {
                theme: config.theme,
                externalBrowserAuth: config.externalBrowserAuth,
                entityConfigurationDefaultView: config.entityConfiguration.defaultView,
                subscriptionsIgnore: config.subscriptions.ignore.map(x => ({ pattern: x })),
                fileAssociations: config.fileAssociations,
                defaultUploadContainer: config.storage.defaultUploadContainer,
                nodeConnectDefaultUsername: config.nodeConnect.defaultUsername,
                updateChannel: config.update.channel,
                updateOnQuit: config.update.updateOnQuit,
                githubDataRepo: config.githubData.repo,
                githubDataBranch: config.githubData.branch,
            };
            this._lastValue = JSON.stringify(selection);
            this.form.patchValue(selection, { emitEvent: false });
        });

        this.form.valueChanges.pipe(
            takeUntil(this._destroy),
            debounceTime(400),
        ).subscribe(async (selection) => {
            if (JSON.stringify(selection) !== this._lastValue) {
                const config = this._buildConfig(selection);
                this.userConfigurationService.patch(config);
                this.saved = true;
                this.changeDetector.markForCheck();
                await new Promise(r => setTimeout(r, 1000));
                this.saved = false;
                this.changeDetector.markForCheck();
            }
        });
    }

    @autobind()
    public updateExternalBrowserAuth(value: boolean) {
        this.form.get("externalBrowserAuth").setValue(value);
        this.changeDetector.markForCheck();
    }

    public ngOnDestroy() {
        this._destroy.next();
        this._destroy.complete();
    }

    public reset() {
        this.userConfigurationService.reset();
    }

    private _buildConfig(selection: SettingsSelection): Partial<BEUserConfiguration> {
        return {
            theme: selection.theme,
            externalBrowserAuth:  selection.externalBrowserAuth,
            fileAssociations: selection.fileAssociations,
            entityConfiguration: {
                defaultView: selection.entityConfigurationDefaultView,
            },
            subscriptions: {
                ignore: selection.subscriptionsIgnore.map(x => x.pattern),
            },
            update: {
                channel: selection.updateChannel,
                updateOnQuit: selection.updateOnQuit,
            },
            storage: {
                defaultUploadContainer: selection.defaultUploadContainer,
            },
            nodeConnect: {
                defaultUsername: selection.nodeConnectDefaultUsername,
            },
            githubData: {
                repo: selection.githubDataRepo,
                branch: selection.githubDataBranch,
            },
        };
    }
}
