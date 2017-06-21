# Version 0.5.0(Beta)
[All items](https://github.com/Azure/BatchLabs/milestone/5?closed=1)

### Features
* Link Storage account in batch labs [\#385](https://github.com/Azure/BatchLabs/issues/385)
* New actions buttons [\#408](https://github.com/Azure/BatchLabs/issues/408)
* Low priority VMs [\#414](https://github.com/Azure/BatchLabs/issues/414)
* Details now refresh automatically every 10 seconds [\#428](https://github.com/Azure/BatchLabs/issues/428)
* Show batch account quotas [\#413](https://github.com/Azure/BatchLabs/issues/413)
* Job show manager task details [\#447](https://github.com/Azure/BatchLabs/issues/447)
* Preview images(and gif) and code files in labs  [\#417](https://github.com/Azure/BatchLabs/issues/417)
* Setup python support for ncj [\#439](https://github.com/Azure/BatchLabs/issues/439)
* Task output quick add otherfiles for debug [\#184](https://github.com/Azure/BatchLabs/issues/184)
* Job prep/release task status read experience [\#429](https://github.com/Azure/BatchLabs/issues/429)
* Start task failed show error banner on node details [\#476](https://github.com/Azure/BatchLabs/issues/476)

# Version 0.4.0(Beta)
[All items](https://github.com/Azure/BatchLabs/milestone/3?closed=1)

### Features
* Added a new multi picker control [\#358](https://github.com/Azure/BatchLabs/issues/358)
* Added user accounts support at pool creation using the multi picker [\#359](https://github.com/Azure/BatchLabs/issues/359)
* Update enabled/disabled properties icon to be less confusing [\#354](https://github.com/Azure/BatchLabs/issues/354)
* Pool start task can now use the useridentity selecition. [\#356](https://github.com/Azure/BatchLabs/issues/354)
* Move tasks tab to be first in the tab list [\#375](https://github.com/Azure/BatchLabs/issues/375)
* Made a new editable table control and update resource files to use it [\#376](https://github.com/Azure/BatchLabs/issues/376)
* New environment settings picker for tasks and start task [\#355](https://github.com/Azure/BatchLabs/issues/355)
* Improve account home page with a quick access to pools, jobs and applications  [\#310](https://github.com/Azure/BatchLabs/issues/310)
* Account list now allow to filter by multiple subscription(Last selection is saved) [\#352](https://github.com/Azure/BatchLabs/issues/352)
* Use chached value to display entity(Job, Pool, etc.) immediately when selected in the list  [\#382](https://github.com/Azure/BatchLabs/issues/382)
* Added a few more missing fields to the pool creation  [\#357](https://github.com/Azure/BatchLabs/issues/357)
* Added loading icon for account list on first load  [\#340](https://github.com/Azure/BatchLabs/issues/340)
* Added a packaging flow to be able to make an exe  [\#364](https://github.com/Azure/BatchLabs/issues/364)
* Improve dates and timespan field in configuration [\#396](https://github.com/Azure/BatchLabs/issues/396)
* Listen to electron error events to show a recovery window [\#337](https://github.com/Azure/BatchLabs/issues/337)

### Fixes
* Edit start task cannot cancel [\#367](https://github.com/Azure/BatchLabs/issues/367)
* Fix bug where graphs keeps history when switching between pools [\#353](https://github.com/Azure/BatchLabs/issues/353)
* Fix unwanted form submit when pressing enter [\#393](https://github.com/Azure/BatchLabs/issues/393)
* Fix configuration tabs having a nested scrollbar [\#397](https://github.com/Azure/BatchLabs/issues/397)
* Fix list not having focus after click [\#400](https://github.com/Azure/BatchLabs/issues/400)


# Version 0.3.1(Beta)
[All items](https://github.com/Azure/BatchLabs/milestone/4?closed=1)

### Fixes
* Fix error when cloning a pool not using autoscale forumla [\#342](https://github.com/Azure/BatchLabs/issues/342)
* UI bug in the pool nodes preview(Font size is off) [\#332](https://github.com/Azure/BatchLabs/issues/332)
* Application edit form missed in the new form refactor [\#334](https://github.com/Azure/BatchLabs/issues/334)

# Version 0.3.0(Beta)
[All items](https://github.com/Azure/BatchLabs/milestone/2?closed=1)

### Features
* Autoscale forumla support with option to save forumla [\#321](https://github.com/Azure/BatchLabs/issues/321)
* Big work on the form UI(Also added pool start task picker)
  - Section and picker [\#321](https://github.com/Azure/BatchLabs/issues/4)
  - Form error sticky at the bottom not to miss it [\#317](https://github.com/Azure/BatchLabs/issues/317)
* Read/Save files to azure storage UX  [\#110](https://github.com/Azure/BatchLabs/issues/110)
* New VM size picker as a sortable table [\#292](https://github.com/Azure/BatchLabs/issues/292)
* New pool picker for the job create experience [\#284](https://github.com/Azure/BatchLabs/issues/284)
* New OS picker for the pool create experience [\#278](https://github.com/Azure/BatchLabs/issues/278)
* Added refresh account button [\#289](https://github.com/Azure/BatchLabs/issues/289)
### Fixes
* Bug with max results [\#295](https://github.com/Azure/BatchLabs/issues/295) [\#297](https://github.com/Azure/BatchLabs/issues/297) [\#299](https://github.com/Azure/BatchLabs/issues/299)


# Version 0.2.0(Beta)
[All items](https://github.com/Azure/BatchLabs/milestone/1?closed=1)

### Features
* Production build [PR 173](https://github.com/Azure/BatchLabs/pull/173)
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
