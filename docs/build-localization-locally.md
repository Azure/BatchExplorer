# Building Localization on Local Machine

## Building the English File

To build the latest English translation resjson file from the YAML files:

* Run `npm run build-translations` to build the English files for each package

The output will be in `{packageName}/i18n/resources.resjson`

## Building Translations Files for Other Languages (Windows-Only)

To build the localization translations for all languages besides English:

* Follow the step above first (build the English file)
* Install the latest, recommended version of nuget.exe from <https://www.nuget.org/downloads> at C:\Users\{userName}, for instance.
* Navigate to the root of the repository
* Run `npm run loc:restore` to install all dependencies
* Run `npm run loc:build` to build the translations, move them to the package directories, and combine them altogether in one directory
* If needed, run `npm run clean` to clear out all previously built translation files

The files for each package will be in `{packageName}/resources/i18n`

* `{packageName}/resources/i18n/resjson` contains RESJSON translations
* `{packageName}/resources/i18n/json` contains JSON translations (RESJSON syntax and comments have been stripped out)

The files with all translations combined across packages will be in `Localize/final`
