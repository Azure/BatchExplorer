# Write forms

## Create form

![](images/form.png)

You first need to use the `bl-create-form` componenent. You will need to pass the formGroup as an input and the submit method(Don't forget to autobind the submit)

```html
<bl-create-form [formGroup]="form" [submit]="submit" [sidebarRef]="sidebarRef">
    ...
</bl-create-form>
```

Now each forms is composed of multiple pages. The first page defined will be the first to be displayed. You can then later call otherPage.activate() to switch to a new page.

```html
<bl-create-form [formGroup]="form" [submit]="submit" [sidebarRef]="sidebarRef">
    <bl-form-page title="This form is for adding a new entity" [formGroup]="form">

    </bl-form-page>

    <bl-form-page title="Sub page" [formGroup]="form" #subPage>

    </bl-form-page>
</bl-create-form>
```

Each page is composed of multiple section(If only have 1 section do not provide the name and it will not show the title and left bar)

```html
<bl-create-form [formGroup]="form" [submit]="submit" [sidebarRef]="sidebarRef">
    <bl-form-page title="This form is for adding a new entity" [formGroup]="form">
        <bl-form-section title="General" subtitle="Main info">
            <input formControlName="mainInput1"></input>
            <input formControlName="mainInput2"></input>
        </bl-form-section>
        <bl-form-section title="Secondary" subtitle="Secondary info">
            <input formControlName="secondInput"></input>
        </bl-form-section>
    </bl-form-page>

    <bl-form-page title="Sub page" [formGroup]="form" #subPage>
        <!-- Simple section with no title-->
        <bl-form-section>
            <input formControlName="myOtherInput"></input>
        </bl-form-section>
    </bl-form-page>
</bl-create-form>
```
