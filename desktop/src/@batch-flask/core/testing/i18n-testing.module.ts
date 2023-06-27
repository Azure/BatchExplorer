import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { I18nUIModule } from "@batch-flask/ui";
import { TranslationsLoaderService } from "../i18n";

const publicComponents = [];
const privateComponents = [];

export class TestTranslatationsLoaderService extends TranslationsLoaderService {
    public translations = new Map<string, string>();
}

@NgModule({
    imports: [CommonModule, I18nUIModule],
    declarations: [...publicComponents, ...privateComponents],
    exports: [...publicComponents, I18nUIModule],
    entryComponents: [],
    providers: [
        { provide: TranslationsLoaderService, useClass: TestTranslatationsLoaderService },
    ],
})
export class I18nTestingModule {

    public static withTranslations(translations: StringMap<string>) {
        const service = new TestTranslatationsLoaderService();

        for (const [key, translation] of Object.entries(translations)) {
            service.translations.set(key, translation);
        }
        return {
            ngModule: I18nTestingModule,
            providers: [
                { provide: TranslationsLoaderService, useValue: service },
            ],
        };
    }
}
