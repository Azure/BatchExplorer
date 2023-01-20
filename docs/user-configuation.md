# How to add a setting to Batch Explorer

When to use a setting

* To have the user configure his experience instead of forcing on him a fixed choice.
* The value makes sense to be edited by the user directly

When not to use a setting. Use other data store for those.

* To save the last used value
* To cache anything

## Add the setting definition

Open `src/common/be-user-configuration.model.ts` there is 2 interfaces:

* `BEUserConfiguration`: This is for settings that should be used in the browser and desktop app version(Even if browser version doesn't exists now)
* `BEUserDesktopConfiguration`: This is for settings that only makes sense when used inside of the destkop application
* There is a 3rd option if the settings is to be used in code inside `@batch-flask`. In that case edit `BatchFlaskUserConfiguration`

Pick which one corespond to your needs and add the attribute definition.

Update `DEFAULT_BE_USER_CONFIGURATION` with the default value for your setting. It can be `null` if needs be.

## Use the setting

Now that you have a setting available to use it inject `UserConfigurationService` into your service or component and use the interface where you added the settings as the generic type(BEUserConfiguration, BEDesktopUserConfiguration, etc.).

```ts

class MyComponent {
    constructor(
        private settingsService: UserConfigurationService<BEUserConfiguration>,
    )
}
```

## Provide UI to update that setting

Update the settings component `src/app/components/settings/settings.component.ts`

1. Update the `SettingsSelection` interface with your setting. This interface corespond to the value of the form. It might be the same as the setting you added earlier or in another format that makes more sense to use in a form.
2. Update the `formBuider.group({})` section to initalize your new control
3. Update the `_buildConfig` method to convert from the Selection to the settings model
4. Update the `SettingsSelection` building section to convert from the settings model to the Selection
5. Update the html to update your new control

Now sometimes settings could make sense to have inline updates somewhere else in another component. You can do that and call the `set` method on the `UserConfigurationService` to update your new setting
