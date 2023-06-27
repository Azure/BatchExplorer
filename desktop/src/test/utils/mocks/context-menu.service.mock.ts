import { ContextMenu, ContextMenuService } from "@batch-flask/ui/context-menu";

export class ContextMenuServiceMock {
    public openMenu: jasmine.Spy;
    public lastMenu: ContextMenu;

    constructor() {
        this.openMenu = jasmine.createSpy("openMenu").and.callFake((menu) => {
            this.lastMenu = menu;
        });
    }

    public asProvider() {
        return { provide: ContextMenuService, useValue: this };
    }
}
