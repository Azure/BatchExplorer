# Storing user data / Cache data

There is a few options to save user data depending on the use case

|                   | User independant | User specific         |
|-------------------|------------------|-----------------------|
| Global            | GlobalStorage    | UserSpecificDataStore |
| Local(Per window) | localStorage     | localStorage          |

## Global storage

**For saving large set of data. Prefer one of the DataStore for smaller ones**

This this the lowsest level data storage. It will support synchronzing the content of a key across the app.
It is implemented differently depending on the environment:

* Electron main: Save to `$(userdata)/data/` folder
* Electron renderer: Calls to the Electron main service
* Browser only: User `localStorage`

Use when:

* To implement a higher level store
* Having to save large set of data

Do not use for:

* Caching data
* If the data should not be shared between windows(Each process should have its local version)
* Small values

## UserSpecificDataStore

**When having to save user specific data/state(No for caching)**

Use when:

* The data saved should not be shared between users

Do not sure for:

* If the data is not user specific
* If the data should not be shared between windows(Each process should have its local version)
