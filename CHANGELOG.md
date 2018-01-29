# 0.12.3

### Hot fix:
* File-group/container issue with adding more files(Disabled for non file group for now) [\#1033](https://github.com/Azure/BatchLabs/issues/1033)
* Storage Container Search Broken  [\#1039](https://github.com/Azure/BatchLabs/issues/1039)

# 0.12.2

### Hot fix:
* Update Electron to fix vulnerability [\#1030](https://github.com/Azure/BatchLabs/issues/1030)

# 0.12.1

### Hot fix:
* Subscriptions not loading if not cached [\#1027](https://github.com/Azure/BatchLabs/issues/1027)

# 0.12.0
[All items](https://github.com/Azure/BatchLabs/milestone/14?closed=1)

### Feature:

* Data view should show all blob container not just file group [\#1006](https://github.com/Azure/BatchLabs/issues/1006)
* Rbac permission support. Disable action in batchlabs if user doesn't have write permission [\#1000](https://github.com/Azure/BatchLabs/issues/1000)
* Make app single instance [\#998](https://github.com/Azure/BatchLabs/issues/998)
* Stop prompting aad login window when refresh token are still valid [\#990](https://github.com/Azure/BatchLabs/issues/990)
* Enable AOT compilation to improve loading time [\#986](https://github.com/Azure/BatchLabs/issues/986)
* Cache batch accounts to improve initial loading time [\#982](https://github.com/Azure/BatchLabs/issues/982)
* Provide sample code to get started with shared key credentials entered [\#980](https://github.com/Azure/BatchLabs/issues/980)
* Account credentials access [\#970](https://github.com/Azure/BatchLabs/issues/970)
* Support for inbound endpoints [\#965](https://github.com/Azure/BatchLabs/issues/965)
* Make a open component in a new window  [\#74](https://github.com/Azure/BatchLabs/issues/74)
* Update the theming system to use json instead of scss [\#1012](https://github.com/Azure/BatchLabs/issues/1012)

### Other:

* Implement a new promise base communication from renderer to main process [\#1004](https://github.com/Azure/BatchLabs/issues/1004)
* Add code coverage [\#987](https://github.com/Azure/BatchLabs/issues/987)
* Extract AAD logic to be outside of the angular service into the node environment [\#963](https://github.com/Azure/BatchLabs/issues/963)

# 0.11.0
[All items](https://github.com/Azure/BatchLabs/milestone/12?closed=1)

### feature:

* Register batchlabs default protocol to open from the browser [\#934](https://github.com/Azure/BatchLabs/issues/934)
* Batch Labs should show a clear error when it cannot connect to its python web service [\#923](https://github.com/Azure/BatchLabs/issues/923)
* Implement a footer for the app and move some of the dropdown from the header [\#901](https://github.com/Azure/BatchLabs/issues/901)
* Show current quota usage on the account page [\#799](https://github.com/Azure/BatchLabs/issues/799)
* File explorer download a folder with right click [\#657](https://github.com/Azure/BatchLabs/issues/657)
* Goto directly to an entity doesn't show the entity in the quicklist [\#199](https://github.com/Azure/BatchLabs/issues/199)
* Export entities to template to allow cloning after deleted [\#19](https://github.com/Azure/BatchLabs/issues/19)
* NCJ advanced type for generating a container SAS [\#757](https://github.com/Azure/BatchLabs/issues/757)

### bug:

* Shortcut "cmd+H" is not supported on macOS [\#948](https://github.com/Azure/BatchLabs/issues/948)
* Pricing is broken [\#857](https://github.com/Azure/BatchLabs/issues/857)
* Pool estimated cost take rendering license into account [\#684](https://github.com/Azure/BatchLabs/issues/684)

### other:

* Application package icons need updating [\#939](https://github.com/Azure/BatchLabs/issues/939)
* Tweak quick search ui [\#924](https://github.com/Azure/BatchLabs/issues/924)
* List multi select should change color when losing focus [\#31](https://github.com/Azure/BatchLabs/issues/31)

# 0.10.2
### Bug:

* VM Size selector broken [\#940](https://github.com/Azure/BatchLabs/issues/940)

# 0.10.1
[All items](https://github.com/Azure/BatchLabs/milestone/13?closed=1)

### Bug:

* Nodes with start task failed state don't show the files [\#929](https://github.com/Azure/BatchLabs/issues/929)
* OS Family Not Reported on Pool Correctly [\#927](https://github.com/Azure/BatchLabs/issues/927)
* Error reading job prep-task [\#926](https://github.com/Azure/BatchLabs/issues/926)


# 0.10.0
[All items](https://github.com/Azure/BatchLabs/milestone/11?closed=1)

### Feature:

* Move breadcrumb in the header [\#906](https://github.com/Azure/BatchLabs/issues/906)
* Create Pool/Job/Task monaco json editor intellisense [\#888](https://github.com/Azure/BatchLabs/issues/888)
* Log viewer should switch to monaco editor [\#882](https://github.com/Azure/BatchLabs/issues/882)
* Pause notification dismiss timeout when hovering the notification [\#879](https://github.com/Azure/BatchLabs/issues/879)
* Allow to pick expiry time for user when connecting to a node [\#878](https://github.com/Azure/BatchLabs/issues/878)
* Node files display message when node is not available [\#876](https://github.com/Azure/BatchLabs/issues/876)
* Move from Codemirror to Monaco editor [\#870](https://github.com/Azure/BatchLabs/issues/870)
* Make notification stay longer on the screen [\#848](https://github.com/Azure/BatchLabs/issues/848)
* Ability to write json payload in the create forms and submit instead of UI [\#844](https://github.com/Azure/BatchLabs/issues/844)
* Allow users to create empty file groups [\#826](https://github.com/Azure/BatchLabs/issues/826)

### Bug:

* Data upload in file group is not working [\#912](https://github.com/Azure/BatchLabs/issues/912)
* Create empty file-group doesn't validate container name [\#905](https://github.com/Azure/BatchLabs/issues/905)
* CSS for "forms in progress" needs updating and fonts made readable and consistent [\#904](https://github.com/Azure/BatchLabs/issues/904)
* Switching fast between pools crash UI [\#898](https://github.com/Azure/BatchLabs/issues/898)
* CSS bug when too many files in task outputs file explorer [\#893](https://github.com/Azure/BatchLabs/issues/893)
* Account quota not updating when refreshing [\#885](https://github.com/Azure/BatchLabs/issues/885)
* Missing SKU details about Linux N series VM [\#872](https://github.com/Azure/BatchLabs/issues/872)

### Other:

* Prepare release 0.10.0 [\#915](https://github.com/Azure/BatchLabs/issues/915)
* Useragent should include OS [\#895](https://github.com/Azure/BatchLabs/issues/895)
* Should we integrate Application Insights into Batch Labs? [\#824](https://github.com/Azure/BatchLabs/issues/824)
* Refactor rx-list-proxy to a new system [\#814](https://github.com/Azure/BatchLabs/issues/814)
* Suggest using iconography instead of a label for the breadcrumb bar [\#696](https://github.com/Azure/BatchLabs/issues/696)
* Ability to pin Jobs, Tasks, or Pools. [\#456](https://github.com/Azure/BatchLabs/issues/456)
* Add typing to RxProxy options [\#204](https://github.com/Azure/BatchLabs/issues/204)
* Perf counter support [\#112](https://github.com/Azure/BatchLabs/issues/112)

# 0.9.0
[All items](https://github.com/Azure/BatchLabs/milestone/10?closed=1)

### Feature:

* Make start task command line textbox wrap [\#847](https://github.com/Azure/BatchLabs/issues/847)
* Command line properties is often too long to be displayed in properties. [\#837](https://github.com/Azure/BatchLabs/issues/837)
* Show a link to the logs folder to help debug [\#836](https://github.com/Azure/BatchLabs/issues/836)
* Auto delete package versions when deleting an application package [\#831](https://github.com/Azure/BatchLabs/issues/831)
* Display the application version [\#820](https://github.com/Azure/BatchLabs/issues/820)
* Add evaluate autoscale formula  [\#817](https://github.com/Azure/BatchLabs/issues/817)
* Add compute node errors banner [\#816](https://github.com/Azure/BatchLabs/issues/816)
* Job create experience more details [\#794](https://github.com/Azure/BatchLabs/issues/794)
* Upgrade to the new azure-batch sdk that work in the browser env [\#792](https://github.com/Azure/BatchLabs/issues/792)
* Add context menu to app packages quick-list [\#776](https://github.com/Azure/BatchLabs/issues/776)
* Allow file group creation from NCJ job submission page [\#761](https://github.com/Azure/BatchLabs/issues/761)

### Bug:

* Can't add a task when job is disabled [\#864](https://github.com/Azure/BatchLabs/issues/864)
* Can't preview image on Windows or Linux nodes [\#853](https://github.com/Azure/BatchLabs/issues/853)
* Disable "reimage node" option for nodes in IaaS pool [\#852](https://github.com/Azure/BatchLabs/issues/852)
* User Identity not showing up in start task [\#849](https://github.com/Azure/BatchLabs/issues/849)
* Adding a new task seems to produce blank list in the table [\#841](https://github.com/Azure/BatchLabs/issues/841)
* When deleting job from the details card the css overlay is not removed. [\#828](https://github.com/Azure/BatchLabs/issues/828)
* Failed to upload file groups for classic storage accounts [\#819](https://github.com/Azure/BatchLabs/issues/819)

### Other:

* Getting ready for version 0.9.0 [\#866](https://github.com/Azure/BatchLabs/issues/866)
* Set user agent to BatchLabs for all request [\#861](https://github.com/Azure/BatchLabs/issues/861)
* Add suport for maxWallClockTime in the create job experience [\#839](https://github.com/Azure/BatchLabs/issues/839)
* Refactor rx-entity-proxy to a new system [\#795](https://github.com/Azure/BatchLabs/issues/795)
* Make an about page [\#279](https://github.com/Azure/BatchLabs/issues/279)

# 0.8.0
[All items](https://github.com/Azure/BatchLabs/milestone/9?closed=1)

### Feature:

* Ncj app gallery [\#786](https://github.com/Azure/BatchLabs/issues/786)
* Task output messages confusing for customers [\#769](https://github.com/Azure/BatchLabs/issues/769)
* Allow specifying resize timeout on pool create [\#764](https://github.com/Azure/BatchLabs/issues/764)
* Notification actions [\#750](https://github.com/Azure/BatchLabs/issues/750)
* Enable edit start task from the node and reboot [\#749](https://github.com/Azure/BatchLabs/issues/749)
* Allow delete folder/file from the file group context menu. [\#733](https://github.com/Azure/BatchLabs/issues/733)
* Ability to resize the tree view in the file explorer(Movable splitter) [\#724](https://github.com/Azure/BatchLabs/issues/724)
* Find a way to surface prep and release task failures [\#708](https://github.com/Azure/BatchLabs/issues/708)

### Bug:

* Form picker(Start task) reset to empty from when clicking cancel [\#801](https://github.com/Azure/BatchLabs/issues/801)
* Typo in pool configuration [\#798](https://github.com/Azure/BatchLabs/issues/798)
* Creating a pool without changing the resizeTimeout gives an error [\#796](https://github.com/Azure/BatchLabs/issues/796)
* Pool start task failed quickfix not doing anything [\#788](https://github.com/Azure/BatchLabs/issues/788)
* AAD refresh token expired/revoke doesn't refresh the app. [\#783](https://github.com/Azure/BatchLabs/issues/783)
* File group download only downloading files at the root [\#780](https://github.com/Azure/BatchLabs/issues/780)
* After deleting application, overlay is not removed [\#777](https://github.com/Azure/BatchLabs/issues/777)
* File groups not listing all the files [\#751](https://github.com/Azure/BatchLabs/issues/751)
* Memory leak in app [\#745](https://github.com/Azure/BatchLabs/issues/745)
* Fix spelling of completition [\#742](https://github.com/Azure/BatchLabs/issues/742)
* Copy and paste doesn't work on osx prod build [\#727](https://github.com/Azure/BatchLabs/issues/727)
* Misleading message "The files for the specified task have been cleaned from the node." [\#689](https://github.com/Azure/BatchLabs/issues/689)

### Other:
* Organize summary card for all entities [\#754](https://github.com/Azure/BatchLabs/issues/754)
* Disable tab animations [\#747](https://github.com/Azure/BatchLabs/issues/747)
* show subscription name in the account details subtitle [\#740](https://github.com/Azure/BatchLabs/issues/740)
* Make quick list more compact [\#735](https://github.com/Azure/BatchLabs/issues/735)
* Make the details take the full height and scrolling happens in tabs content [\#730](https://github.com/Azure/BatchLabs/issues/730)
* Refactor server error to work better with all different inputs [\#694](https://github.com/Azure/BatchLabs/issues/694)
* Remove storage node proxy [\#685](https://github.com/Azure/BatchLabs/issues/685)

# 0.7.0
[All items](https://github.com/Azure/BatchLabs/milestone/8?closed=1)

### Features:
* Ability to view third party notice from UI [\#690](https://github.com/Azure/BatchLabs/issues/690)
* Command line input for task improvement [\#670](https://github.com/Azure/BatchLabs/issues/670)
* Add files to a file group with drag and drop [\#651](https://github.com/Azure/BatchLabs/issues/651)
* Add refresh shortcut to work in prod build [\#647](https://github.com/Azure/BatchLabs/issues/647)
* User identity for task  [\#639](https://github.com/Azure/BatchLabs/issues/639)
* Clean up excessive console errors when task logs are not available on node [\#631](https://github.com/Azure/BatchLabs/issues/631)
* Add 3ds max to the application license picker [\#627](https://github.com/Azure/BatchLabs/issues/627)
* Job tasks running time graph sorting/grouping of x axis [\#624](https://github.com/Azure/BatchLabs/issues/624)
* Add charts on the job home page(when no jobs selected) [\#621](https://github.com/Azure/BatchLabs/issues/621)
* Feature: File explorer [\#614](https://github.com/Azure/BatchLabs/issues/614)
* Make an install command to help people getting started(windows) [\#610](https://github.com/Azure/BatchLabs/issues/610)
* Add more charts for a job [\#473](https://github.com/Azure/BatchLabs/issues/473)
* Settings page [\#472](https://github.com/Azure/BatchLabs/issues/472)
* Tree view for files [\#466](https://github.com/Azure/BatchLabs/issues/466)
* Provide built app for download [\#405](https://github.com/Azure/BatchLabs/issues/405)
* Smart card support for windows  [\#271](https://github.com/Azure/BatchLabs/issues/271)

### Bugs:
* Heatmap display bug when resizing window or pool resize [\#715](https://github.com/Azure/BatchLabs/issues/715)
* Exit code is not showing in the task table list [\#712](https://github.com/Azure/BatchLabs/issues/712)
* Job preparation and release task having styling issues [\#709](https://github.com/Azure/BatchLabs/issues/709)
* Progress getting lost if file group name is too large [\#704](https://github.com/Azure/BatchLabs/issues/704)
* File explorer not reading files from storage account. [\#702](https://github.com/Azure/BatchLabs/issues/702)
* Job graph is overflowing vertically when in running prod [\#697](https://github.com/Azure/BatchLabs/issues/697)
* File explorer long file/folder name wrapping bug [\#668](https://github.com/Azure/BatchLabs/issues/668)
* Autoscale formula not updating [\#665](https://github.com/Azure/BatchLabs/issues/665)
* Profile settings throws an error for user settings [\#661](https://github.com/Azure/BatchLabs/issues/661)
* Profile menu item forces navigation to dashboard and reload when closed. [\#660](https://github.com/Azure/BatchLabs/issues/660)
* File explorer improve errors on task outputs [\#654](https://github.com/Azure/BatchLabs/issues/654)
* UI gets into a bad state if you navigate to a start task which has an environment variable with no value [\#646](https://github.com/Azure/BatchLabs/issues/646)
* Task id needs to be truncated in the table [\#645](https://github.com/Azure/BatchLabs/issues/645)
* run elevated not set when running tasks with autoUser in admin mode [\#638](https://github.com/Azure/BatchLabs/issues/638)
* Batchlabs ghost process after closing prod app [\#633](https://github.com/Azure/BatchLabs/issues/633)
* Detailed information should be shown if an error occurs during allocation [\#618](https://github.com/Azure/BatchLabs/issues/618)
* Splash screen not showing in packaged distributable [\#616](https://github.com/Azure/BatchLabs/issues/616)
* Graph hover text [\#608](https://github.com/Azure/BatchLabs/issues/608)
* Grammar in task running time graph [\#607](https://github.com/Azure/BatchLabs/issues/607)
* Handle forbidden 403 errors [\#577](https://github.com/Azure/BatchLabs/issues/577)
* Cannot read a blob from a file group with a full path. [\#561](https://github.com/Azure/BatchLabs/issues/561)

### Other:
* Update readme to prepare for the release [\#692](https://github.com/Azure/BatchLabs/issues/692)
* ThirdPartyNotice generator [\#682](https://github.com/Azure/BatchLabs/issues/682)
* Log python stdout and stderr to file [\#678](https://github.com/Azure/BatchLabs/issues/678)
* Find an open port for the python server to connect to [\#676](https://github.com/Azure/BatchLabs/issues/676)
* Switch to es6 [\#641](https://github.com/Azure/BatchLabs/issues/641)
* Table selection/activation improvement [\#626](https://github.com/Azure/BatchLabs/issues/626)
* Upload file group as a background task [\#615](https://github.com/Azure/BatchLabs/issues/615)

# Version 0.6.0(Beta)
[All items](https://github.com/Azure/BatchLabs/milestone/6?closed=1)

### Features
* Show pool estimated pricing [\#595](https://github.com/Azure/BatchLabs/issues/595)
* Added graphs for the job [\#591](https://github.com/Azure/BatchLabs/issues/591)
* Download a file group(NCJ)  [\#589](https://github.com/Azure/BatchLabs/issues/589)
* File picker inside a file group(NCJ) [\#571](https://github.com/Azure/BatchLabs/issues/571)
* File group picker(NCJ)  [\#569](https://github.com/Azure/BatchLabs/issues/569)
* File group UI(NJC)  [\#530](https://github.com/Azure/BatchLabs/issues/530)
* Delete a node [\#554](https://github.com/Azure/BatchLabs/issues/554)
* Propose to delete the job with the same id as the pool you are trying to delete [\#543](https://github.com/Azure/BatchLabs/issues/543)
* Preview of files(node or storage uploaded) is more efficient with caching [\#519](https://github.com/Azure/BatchLabs/issues/519)
* Make metadata editable [\#513](https://github.com/Azure/BatchLabs/issues/513)
* Application license picker(Maya, 3ds Max) [\#498](https://github.com/Azure/BatchLabs/issues/498)
* Right click functionatlities on the heatmap [\#487](https://github.com/Azure/BatchLabs/issues/487)

[Many bug fixes](https://github.com/Azure/BatchLabs/issues?q=is%3Aissue+milestone%3A0.6.0+is%3Aclosed+label%3Abug)

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
