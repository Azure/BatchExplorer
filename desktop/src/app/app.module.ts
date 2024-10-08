import { HashLocationStrategy, LocationStrategy } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { ErrorHandler, NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { PreloadAllModules, RouterModule } from "@angular/router";
import {
    LocaleService,
    MaterialModule,
    TranslationsLoaderService,
    USER_CONFIGURATION_STORE,
    USER_SERVICE,
} from "@batch-flask/core";
import { ElectronRendererModule } from "@batch-flask/electron";
import { BaseModule, KeyBindingsModule } from "@batch-flask/ui";
import { AppComponent } from "app/app.component";
import { AccountModule } from "app/components/account/account.module";
import { FileModule } from "app/components/file/file.module";
import { LayoutModule } from "app/components/layout";
import { MiscModule } from "app/components/misc";
import { SettingsModule } from "app/components/settings";
import { WelcomeModule } from "app/components/welcome";
import { BatchExplorerErrorHandler } from "app/error-handler";
import { AuthModule } from "app/components/auth";
import { routes } from "./app.routes";
import {
    AuthService,
    AppLocaleService,
    AppTranslationsLoaderService,
    RendererConfigurationStore,
} from "./services";
import { RendererTelemetryModule } from "./services/telemetry";

const modules = [
    AccountModule,
    FileModule,
    AuthModule,
    SettingsModule,
    LayoutModule,
    WelcomeModule,
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
            relativeLinkResolution: "legacy"
        }),
        BaseModule,
        KeyBindingsModule,
        HttpClientModule,
        ...modules,
    ],
    providers: [
        { provide: LocationStrategy, useClass: HashLocationStrategy },
        { provide: TranslationsLoaderService, useClass: AppTranslationsLoaderService },
        { provide: LocaleService, useClass: AppLocaleService },
        { provide: USER_CONFIGURATION_STORE, useClass: RendererConfigurationStore },
        { provide: ErrorHandler, useClass: BatchExplorerErrorHandler },
        { provide: USER_SERVICE, useExisting: AuthService },
    ],
})
export class AppModule { }
