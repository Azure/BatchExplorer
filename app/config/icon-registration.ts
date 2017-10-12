import { MatIconRegistry } from "@angular/material";
import { DomSanitizer } from "@angular/platform-browser";

/**
 * This is used to register all the needed icons to material icon registry.
 */
export function registerIcons(registry: MatIconRegistry, sanitizer: DomSanitizer) {
    // Make font awesome default
    registry.setDefaultFontSetClass("fa");

    // SVG logos
    registry
        .addSvgIcon("centos", sanitizer.bypassSecurityTrustResourceUrl("./assets/images/logos/centos.svg"))
        .addSvgIcon("debian", sanitizer.bypassSecurityTrustResourceUrl("./assets/images/logos/debian.svg"))
        .addSvgIcon("oracle", sanitizer.bypassSecurityTrustResourceUrl("./assets/images/logos/oracle.svg"))
        .addSvgIcon("suse", sanitizer.bypassSecurityTrustResourceUrl("./assets/images/logos/suse.svg"))
        .addSvgIcon("ubuntu", sanitizer.bypassSecurityTrustResourceUrl("./assets/images/logos/ubuntu.svg"));
}
