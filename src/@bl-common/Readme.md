# BatchLabs Common

This is supposed to act like an independent package.

**Any code in this folder cannot import any other files outside of this folder that is not an external dependencies**

This is to prevent cirular dependencies as elements of this module are being used all over the place.



## Structure

* `core`:
* `ui`:
* `utils`: Utils


## Import graph

Make sure import follow this graph(Arrow represent who can import who)
```
----------------------------------|
|          @bl-common             |
|---------------------------------|
|          ui 🡒 utils            |
|            🡖   🡕               |
|             core                |
|                                 |
----------------------------------|
```
