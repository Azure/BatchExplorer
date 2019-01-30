import { ChangeDetectionStrategy, Component, OnDestroy } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { EntityConfigurationView, UserConfigurationService } from "@batch-flask/core";
import { BEUserDesktopConfiguration } from "app/services";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import "./settings.scss";

export interface SettingsSelection {
    entityConfigurationDefaultView: EntityConfigurationView;
    subscriptionsIgnore: string[];
    fileAssociations: Array<{ extension: string, type: string }>;
    defaultUploadContainer: string;
    nodeConnectDefaultUsername: string;
    updateChannel: string;
    updateOnQuit: boolean;
    githubDataRepo: string;
    githubDataBranch: string;
    defaultOutputFileGroup: string;
    theme: string;
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
    private _destroy = new Subject();
    private _lastValue: string | null = null;

    constructor(
        private userConfigurationService: UserConfigurationService<BEUserDesktopConfiguration>,
        formBuilder: FormBuilder) {
        this.form = formBuilder.group({
            theme: [null],
            entityConfigurationDefaultView: [null],
            subscriptionsIgnore: [[]],
            fileAssociations: [[]],
            defaultUploadContainer: [""],
            nodeConnectDefaultUsername: [""],
            updateChannel: [""],
            updateOnQuit: [true],
            githubDataRepo: [""],
            githubDataBranch: [""],
            defaultOutputFileGroup: [""],
        });

        this.userConfigurationService.config.pipe(takeUntil(this._destroy)).subscribe((config) => {
            const selection: SettingsSelection = {
                theme: config.theme,
                entityConfigurationDefaultView: config.entityConfiguration.defaultView,
                subscriptionsIgnore: config.subscriptions.ignore,
                fileAssociations: config.fileAssociations,
                defaultUploadContainer: config.storage.defaultUploadContainer,
                nodeConnectDefaultUsername: config.nodeConnect.defaultUsername,
                updateChannel: config.update.channel,
                updateOnQuit: config.update.updateOnQuit,
                githubDataRepo: config.githubData.repo,
                githubDataBranch: config.githubData.branch,
                defaultOutputFileGroup: config.jobTemplate.defaultOutputFileGroup,
            };
            this._lastValue = JSON.stringify(selection);
            this.form.patchValue(selection, { emitEvent: false });
        });

        this.form.valueChanges.pipe(takeUntil(this._destroy)).subscribe((selection) => {
            if (JSON.stringify(selection) !== this._lastValue) {
                const config = this._buildConfig(selection);
                this.userConfigurationService.patch(config);
            }
        });
    }

    public ngOnDestroy() {
        this._destroy.next();
        this._destroy.complete();
    }

    public reset() {
        this.userConfigurationService.reset();
    }

    private _buildConfig(selection: SettingsSelection): Partial<BEUserDesktopConfiguration> {
        return {
            theme: selection.theme,
            fileAssociations: selection.fileAssociations,
            entityConfiguration: {
                defaultView: selection.entityConfigurationDefaultView,
            },
            subscriptions: {
                ignore: selection.subscriptionsIgnore,
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
            jobTemplate: {
                defaultOutputFileGroup: selection.defaultOutputFileGroup,
            },

        };
    }
}
