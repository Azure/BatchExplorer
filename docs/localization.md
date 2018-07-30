# Localization in Batch Explorer

To make component localizable you can use one of the following
* `i18n` pipe
* `I18nService`

## Define key and language
The translations will be automatically read from files with the `i18n.yml` extension. e.g. `[filename].i18n.yml`
You'll need to restart the app if you add a new file. Just refreshing the page will update the translations.
Create a file with the name `[my-component].i18n.yml` next to the `[my-component].component.ts` and other files.

## Usage
### `i18n` Pipe
```html
<div>
    {{'my-key.my-sub-key' | i18n}}
</div>
```


### I18nService
```ts
class MyComponent {
    constructor(private i18n: I18nService){

    }

    public get title() {
        return this.i18n.t("my-key.sub.key", {param: "value"});
    }
}
```
