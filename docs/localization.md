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
    {{'my-component.my-sub-key' | i18n}}
</div>
```

#### Use a namespace

Repeating the same starting namespace for all of the i18n pipes can get repetivie and make it hard to read the template.
So you can define a namespace for the component and the pipe will try to load translation under that namespace as well as from the root.

To do so

```ts
@Component({
    selector: "my-component",
    providers: [
        {provide: I18N_NAMESPACE, value: "my-component"},
    ]
})
```

then you can just use

```html
<!-- This -->
<div>{{my-sub-key' | i18n}}</div>
<!-- Instead of -->
<div>{{'my-component.my-sub-key' | i18n}}</div>
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
