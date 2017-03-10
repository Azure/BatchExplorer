# Core controls

## Banner

Banner is a box used to notifiy the user something is wrong with their app. It provide some quick fix functionalities

![](banner.png)

Example for the image above

```html
<bl-banner fixMessage="Rerun task" [fix]="rerun" type="warning">
    <div [other-fix]="rerunDifferent" fixMessage="Rerun with different attributes"></div>
    <div message>{{exitCodeMessage}}</div>
</bl-banner>
```

```typescript
export class MyComponent {

    @autobind()
    public rerun() {
        return Observable.of(true); // Do your quickfix here
    }

    @autobind()
    public rerunDifferent() {
        return Observable.of(true); // Do your quickfix here
    }
}
```

