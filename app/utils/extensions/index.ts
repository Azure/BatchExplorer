import { MdSidenav } from "@angular/material";
import "./string";

// MdSidenav.prototype.isFocusTrapDisabled = () => true;
Object.defineProperty(MdSidenav.prototype, "isFocusTrapDisabled", {
    get: () => true,
});
