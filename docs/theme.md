# BatchExplorer prebuilt themes

* classic: default theme. All other themes will inherit from this one

## Adding attributes to the theme

1. Add the attribute to the `classic.json` theme
2. Update the `theme.schema.json` to allow color higlighting and autocomplete
3. Update the `theme-definition.model.ts`
4. Define the attribute(s) in the `theme.model.ts`

5. Optional: Set scss varialbes in `theme/core.scss` to be alias of css vars for you new attributes

## Use theme colors in javascript

```ts
import { ThemeService, Theme } from "app/services";
constructor(themeService: ThemeService) {
    // Don't forget to unsubscribe this sub in ngOnDestroy
    this._sub = themeService.currentTheme.subscribe((theme: Theme) => {
        // Access colors
        theme.mainBackground;
    });
}
```
