# Calling python from the javascript

There is a rpc server that starts automaticaly when you start the app that allows you to run python code from the browser.

## Step 0: Setup python

Install python > 3.6 **Important: Batch Explorer will look for python and check the version is more than 3.6 before starting the server**
It will scan for executable in the path called `python3` or `python`. If your python is not in your path you can set the environment variable `BL_PYTHON_PATH` with the path to python 3.6.

## Step 1: Write the python controller

In `python/controllers` open/create a controller file(It will be loaded automatically).

```python
from server.app import app
# Give the name of the procedure in `app.procedure` decorator.
@app.procedure("foo")
def foo(request, param1, param2):
    print("got data", param1, param2)
    # Return a dict that can be converted to JSON(The conversion is done automatically)
    return {"what": "it works!"}
```

## Step 2: Call the python procedure from the javascript

```ts
import {PythonRpcService} from "app/services";

// Inject service in constructor
constructor(pythonRpcService: PythonRpcService) {

}

// Call the python methods
pythonRpcService.call("foo", ["abc", "def"]).subscribe({
    next: (data) => console.log("Got foo", data),
    error: (err) => console.log("Error foo", err),
});
pythonRpcService.call("other", ["abc", "def"]).subscribe({
    next: (data) => console.log("Got other", data),
    // Here it will return an
    error: (err) => console.log("Error other", err),
});
```

## Throw an error from the python server

You need to raise an error that is a child of `JsonRpcError` or `JsonRpcError` itself to get the best result.
Any other exception will act as a Server internal error and also get logged in the python

## Authenticate with the python

```ts
pythonService.callWithAuth("foo", [1, 2]).subscribe(...)
```

```py
@app.procedure("foo")
def foo(request, param1, param2):
    request.client #=> This is the NCJ client you can use. It automatically retrieved the AAD tokens
    return {"what": "it works!"}
```

## Stream data from the python

If you have some long running task to do in the python and would like to send status update to the user you can stream some data.

```py
# In the controller
@app.procedure("foo")
async def foo(request, param1, param2):
    for i in range(10):
        # Call the send_stream method on the request object with await(Also make this function async)
        await request.send_stream({'streamStatus': i})
        sleep(1)
    # Finally return when done
    return {"action": "completed"}
```

In the typescript

```ts
pythonService.call("foo", [1, 2]).subscribe({
    next: (data) => {
        console.log("Streamed data:", data);
    },
    completed: () => {
        console.log("done streaming");
    },
})
```
