# Building Localization on Local Machine

## Building the English File

To build the latest English translation resjson file from the YAML files:

* Run `npm run build` to build translations for the entire repository
* Run `npm run build-translations` in any package directory (desktop, packages/*) to build translations for a specific package

The output will be in `{packageName}/i18n/resources.resjson`

## Building Translations Files for Other Languages (Windows-Only)

To build the localization translations for all languages besides English:

* Follow the steps above first
* Install the latest, recommended version of nuget.exe from <https://www.nuget.org/downloads> at C:\Users\{userName}, for instance.
* Navigate to the root of the repository
* Run `npm run loc:restore` to install all dependencies
* Run `npm run loc:build` to build the translations and move them to their correct directories
* If needed, run `npm run clean` to clear out all previously built translation files

The output will be in `{packageName}/resources/i18n`

* `{packageName}/resources/i18n/resjson` contains RESJSON translations
* `{packageName}/resources/i18n/json` contains JSON translations (RESJSON syntax and comments have been stripped out)
