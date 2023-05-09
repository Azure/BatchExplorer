# Building Localization on Local Machine

## Building the English File (Any Machine)

To build the latest English translation file from the YAML files:

* Run `npm run build-translations`
* If you are removing lines from a YAML file, run `npm run loc:clean` first to clear out previously built translation files

* `web/dev-server/resources/i18n/resources.en.json` contains web English strings (web + all packages)
* `desktop/resources/i18n/resources.en.json` contains desktop English strings (desktop + all packages)

## Building Translations Files for Other Languages (Windows-Only)

To build the localization translations for all languages besides English:

* Follow the step above first (build the English file)
* Install the latest, recommended version of nuget.exe from <https://www.nuget.org/downloads> at C:\Users\{userName}, for instance.
* Navigate to the root of the repository
* Run `npm run loc:restore` to install all dependencies
* If needed, run `npm run loc:clean` to clear out all previously built translation files
* Run `npm run loc:build` to build the translations, move them to the package directories, and combine them altogether in one directory
* Run `npm run build-translations` to build the full, compiled translations for the web and desktop packages

* `web/dev-server/resources/i18n` contains web translations (web + all packages)
* `desktop/resources/i18n` contains desktop translations (desktop + all packages)
