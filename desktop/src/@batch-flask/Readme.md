# BatchExplorer Common

This is supposed to act like an independent package.

**Any code in this folder cannot import any other files outside of this folder that is not an external dependencies**

This is to prevent cirular dependencies as elements of this module are being used all over the place.

## Structure

* `utils`: All core utilities function you would use as functions `DateUtils.prettyDate()`
* `core`:  All classes, object that are needed to be reusued across the app `Record,Dto`
* `ui`:    All the angular/ui specific elements(components, services, modules, etc.)

## Import graph

Make sure import follow this graph (Arrows represent who can import who)

```text
----------------------------------|
|          @batch-flask           |
|---------------------------------|
|         ui   ←   utils          |
|           ⬉      ⬋              |
|             core                |
|                                 |
----------------------------------|
```
