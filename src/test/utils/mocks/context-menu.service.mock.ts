import { ContextMenuService } from "@bl-common/ui/context-menu";

export class ContextMenuServiceMock {
    public openMenu: jasmine.Spy;

    constructor() {
        this.openMenu = jasmine.createSpy("openMenu");
    }

    public asProvider() {
        return { provide: ContextMenuService, useValue: this };
    }
}
