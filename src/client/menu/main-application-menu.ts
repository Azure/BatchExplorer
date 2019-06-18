import { Inject, Injectable, forwardRef } from "@angular/core";
import { AzureEnvironment, AzureEnvironmentService } from "@batch-flask/core/azure-environment";
import { log } from "@batch-flask/utils";
import { BatchExplorerApplication } from "client/core";
import { BatchExplorerProperties } from "client/core/properties";
import { TelemetryManager } from "client/core/telemetry/telemetry-manager";
import { HelpMenu } from "client/menu/help-menu";
import { ProxySettingsManager } from "client/proxy";
import { Constants } from "common";
import { BrowserWindow, Menu, MenuItem, MenuItemConstructorOptions, app } from "electron";
import { take } from "rxjs/operators";

function setupOSXSpecificMenu(template) {
    if (process.platform === "darwin") {
        const name = app.getName();
        template.unshift({
            label: name,
            submenu: [
                {
                    label: `About ${name}`,
                    role: "about",
                }, {
                    type: "separator",
                }, {
                    label: "Services",
                    role: "services",
                    submenu: [],
                }, {
                    type: "separator",
                }, { role: "hide" },
                { role: "hideothers" },
                { role: "unhide" },
                { type: "separator" },
                { label: "Quit", accelerator: "Command+Q", click: () => app.quit() },
            ],
        });

        // Window menu.
        (template[2].submenu as any[]).push({
            type: "separator",
        }, {
                label: "Bring All to Front",
                role: "front",
            });

    }
}

/**
 * Class handeling the main application menu
 */
@Injectable()
export class MainApplicationMenu {
    constructor(
        private helpMenu: HelpMenu,
        private telemetryManager: TelemetryManager,
        private proxySettings: ProxySettingsManager,
        private environmentService: AzureEnvironmentService,
        @Inject(forwardRef(() => BatchExplorerApplication)) private app: BatchExplorerApplication,
        private properties: BatchExplorerProperties) {
    }

    public async applyMenu() {
        const envs = await this.environmentService.envs.pipe(take(1)).toPromise();
        const template = [
            this._buildEditMenu(),
            this._buildViewMenu(),
            this._buildWindowMenu(),
            this._buildEnvironmentMenu(envs),
            this.helpMenu.getElectronMenu(),
        ];

        setupOSXSpecificMenu(template);

        const menu = Menu.buildFromTemplate(template);
        Menu.setApplicationMenu(menu);
    }

    private _buildEditMenu(): MenuItemConstructorOptions {
        return {
            label: "Edit",
            submenu: [
                { role: "undo" },
                { role: "redo" },
                { type: "separator" },
                { role: "cut" },
                { role: "copy" },
                { role: "paste" },
                { role: "delete" },
                { role: "selectall" },
                { type: "separator" },
                {
                    label: "Settings",
                    click: (_: MenuItem, window: BrowserWindow) => {
                        window.webContents.send(Constants.rendererEvents.navigateTo, "settings");
                    },
                    accelerator: "CmdOrCtrl+,",
                },
                {
                    label: "Configure Proxy",
                    click: () => {
                        this.proxySettings.configureManualy();
                    },
                },
                {
                    label: "Telemetry settings",
                    submenu: [
                        {
                            label: "Enabled (Restart required)",
                            type: "radio",
                            checked: this.telemetryManager.telemetryEnabled,
                            click: () => {
                                this.telemetryManager.enableTelemetry();
                            },
                        },
                        {
                            label: "Disabled (Restart required)",
                            type: "radio",
                            checked: !this.telemetryManager.telemetryEnabled,
                            click: () => {
                                this.telemetryManager.disableTelemetry();
                            },
                        },
                    ],
                },
            ],
        };
    }

    private _buildViewMenu(): MenuItemConstructorOptions {
        return {
            label: "View",
            submenu: [{
                label: "Reload",
                accelerator: "CmdOrCtrl+R",
                click: (item, focusedWindow) => {
                    if (focusedWindow) {
                        // on reload, start fresh and close any old
                        // open secondary windows
                        if (focusedWindow.id === 1) {
                            BrowserWindow.getAllWindows().forEach((win) => {
                                if (win.id > 1) {
                                    win.close();
                                }
                            });
                        }
                        focusedWindow.reload();
                    }
                },
            }, {
                label: "Toggle Full Screen",
                accelerator: (() => {
                    if (process.platform === "darwin") {
                        return "Ctrl+Command+F";
                    } else {
                        return "F11";
                    }
                })(),
                click: (item, focusedWindow) => {
                    if (focusedWindow) {
                        focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
                    }
                },
            }, {
                label: "Toggle Developer Tools",
                accelerator: (() => {
                    if (process.platform === "darwin") {
                        return "Alt+Command+I";
                    } else {
                        return "Ctrl+Shift+I";
                    }
                })(),
                click: (item, focusedWindow) => {
                    if (focusedWindow) {
                        (focusedWindow as any).toggleDevTools();
                    }
                },
            }],
        };
    }
    private _buildWindowMenu(): MenuItemConstructorOptions {
        return {
            label: "Window",
            role: "window",
            submenu: [
                {
                    label: "New Window",
                    accelerator: "CmdOrCtrl+Shift+N",
                    click: () => {
                        this.app.openNewWindow();
                    },
                },
                { role: "minimize" },
                { type: "separator" },
                { role: "close" },
            ],
        };
    }

    private _buildEnvironmentMenu(envs: AzureEnvironment[]): MenuItemConstructorOptions {
        return {
            label: "Environment",
            submenu: [{
                label: "Azure Environment",
                submenu: [
                    ...envs.map(env => this.envToMenu(env)),
                    { type: "separator" },
                    {
                        label: "Edit custom environments",
                        click: () => this.environmentService.editCustomEnvironments(),
                    },
                ],
            }],
        };
    }

    private envToMenu(env: AzureEnvironment): MenuItemConstructorOptions {
        return {
            label: `${env.name} [User]`,
            type: "radio",
            checked: this.properties.azureEnvironment.id === env.id,
            click: () => this.app.updateAzureEnvironment(env).catch((error) => {
                log.error("Error updating the azure environment", error);
            }),
        };
    }
}
