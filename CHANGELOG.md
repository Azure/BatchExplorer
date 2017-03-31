# Version 0.2.0(Beta)

### Features
* Improve the VM size experience to show info about each vm size [PR 277](https://github.com/Azure/BatchLabs/pull/277)
* Load all the VM sizes [PR 275](https://github.com/Azure/BatchLabs/pull/275)
* Load all account on start: improve account selection experience by removing the need to click on the subscription first [PR 273](https://github.com/Azure/BatchLabs/pull/273)
* Creating a new entity will add it to the query cache(i.e. Adding a pool then switching to jobs list then back to pool should still show the added pool in the list) [PR 272](https://github.com/Azure/BatchLabs/pull/272)
* Splash screen show progress [PR 270](https://github.com/Azure/BatchLabs/pull/270)
* Updated application icon [PR 266](https://github.com/Azure/BatchLabs/pull/266)
* Clone entities should keep attributes not in form[PR 262](https://github.com/Azure/BatchLabs/pull/262)
* Added yarn [PR 260](https://github.com/Azure/BatchLabs/pull/260)

### Fixes
* Fix node files `Load more` always showing [PR 268](https://github.com/Azure/BatchLabs/pull/268)

# Version 0.1.0(Beta)

Initial version

### Features
* Login with azure active directory(Giving access to user subscriptions and applications)
* Browse pools, node, jobs, tasks, applications
* Basic creationg of pools, jobs and tasks
* Upload new applications and packages
* Graphs for status of pools(heatmap, nodes availables, running tasks)
* Many error banner helper with quick fixes options(e.g. Task timeout)
* Much more [All closed issues](https://github.com/Azure/BatchLabs/issues?q=is%3Aissue+is%3Aclosed)
