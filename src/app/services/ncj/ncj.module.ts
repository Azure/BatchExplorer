import { NgModule } from "@angular/core";
import { LocalTemplateService } from "./local-template.service";
import { NcjTemplateService } from "./ncj-template.service";
import { PortfolioService } from "./portfolio/portfolio.service";

@NgModule({
    providers: [
        LocalTemplateService,
        PortfolioService,
        NcjTemplateService,
    ],
})
export class NcjModule {
}
