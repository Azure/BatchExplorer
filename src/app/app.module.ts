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
import {
    DEFAULT_USER_CONFIGURATION,
    LocaleService,
    MaterialModule,
    TranslationsLoaderService,
    USER_CONFIGURATION_STORE,
    USER_SERVICE,
} from "@batch-flask/core";
import { ElectronRendererModule } from "@batch-flask/electron";
import { LayoutModule } from "app/components/layout";
import { MiscModule } from "app/components/misc";
import {
    AdalService,
    AppLocaleService,
    AppTranslationsLoaderService,
    DEFAULT_BE_USER_CONFIGURATION,
    RendererConfigurationStore,
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
        ElectronRendererModule,
        RouterModule.forRoot(routes, {
            useHash: false,
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
        { provide: USER_CONFIGURATION_STORE, useClass: RendererConfigurationStore },
        { provide: DEFAULT_USER_CONFIGURATION, useValue: DEFAULT_BE_USER_CONFIGURATION },
        { provide: ErrorHandler, useClass: BatchExplorerErrorHandler },
        { provide: USER_SERVICE, useExisting: AdalService },
    ],
})
export class AppModule { }
