import { BatchLabsApplication } from "client/core";
import { BrowserWindow, Menu, MenuItemConstructorOptions, app } from "electron";

const editMenu: MenuItemConstructorOptions = {
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
    ],
};

const viewMenu: MenuItemConstructorOptions = {
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

function getWindowMenu(batchLabsApp: BatchLabsApplication): MenuItemConstructorOptions {
    return {
        label: "Window",
        role: "window",
        submenu: [
            {
                label: "New Window",
                accelerator: "CmdOrCtrl+Shift+N",
                click: () => {
                    batchLabsApp.openNewWindow();
                },
            },
            { role: "minimize" },
            { type: "separator" },
            { role: "close" },
        ],
    };
}

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
export function setMenu(app: BatchLabsApplication) {
    const template = [
        editMenu,
        viewMenu,
        getWindowMenu(app),
    ];
    setupOSXSpecificMenu(template);
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}
