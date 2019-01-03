import { HashLocationStrategy, LocationStrategy } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { ErrorHandler, NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { PreloadAllModules, RouterModule } from "@angular/router";

// application router
import { routes } from "./app.routes";

// components
import { AppComponent } from "app/app.component";

// extenal modules
import { BaseModule } from "@batch-flask/ui";
import { AccountModule } from "app/components/account/account.module";
import { FileModule } from "app/components/file/file.module";
import { SettingsModule } from "app/components/settings";

// unhandled application error handler
import { BatchExplorerErrorHandler } from "app/error-handler";

// services
import { LocaleService, MaterialModule, TranslationsLoaderService } from "@batch-flask/core";
import { LayoutModule } from "app/components/layout";
import { MiscModule } from "app/components/misc";
import {
    AppLocaleService,
    AppTranslationsLoaderService,
} from "./services";
import { RendererTelemetryModule } from "./services/telemetry";

const modules = [
    AccountModule,
    FileModule,
    SettingsModule,
    LayoutModule,
    MiscModule,
];

@NgModule({
    bootstrap: [
        AppComponent,
    ],
    declarations: [
        AppComponent,
    ],
    entryComponents: [
        // imported in specific area modules
    ],
    imports: [
        NoopAnimationsModule,
        BrowserModule,
        FormsModule,
        MaterialModule,
        ReactiveFormsModule,
        RendererTelemetryModule,
        RouterModule.forRoot(routes, {
            // useHash: true,
            paramsInheritanceStrategy: "always",
            preloadingStrategy: PreloadAllModules,
        }),
        BaseModule,
        HttpClientModule,
        ...modules,
    ],
    providers: [
        { provide: LocationStrategy, useClass: HashLocationStrategy },
        { provide: TranslationsLoaderService, useClass: AppTranslationsLoaderService },
        { provide: LocaleService, useClass: AppLocaleService },
        { provide: ErrorHandler, useClass: BatchExplorerErrorHandler },
    ],
})
export class AppModule { }
