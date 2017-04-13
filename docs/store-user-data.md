# Storing user data / Cache data

If you want to store some user data locally or have some server response cached for later use you have multiple options:
| Option           | Description                                              | When to use                                                                                       |
|------------------|----------------------------------------------------------|---------------------------------------------------------------------------------------------------|
| localStorage     | Use the browser localStorage                             | The data you want to store is relatively small
                                                                                (A few tokens, current selected user, etc.). It will be persisted when you close the application. |
| LocalFileStorage | This will use the user appdata folder to store the file. | You want to use this when caching large data such as server response
                                                                                you want to be able to access instantly and will not change regularly.                            |


## Usage

### localStorage
Doc: ttps://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage

```ts
// You need to store a string. (Call JSON.stringify for javascript object)
localStorage.setItem("myKey", "myItem");
const myItem = localStorage.getItem("mykey"); // myItem => "myItem"
```

### LocalFileStorage

Local file storage is a Angular service that need to be injected in your component/service.
All action are async and returns rxjs observable you can subscribe to to.
```ts
import { LocalFileStorage } from "app/services";

class MyClass {
    constructor(storage: LocalFileStorage) {
        storage.set("my-filename.json", {foo: "bar"}).subscribe({
            next: () => {
                console.log("Saved file");
            },
            error: (e) => console.error("Error saving file", e),
        });

        storage.get("my-filename.json").subscribe({
            next: (data) => {
                console.log("Got file data", data); // Data is {foo: "bar"};
            },
            error: (e) => console.error("Error reading file", e),
        });
    }
}
```
