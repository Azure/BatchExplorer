# Release History

## 2.9.0

[All items](https://github.com/Azure/BatchExplorer/milestone/43?closed=1)

### bug

* Image preview in Task Output was broken [\#2274](https://github.com/Azure/BatchExplorer/issues/2274)
* Cannot download task output files [\#2272](https://github.com/Azure/BatchExplorer/issues/2272)
* Addresses high-severity accessibility issues [\#2287](https://github.com/Azure/BatchExplorer/pull/2287)

### other

* Virtual Machine Sizes A8-A11 will be retired [\#2278](https://github.com/Azure/BatchExplorer/issues/2278)

## 2.8.0

[All items](https://github.com/Azure/BatchExplorer/milestone/42?closed=1)

### feature

* Variable Slot Pricing [\#2251](https://github.com/Azure/BatchExplorer/issues/2251)
* Update build pipeline [\#2245](https://github.com/Azure/BatchExplorer/issues/2245)
* Add Chaos Group V-Ray RT to Software License [\#2242](https://github.com/Azure/BatchExplorer/issues/2242)

### bug

* Occasional MacOS freezing issue on application startup [\#2254](https://github.com/Azure/BatchExplorer/issues/2254)
* Accessibility Luminosity Contrast Issues [\#2253](https://github.com/Azure/BatchExplorer/issues/2253)
* Multi-select Deletion for Node list [\#2250](https://github.com/Azure/BatchExplorer/issues/2250)
* Windows install scripts to support paths with spaces [\#2248](https://github.com/Azure/BatchExplorer/issues/2248)
* Subtask Blade Detail Display Issue [\#2247](https://github.com/Azure/BatchExplorer/issues/2247)
* Stuck on Splash Screen - Mac [\#2246](https://github.com/Azure/BatchExplorer/issues/2246)
* Fix Windows/Linux packaging issues [\#2244](https://github.com/Azure/BatchExplorer/issues/2244)
* Fix Signing [\#2241](https://github.com/Azure/BatchExplorer/issues/2241)
* Impossible to verify account and complete login [\#2212](https://github.com/Azure/BatchExplorer/issues/2212)
* BatchExplorer does not work with Okta [\#2165](https://github.com/Azure/BatchExplorer/issues/2165)

## 2.7.0

[All items](https://github.com/Azure/BatchExplorer/milestone/41?closed=1)

### bug

* Fix issue where the image selector when creating pools only showed verified images [\#2169](https://github.com/Azure/BatchExplorer/pull/2169)

### other

* Remove support for managed images kind of custom images as this will no longer be supported by latest API's. Customers should switch to using Shared Image Galleries, which are the latest form of custom image support (<https://docs.microsoft.com/en-us/azure/batch/batch-sig-images>) or can disable updates (introduced in version 2.6.0) for the short term. [\#2153](https://github.com/Azure/BatchExplorer/issues/2153)

## 2.6.0

[All items](https://github.com/Azure/BatchExplorer/milestone/40?closed=1)

### feature

* Display Unusable Node Banner on Pools Page [\#2153](https://github.com/Azure/BatchExplorer/issues/2153)
* Disable Auto-update with Command Line [\#2152](https://github.com/Azure/BatchExplorer/issues/2152)

### bug

* PyInstaller Vulnerability [\#2155](https://github.com/Azure/BatchExplorer/issues/2155)
* Governance Updates [\#2154](https://github.com/Azure/BatchExplorer/issues/2154)

### other

## 2.5.0

[All items](https://github.com/Azure/BatchExplorer/milestone/39?closed=1)

### feature

* Change Error Messages Inner Details to be shown by default [\#2140](https://github.com/Azure/BatchExplorer/issues/2140)

### bug

* Account create fails with 'Must specify a location' [\#2135](https://github.com/Azure/BatchExplorer/issues/2135)
* When listing tasks with OData, pagination may not be followed to termination [\#2127](https://github.com/Azure/BatchExplorer/issues/2127)
* When attempting to RDP/SSH to a node you must update expiresOn property otherwise you get a spinning wheel [\#2119](https://github.com/Azure/BatchExplorer/issues/2119)
* When Creating a JobPrep or JobRelease task you must update retentionTime to pass validation [\#2118](https://github.com/Azure/BatchExplorer/issues/2118)

### other

* EULA text still displays BatchLabs text [\#2141](https://github.com/Azure/BatchExplorer/issues/2141)

### Fixes

* Vulnerabilities with dependencies
* Fix issue where the Python server would not start due to dependency collisions.

## 2.4.0

[All items](https://github.com/Azure/BatchExplorer/milestone/38?closed=1)

### feature

* StartTask WaitForSuccess should be defaulted to true [\#2105](https://github.com/Azure/BatchExplorer/issues/2105)
* Unable to filter for failed tasks [\#2084](https://github.com/Azure/BatchExplorer/issues/2084)

### bug

* Required caused save to be disabled even though populated [\#2103](https://github.com/Azure/BatchExplorer/issues/2103)
* No Results Displayed if User Did Not Have a SIG Image. [\#2102](https://github.com/Azure/BatchExplorer/issues/2102)
* Start time and End time in Job execution information are empty [\#2088](https://github.com/Azure/BatchExplorer/issues/2088)
* Batch Explorers Unlimited retention time actually sets value to 7d  [\#2083](https://github.com/Azure/BatchExplorer/issues/2083)

### other

* Release/prepare 2.4.0 [\#2108](https://github.com/Azure/BatchExplorer/issues/2108)
* Update @angular dependencies [\#2107](https://github.com/Azure/BatchExplorer/issues/2107)
* Update Batch API [\#2106](https://github.com/Azure/BatchExplorer/issues/2106)
* Update python dependency [\#2104](https://github.com/Azure/BatchExplorer/issues/2104)

## 2.3.0

[All items](https://github.com/Azure/BatchExplorer/milestone/37?closed=1)

### feature

### bug

* Task filter not applied when refresh clicked
* Unable to filter for "offline" nodes

### other

## 2.2.0

[All items](https://github.com/Azure/BatchExplorer/milestone/36?closed=1)

### feature

* Add SharedImageGallery support to the custom images blade of pool create.
* Users can now specify custom Azure environments

### bug

* Promo VMSize's now display projected pricing correctly.

### other

## 2.1.2

### Bug fixes

* Cannot connect to a node as an Admin [\#2033](https://github.com/Azure/BatchExplorer/issues/2033)
* Sort task by runtime fix for running tasks [\#2034](https://github.com/Azure/BatchExplorer/issues/2034)

## 2.1.1

### Bug fixes

* Cannot view any pool when creating a job [\#2029](https://github.com/Azure/BatchExplorer/issues/2029)

## 2.1.0

[All items](https://github.com/Azure/BatchExplorer/milestone/35?closed=1)

### Features

* Allow key bindings to be edited by the user [\#2009](https://github.com/Azure/BatchExplorer/issues/2009)
* Enable Keyboard shortcuts for pool/job operations [\#1997](https://github.com/Azure/BatchExplorer/issues/1997)
* Show cost per pool  [\#1993](https://github.com/Azure/BatchExplorer/issues/1993)
* Node connect experience merge configure page [\#1991](https://github.com/Azure/BatchExplorer/issues/1991)
* Allow updating local batch account properties [\#1951](https://github.com/Azure/BatchExplorer/issues/1951)
* New job created in NCJ adds to the bottom of the quick-list [\#1277](https://github.com/Azure/BatchExplorer/issues/1277)

### Bug fixes

* OS Family 6 (Windows Serer 2019) is not displayed correctly [\#2027](https://github.com/Azure/BatchExplorer/issues/2027)
* Clone pool not setting app package name [\#2019](https://github.com/Azure/BatchExplorer/issues/2019)
* Pressing keys while leaving the window break keyboard shortcuts [\#2014](https://github.com/Azure/BatchExplorer/issues/2014)

### Others

* Page to see key bindings [\#2006](https://github.com/Azure/BatchExplorer/issues/2006)

## 2.0.4

### Fixes

* Vulnerabilities with dependencies

## 2.0.3

### Bug fixes

* Recent templates from "my library" are a bit too long  [\#1969](https://github.com/Azure/BatchExplorer/issues/1969)
* Job schedule with autopool fail to display [\#1995](https://github.com/Azure/BatchExplorer/issues/1995)
* Pool graphs One Day and One Week option both have value of 1 day [\#1999](https://github.com/Azure/BatchExplorer/issues/1999)
* Microsoft portfolio settings not persisted  [\#2004](https://github.com/Azure/BatchExplorer/issues/2004)

## 2.0.2

### Bug fixes

* **Vulnerabilities** with js-yaml. [\#1990](https://github.com/Azure/BatchExplorer/issues/1990)
* Node counts graphs don't recover from errors(e.g. Connection died). [\#1989](https://github.com/Azure/BatchExplorer/issues/1989)
* Null exception in resource files properties [\#1984](https://github.com/Azure/BatchExplorer/issues/1984)
* Only loads permissions for first selected batch account [\#1987](https://github.com/Azure/BatchExplorer/issues/1987)

## 2.0.1

### Bug fixes

* Null route when clicking on node or task that isn't loaded yet [\#1983](https://github.com/Azure/BatchExplorer/issues/1983)
* Open a local template file null expection [\#1980](https://github.com/Azure/BatchExplorer/issues/1980)
* Null pointer exception in job schedule details [\#1978](https://github.com/Azure/BatchExplorer/issues/1978)
* Null currentTab in VTab Component  [\#1976](https://github.com/Azure/BatchExplorer/issues/1976)

## 2.0.0

[All items](https://github.com/Azure/BatchExplorer/milestone/32?closed=1)

### Features

* Sort jobs by end time and keep last sort order [\#1966](https://github.com/Azure/BatchExplorer/issues/1966)
* Subscription list sorted alphabetically [\#1963](https://github.com/Azure/BatchExplorer/issues/1963)
* Local Template library show full path to file [\#1943](https://github.com/Azure/BatchExplorer/issues/1943)
* Create batch account location picker use provider specific locations [\#1902](https://github.com/Azure/BatchExplorer/issues/1902)
* Add common environment settings support for job [\#1896](https://github.com/Azure/BatchExplorer/issues/1896)
* Local template library only shows .template.json files [\#1894](https://github.com/Azure/BatchExplorer/issues/1894)
* Update to new management api version  [\#1892](https://github.com/Azure/BatchExplorer/issues/1892)
* Support setting data disk for batch pools [\#1887](https://github.com/Azure/BatchExplorer/issues/1887)
* Ability to abort the resize of a pool [\#1884](https://github.com/Azure/BatchExplorer/issues/1884)
* Add back option to run a single template without adding a local library folder [\#1883](https://github.com/Azure/BatchExplorer/issues/1883)
* New settings UI [\#1881](https://github.com/Azure/BatchExplorer/issues/1881)
* Add column keyboard navigation for tables for accessibility [\#1878](https://github.com/Azure/BatchExplorer/issues/1878)
* Windows user account interactive mode [\#1868](https://github.com/Azure/BatchExplorer/issues/1868)
* Unify filesystem interfaces [\#1866](https://github.com/Azure/BatchExplorer/issues/1866)
* Support the new type of resource files(Storage container) [\#1839](https://github.com/Azure/BatchExplorer/issues/1839)
* Update Batch api to latest version 2018-12-01.8.0 [\#1838](https://github.com/Azure/BatchExplorer/issues/1838)
* Global app utc vs local time selector [\#1837](https://github.com/Azure/BatchExplorer/issues/1837)
* Switch account monitoring to average now that value are correct [\#1835](https://github.com/Azure/BatchExplorer/issues/1835)
* Migrate from momentjs to luxon [\#1833](https://github.com/Azure/BatchExplorer/issues/1833)
* File group creation disabled if no batch account selected [\#1750](https://github.com/Azure/BatchExplorer/issues/1750)
* Display multi instance settings on the sub task [\#1554](https://github.com/Azure/BatchExplorer/issues/1554)
* Batch account favourites should be user specific. [\#250](https://github.com/Azure/BatchExplorer/issues/250)

### Bug fixes

* CTRL+Click not selecting quick-list items [\#1970](https://github.com/Azure/BatchExplorer/issues/1970)
* Dashboard app package table has URL not name [\#1957](https://github.com/Azure/BatchExplorer/issues/1957)
* Local template open in default editor should not open a copy [\#1944](https://github.com/Azure/BatchExplorer/issues/1944)
* Daily cost graph showing corrupt data [\#1933](https://github.com/Azure/BatchExplorer/issues/1933)
* Cant view images from task outputs [\#1928](https://github.com/Azure/BatchExplorer/issues/1928)
* Bugs in Application Packages [\#1926](https://github.com/Azure/BatchExplorer/issues/1926)
* Insider build unable to download (stable) update [\#1919](https://github.com/Azure/BatchExplorer/issues/1919)
* CSS for favorite picker is broken [\#1914](https://github.com/Azure/BatchExplorer/issues/1914)
* Issue with switching azure environment(National cloud) [\#1909](https://github.com/Azure/BatchExplorer/issues/1909)
* Pool quota out of sync with pool list [\#1906](https://github.com/Azure/BatchExplorer/issues/1906)
* Stale pool statistics / graphs [\#1505](https://github.com/Azure/BatchExplorer/issues/1505)

### Others

* Switch from bunyan to winston for logging [\#1865](https://github.com/Azure/BatchExplorer/issues/1865)
* New user configuration/settings system [\#1841](https://github.com/Azure/BatchExplorer/issues/1841)

## 0.19.2

### Bug fixes

* Issue when using branch with / in github-data.source.branch setting [\#1870](https://github.com/Azure/BatchExplorer/issues/1870)
* Issue with listing subscriptions when having more than 50 [\#1872](https://github.com/Azure/BatchExplorer/issues/1872)
* Observable from main process are not being cleanup when windows refresh or close [\#1874](https://github.com/Azure/BatchExplorer/issues/1874)
* Issues with job statistics when switching sorting [\#1859](https://github.com/Azure/BatchExplorer/issues/1859)
* Authentication window should handle load errors [\#1862](https://github.com/Azure/BatchExplorer/issues/1862)
* Fix issues with Job statistics page [\#1843](https://github.com/Azure/BatchExplorer/issues/1843)
* Download button has disappeared for files [\#1861](https://github.com/Azure/BatchExplorer/issues/1861)
* Null not handled in file loader properties [\#1857](https://github.com/Azure/BatchExplorer/issues/1857)
* Add / edit start task won't load when user account present on pool create [\#1855](https://github.com/Azure/BatchExplorer/issues/1855)
* Linux deb package not installable [\#1852](https://github.com/Azure/BatchExplorer/issues/1852)

## 0.19.1

### Bug fixes

* Drilldown into tasks no longer works when filtered [\#1843](https://github.com/Azure/BatchExplorer/issues/1843)
* Create job schedule from job is broken  [\#1844](https://github.com/Azure/BatchExplorer/issues/1844)
* Check for updates throws uncaught errors sometimes [\#1847](https://github.com/Azure/BatchExplorer/issues/1847)
* Null pointer exception in pool picker when using Local Batch account [\#1850](https://github.com/Azure/BatchExplorer/issues/1850)

## 0.19.0

[All items](https://github.com/Azure/BatchExplorer/milestone/27?closed=1)

### Feature

* VNet picker should alllow removing selection [\#1822](https://github.com/Azure/BatchExplorer/issues/1822)
* Show Resource Group of Batch Account [\#1818](https://github.com/Azure/BatchExplorer/issues/1818)
* Multi delete nodes support [\#1812](https://github.com/Azure/BatchExplorer/issues/1812)
* VM size picker alternative if can't load the vm sizes(Local account) [\#1810](https://github.com/Azure/BatchExplorer/issues/1810)
* Setup new secure storage [\#1808](https://github.com/Azure/BatchExplorer/issues/1808)
* Redesign of the gallery to simplify navigation [\#1791](https://github.com/Azure/BatchExplorer/issues/1791)
* Auto add file group output container [\#1790](https://github.com/Azure/BatchExplorer/issues/1790)
* Refactor VM size picker with filter [\#1783](https://github.com/Azure/BatchExplorer/issues/1783)
* Add a link to the pool/node in the task summary [\#1776](https://github.com/Azure/BatchExplorer/issues/1776)
* Rescale should wait for resize operation to be completed when disabling autoscale [\#1754](https://github.com/Azure/BatchExplorer/issues/1754)
* Provide actual cost of batch account [\#1748](https://github.com/Azure/BatchExplorer/issues/1748)
* New pool os picker design [\#1735](https://github.com/Azure/BatchExplorer/issues/1735)
* Ability to type the file path in the file explorer [\#1702](https://github.com/Azure/BatchExplorer/issues/1702)
* File viewer redesign to be more extensible [\#1700](https://github.com/Azure/BatchExplorer/issues/1700)
* File viewer syntax highlighting  [\#1699](https://github.com/Azure/BatchExplorer/issues/1699)
* Local template library [\#1696](https://github.com/Azure/BatchExplorer/issues/1696)
* Add a regular check for updates while the app is open [\#1656](https://github.com/Azure/BatchExplorer/issues/1656)
* Add validation on container length(Between 3 and 63 characters) [\#1641](https://github.com/Azure/BatchExplorer/issues/1641)
* Need to be able to resize quick-list panel [\#1544](https://github.com/Azure/BatchExplorer/issues/1544)
* Manage certificates and app packages for existing pools. [\#1334](https://github.com/Azure/BatchExplorer/issues/1334)

### Bug fixes

* Recent template not working [\#1813](https://github.com/Azure/BatchExplorer/issues/1813)
* Drag and drop upload is broken [\#1801](https://github.com/Azure/BatchExplorer/issues/1801)
* Insider build icon is showing electron icon [\#1793](https://github.com/Azure/BatchExplorer/issues/1793)
* Unable to report issue through program [\#1779](https://github.com/Azure/BatchExplorer/issues/1779)
* Leaving the node file explorer with the stdout.txt file open appends content over and over [\#1778](https://github.com/Azure/BatchExplorer/issues/1778)
* Green on light blue is very hard to read [\#1774](https://github.com/Azure/BatchExplorer/issues/1774)
* Favourites are not persisted any more [\#1771](https://github.com/Azure/BatchExplorer/issues/1771)
* Navigating to a job for the first time make an extra call with undefined jobId [\#1770](https://github.com/Azure/BatchExplorer/issues/1770)
* Viewing a folder with lots of files in it (>10k) errors [\#1766](https://github.com/Azure/BatchExplorer/issues/1766)
* Prep task status is always failure even when completed [\#1765](https://github.com/Azure/BatchExplorer/issues/1765)
* Allow for multiple failed tasks to be rescheduled [\#1763](https://github.com/Azure/BatchExplorer/issues/1763)
* High contrast theme [\#1762](https://github.com/Azure/BatchExplorer/issues/1762)
* Clicking item in quick-list doesn't work on the first click. [\#1757](https://github.com/Azure/BatchExplorer/issues/1757)
* Can't view images from task node file explorer [\#1756](https://github.com/Azure/BatchExplorer/issues/1756)
* Cannot view text/log files in file explorer [\#1741](https://github.com/Azure/BatchExplorer/issues/1741)
* 2 errors overlay when task node doesnt exist [\#1740](https://github.com/Azure/BatchExplorer/issues/1740)
* Add local batch account with IP [\#1685](https://github.com/Azure/BatchExplorer/issues/1685)

### Other

* Remove flags as this is not compliant with Microsoft policy [\#1806](https://github.com/Azure/BatchExplorer/issues/1806)
* Migrate out of @angular/http [\#1745](https://github.com/Azure/BatchExplorer/issues/1745)
* Sort xliffs translations alphabetically [\#1731](https://github.com/Azure/BatchExplorer/issues/1731)
* Virtual scroll switch to custom ngFor directive [\#1710](https://github.com/Azure/BatchExplorer/issues/1710)
* Azure DevOps switch to ubuntu pool(Linux preview deprecated) [\#1695](https://github.com/Azure/BatchExplorer/issues/1695)
* Release step make resilient to storage error [\#1689](https://github.com/Azure/BatchExplorer/issues/1689)
* Setup tree shaking [\#1670](https://github.com/Azure/BatchExplorer/issues/1670)
* Replace all new Error to be typed [\#1661](https://github.com/Azure/BatchExplorer/issues/1661)
* Redesign how the upload works by having a addFile property on file navigator [\#1292](https://github.com/Azure/BatchExplorer/issues/1292)
* Add CI to check the bundled app(.exe, .app) is working [\#580](https://github.com/Azure/BatchExplorer/issues/580)

## 0.18.4

### Bug fixes

* Task exit code filter switch between include and exclude error [\#1687](https://github.com/Azure/BatchExplorer/issues/1687)
* Error in pool container picker with null registries [\#1690](https://github.com/Azure/BatchExplorer/issues/1690)
* Can't view content of prep/release task files [\#1692](https://github.com/Azure/BatchExplorer/issues/1692)
* Issue when rescaling a pool and toggling autoscale [\#1751](https://github.com/Azure/BatchExplorer/issues/1751)

## 0.18.3

### Bug fixes

* Increase pool quota quick fix not working [\#1667](https://github.com/Azure/BatchExplorer/issues/1667)
* Can't export task to csv first time opening the statistics blade [\#1673](https://github.com/Azure/BatchExplorer/issues/1673)
* Error on toggle filter button [\#1671](https://github.com/Azure/BatchExplorer/issues/1671)
* Error when copying property which value is not a string(int) [\#1675](https://github.com/Azure/BatchExplorer/issues/1675)
* Can't create a pool with custom images [\#1677](https://github.com/Azure/BatchExplorer/issues/1677)
* Upload node logs not tracking upload on national clouds [\#1680](https://github.com/Azure/BatchExplorer/issues/1680)
* Quota usages not showing up [\#1683](https://github.com/Azure/BatchExplorer/issues/v)

## 0.18.2

### Bug fixes

* Unique windows show() nul pointer exception [\#1644](https://github.com/Azure/BatchExplorer/issues/1644)
* Reimage node is calling reboot [\#1646](https://github.com/Azure/BatchExplorer/issues/1646)
* Error loading metrics create null pointer exception [\#1648](https://github.com/Azure/BatchExplorer/issues/1648)
* View readme of NCJ application not working [\#1652](https://github.com/Azure/BatchExplorer/issues/1652)
* Cloning of Batch Pools does not work [\#1650](https://github.com/Azure/BatchExplorer/issues/1650)
* Error when button component doesn't return an observable [\#1654](https://github.com/Azure/BatchExplorer/issues/1654)
* Selecting checkbox doesn't add a tick to the checkbox [\#1658](https://github.com/Azure/BatchExplorer/issues/1658)

## 0.18.1

### Bug fixes

* Crash on pool configuration [\#1638](https://github.com/Azure/BatchExplorer/issues/1638)

## 0.18.0

[All items](https://github.com/Azure/BatchExplorer/milestone/24?closed=1)

### Fetures

* Disable/reenable scheduling on nodes [\#1629](https://github.com/Azure/BatchExplorer/issues/1629)
* Show flags of the country where the account is located [\#1626](https://github.com/Azure/BatchExplorer/pull/1627)
* Add link to privacy statement in application [\#1618](https://github.com/Azure/BatchExplorer/issues/1618)
* Integrate telemetry for crash reporting and user actions [\#1610](https://github.com/Azure/BatchExplorer/issues/1610)
* Mac application signing [\#1600](https://github.com/Azure/BatchExplorer/issues/1600)
* Upgrade to the new Azure Batch api version 2018-08-01.7.0 [\#1581](https://github.com/Azure/BatchExplorer/issues/1581)
* Background task manager v2 [\#1371](https://github.com/Azure/BatchExplorer/issues/1371)
* Support multi instance tasks [\#1329](https://github.com/Azure/BatchExplorer/issues/1329)
* Support sorting tasks [\#1328](https://github.com/Azure/BatchExplorer/issues/1328)
* Support additional Gallery repositories [\#955](https://github.com/Azure/BatchExplorer/issues/955)
* BatchExplorer should display what environment it is connected to [\#1555](https://github.com/Azure/BatchExplorer/issues/1555)
* Need to display license picker for custom image [\#1575](https://github.com/Azure/BatchExplorer/issues/1575)
* Support client side sorting for tables and quick list [\#1573](https://github.com/Azure/BatchExplorer/issues/1573)
* Pull application license data from BatchPricing.softwares [\#1563](https://github.com/Azure/BatchExplorer/issues/1563)

### Bug fixes

* Certificate list blank [\#1624](https://github.com/Azure/BatchExplorer/issues/1624)
* Account favourites not showing up when one is invalid [\#1619](https://github.com/Azure/BatchExplorer/issues/1619)
* Cloning tasks having issue with user identity [\#1616](https://github.com/Azure/BatchExplorer/issues/1616)
* Using an invalid URL for a Batch Account causes Add Pool sidebar to behave oddly [\#1613](https://github.com/Azure/BatchExplorer/issues/1613)
* Issue with any POST request on local batch accounts [\#1607](https://github.com/Azure/BatchExplorer/issues/1607)
* Don't let add duplicate local accounts [\#1605](https://github.com/Azure/BatchExplorer/issues/1605)
* Container settings are required when editing start task but should be optional [\#1603](https://github.com/Azure/BatchExplorer/issues/1603)
* Memory leak around pool node counts [\#1592](https://github.com/Azure/BatchExplorer/issues/1592)
* Typo on the job action confirmation [\#1587](https://github.com/Azure/BatchExplorer/issues/1587)
* File explorer view files with \ in name on linux [\#808](https://github.com/Azure/BatchExplorer/issues/808)
* GOVT cloud metrics charts are failing [\#1550](https://github.com/Azure/BatchExplorer/issues/1550)
* Account dashboard resources cards too large when no items [\#1541](https://github.com/Azure/BatchExplorer/issues/1541)
* NcjTemplateService issues when templates not loaded [\#1390](https://github.com/Azure/BatchExplorer/issues/1390)
* quick-list account loading appears after you click on the screen. [\#1560](https://github.com/Azure/BatchExplorer/issues/1560)
* Investigate why upload progress is no longer being reported when uploading filegroup data [\#1567](https://github.com/Azure/BatchExplorer/issues/1567)
* Node configuration don't call getRemoteLoginSettings every 5 seconds [\#1580](https://github.com/Azure/BatchExplorer/issues/1580)
* Form components disappear after selecting a rendering image then another one. [\#1576](https://github.com/Azure/BatchExplorer/issues/1576)
* In progress forms CSS busted [\#1566](https://github.com/Azure/BatchExplorer/issues/1566)

### Accessiblity

* Account list favorite not accessible [\#1626](https://github.com/Azure/BatchExplorer/issues/1626)

### Other

* Setup a new swagger validator to validate models [\#1632](https://github.com/Azure/BatchExplorer/issues/1632)
* Switch to node 10 [\#1377](https://github.com/Azure/BatchExplorer/issues/1377)

## 0.17.3

### Minor feature

* Display storage account URL in the Credentials and code samples dialog [\#1556](https://github.com/Azure/BatchExplorer/issues/1556)

### Bug fixes

* Cannot upload files to file group in govt cloud [\#1557](https://github.com/Azure/BatchExplorer/issues/1557)
* Cannot login to GOVT cloud [\#1548](https://github.com/Azure/BatchExplorer/issues/1548)
* Pricing broken, due to api breaking change [\#1562](https://github.com/Azure/BatchExplorer/issues/1562)
* Opening BatchExplorer in Govt cloud opens 2 application windows [\#1561](https://github.com/Azure/BatchExplorer/issues/1561)
* Not persisting the last login and the last selected cloud [\#1542](https://github.com/Azure/BatchExplorer/issues/1542)
* Caching issue on national clouds [\#1559](https://github.com/Azure/BatchExplorer/issues/1559)

## 0.17.1

[All items](https://github.com/Azure/BatchExplorer/milestone/25?closed=1)

### Bug fixes

* Task outputs is broken when not using autostorage account [\#1522](https://github.com/Azure/BatchExplorer/issues/1522)
* Cannot connect to Windows Cloud Service node [\#1529](https://github.com/Azure/BatchExplorer/issues/1529)
* Users should be able to see password used to connect to remote node [\#1532](https://github.com/Azure/BatchExplorer/issues/1532)

### Other

* Task properties pool and node should be links [\#1523](https://github.com/Azure/BatchExplorer/issues/1523)

## 0.17.0

[All items](https://github.com/Azure/BatchExplorer/milestone/21?closed=1)

### Feature

* Improve experience for finding failed task [\#829](https://github.com/Azure/BatchExplorer/issues/829)
* Make title bar inline with app [\#162](https://github.com/Azure/BatchExplorer/issues/162)
* Add ability to remove pinned items from drop down [\#1379](https://github.com/Azure/BatchExplorer/issues/1379)
* Create a job-id advanced type that validates the job-id doesn't exist.  [\#1330](https://github.com/Azure/BatchExplorer/issues/1330)
* Task Dependencies show task state with icon and color [\#1503](https://github.com/Azure/BatchExplorer/issues/1503)
* Pool bar charts for node states [\#1502](https://github.com/Azure/BatchExplorer/issues/1502)
* Add task runtime to task grid [\#1501](https://github.com/Azure/BatchExplorer/issues/1501)
* Support internationalization [\#1499](https://github.com/Azure/BatchExplorer/issues/1499)
* Duration picker v2 [\#1431](https://github.com/Azure/BatchExplorer/issues/1431)
* Node Connect redesign to unify windows and linux experience [\#1492](https://github.com/Azure/BatchExplorer/issues/1492)
* Task progress not exposing validity of task count api [\#1475](https://github.com/Azure/BatchExplorer/issues/1475)
* Ability to override the BatchLabs-data  branch that we pull templates from [\#1474](https://github.com/Azure/BatchExplorer/issues/1474)
* Use select query for task list to improve performance [\#1468](https://github.com/Azure/BatchExplorer/issues/1468)
* Batch Account URI should have https:// prefix [\#1435](https://github.com/Azure/BatchExplorer/issues/1435)
* Task table column layout a little funky [\#1422](https://github.com/Azure/BatchExplorer/issues/1422)
* BatchLabs: App splited in features that are can be enabled and disabled [\#1449](https://github.com/Azure/BatchExplorer/issues/1449)
* BatchLabs one click node connect [\#1452](https://github.com/Azure/BatchExplorer/issues/1452)

### Bug fixes

* Uncaught exception for container pools with no container images and/or registries specified [\#1512](https://github.com/Azure/BatchExplorer/issues/1512)
* Task timeline doesn't cancel requests when leaving component [\#1472](https://github.com/Azure/BatchExplorer/issues/1472)
* Pool from Windows managed image displays as Linux [\#1436](https://github.com/Azure/BatchExplorer/issues/1436)

### Accessibility

* Server error component is not keyboard accessible [\#1426](https://github.com/Azure/BatchExplorer/issues/1426)
* Images tags are missing alt attributes [\#1482](https://github.com/Azure/BatchExplorer/issues/1482)
* Tags are not accessible via keyboard [\#1420](https://github.com/Azure/BatchExplorer/issues/1420)
* Notification not keyboard accessible [\#1424](https://github.com/Azure/BatchExplorer/issues/1424)

### Other

* Rename BatchLabs to BatchExplorer [\#1497](https://github.com/Azure/BatchExplorer/issues/1497)
* CSS quicklist error notice in incorrect place for pools, schedules and certs [\#1510](https://github.com/Azure/BatchExplorer/issues/1510)
* Add some dependency injection logic in client process [\#1470](https://github.com/Azure/BatchExplorer/issues/1470)
* Monaco editor switch to webpack [\#1156](https://github.com/Azure/BatchExplorer/issues/1156)

## 0.16.2

[All items](https://github.com/Azure/BatchExplorer/milestone/23closed=1)

### Bug fixes

* Unable to terminate multiple tasks [\#1457](https://github.com/Azure/BatchExplorer/issues/1457)
* Pool with more then 2500 nodes does not show heatmap [\#1484](https://github.com/Azure/BatchExplorer/issues/1484)
* Window asking for proxy credentials is showing a blank screen. [\#1489](https://github.com/Azure/BatchExplorer/issues/1489)

## 0.16.1

[All items](https://github.com/Azure/BatchExplorer/milestone/22closed=1)

### Bug fixes

* App insights docs has wrong environment variables names [\#1443](https://github.com/Azure/BatchExplorer/issues/1443)
* Deleting 1 folder from a file group deletes ALL that match it! [\#1440](https://github.com/Azure/BatchExplorer/issues/1440)
* Application package state equals version string [\#1442](https://github.com/Azure/BatchExplorer/issues/1442)
* Transitioning a pool from fixed scaling to auto-scaling never enables the "Save" button [\#1441](https://github.com/Azure/BatchExplorer/issues/1441)

## 0.16.0

[All items](https://github.com/Azure/BatchExplorer/milestone/19?closed=1)

### Features

* Show in the footer if BatchExplorer is connected to the internet [\#1408](https://github.com/Azure/BatchExplorer/issues/1408)
* BatchExplorer not very helpfull when not able to loads tenants(Bad proxy for example) [\#1403](https://github.com/Azure/BatchExplorer/issues/1403)
* Refreshing account list should also refresh subscriptions [\#1398](https://github.com/Azure/BatchExplorer/issues/1398)
* Decode URL parameters passed to application [\#1364](https://github.com/Azure/BatchExplorer/issues/1364)
* File group directory picker should validate directories exists [\#1362](https://github.com/Azure/BatchExplorer/issues/1362)
* Batch insight  show a line for each node on the pool wide graph [\#1359](https://github.com/Azure/BatchExplorer/issues/1359)
* Add disk usage graphs for batch-insights [\#1357](https://github.com/Azure/BatchExplorer/issues/1357)
* Python server: Add more detail to error handling [\#1355](https://github.com/Azure/BatchExplorer/issues/1355)
* Change waiting for start task default to true [\#1349](https://github.com/Azure/BatchExplorer/issues/1349)
* Resizable columns for table [\#1346](https://github.com/Azure/BatchExplorer/issues/1346)
* Show that a filter is selected in quicklist [\#1335](https://github.com/Azure/BatchExplorer/issues/1335)
* Use new commands design to implement bl-command-buttons [\#1319](https://github.com/Azure/BatchExplorer/issues/1319)
* Add and update metadata for entities [\#1318](https://github.com/Azure/BatchExplorer/issues/1318)
* Read file support different encoding [\#875](https://github.com/Azure/BatchExplorer/issues/875)

### Bug fixes

* Unable to resize pool using Batch Explorer on mac. [\#1413](https://github.com/Azure/BatchExplorer/issues/1413)
* Opening 2 batchlabs instance is broken [\#1411](https://github.com/Azure/BatchExplorer/issues/1411)
* BatchExplorer doesn't handle ProxyEnable setting in registry [\#1385](https://github.com/Azure/BatchExplorer/issues/1385)
* Running task graph seems to be in a weird state [\#1382](https://github.com/Azure/BatchExplorer/issues/1382)
* After ~1 hour of intensive use, app grinds to a halt [\#1369](https://github.com/Azure/BatchExplorer/issues/1369)
* Storage explorer download folder has failed three times in a row [\#1368](https://github.com/Azure/BatchExplorer/issues/1368)
* Tasks quick-list wont scroll [\#1367](https://github.com/Azure/BatchExplorer/issues/1367)
* Navigate to Data before batch account loaded throws an error. [\#1361](https://github.com/Azure/BatchExplorer/issues/1361)
* Delete many from quick-list doesn't remove items from list [\#1360](https://github.com/Azure/BatchExplorer/issues/1360)
* User identity picker doesn't show up current value [\#1353](https://github.com/Azure/BatchExplorer/issues/1353)
* Opening ms-batchlabs:// link to a template with file group picker open crash [\#1344](https://github.com/Azure/BatchExplorer/issues/1344)
* Figure out why call to ratecard API is failing for pool pricing [\#1333](https://github.com/Azure/BatchExplorer/issues/1333)
* Pressing enter on editable table remove the row [\#1327](https://github.com/Azure/BatchExplorer/issues/1327)

### Accessibility

First few steps towards an accessible BatchExplorer

* Navigation dropdowns not accessible via keyboard [\#1401](https://github.com/Azure/BatchExplorer/issues/1401)
* Breadcrumb is not accessible via keyboard [\#1400](https://github.com/Azure/BatchExplorer/issues/1400)
* Main navigation keyboard navigation and focus style [\#1395](https://github.com/Azure/BatchExplorer/issues/1395)

### Other

* Misleading documentation enable-app-insights-doc [\#1348](https://github.com/Azure/BatchExplorer/issues/1348)
* Make it clear for that search field only support startswith [\#1326](https://github.com/Azure/BatchExplorer/issues/1326)

## 0.15.2

Fixes:

* 3rd subscription in account list is always disabled [\#1374](https://github.com/Azure/BatchExplorer/issues/1374)

## 0.15.1

* Enable browsing files of a offline node
* Change offline node color
* Allow custom image and docker container

## 0.15.0

[All items](https://github.com/Azure/BatchExplorer/milestone/17?closed=1)

### feature

* List context menu redesign(multi select support) [\#1300](https://github.com/Azure/BatchExplorer/issues/1300)
* Select support disable [\#1295](https://github.com/Azure/BatchExplorer/issues/1295)
* Add getting started scripts for aztk and doAzureParallel [\#1281](https://github.com/Azure/BatchExplorer/issues/1281)
* Provide a setting to disable auto update when quiting [\#1267](https://github.com/Azure/BatchExplorer/issues/1267)
* Login window and account loading indicator. [\#1265](https://github.com/Azure/BatchExplorer/issues/1265)
* Allow user to provide proxy settings [\#1263](https://github.com/Azure/BatchExplorer/issues/1263)
* Add ability to change the priority of a job [\#1260](https://github.com/Azure/BatchExplorer/issues/1260)
* Improve the sidebar bookmark dropdown [\#1253](https://github.com/Azure/BatchExplorer/issues/1253)
* New flex table layout ignores set width [\#1239](https://github.com/Azure/BatchExplorer/issues/1239)
* File explorer ability to create folder [\#1234](https://github.com/Azure/BatchExplorer/issues/1234)
* Data save last container type selection(Filegroup vs all) [\#1233](https://github.com/Azure/BatchExplorer/issues/1233)
* Show task running time on completed task in task list [\#1231](https://github.com/Azure/BatchExplorer/issues/1231)
* New select dropdown [\#1220](https://github.com/Azure/BatchExplorer/issues/1220)
* Allow to get the template for gallery application [\#1218](https://github.com/Azure/BatchExplorer/issues/1218)
* Opened form dropdown. close with middle click [\#1217](https://github.com/Azure/BatchExplorer/issues/1217)
* Resize Pool options for node termination (like Portal) [\#1212](https://github.com/Azure/BatchExplorer/issues/1212)
* Add file extension support to file-in-file-group advanced type [\#1209](https://github.com/Azure/BatchExplorer/issues/1209)
* Expand on plugin parameters to automatically set up file group sync [\#1204](https://github.com/Azure/BatchExplorer/issues/1204)
* Add a certificate reference to a pool [\#1194](https://github.com/Azure/BatchExplorer/issues/1194)
* Passing a list of folders and or files from a rendering application plugin to pre-populate the file group creation form from the submit NCJ template page. [\#1180](https://github.com/Azure/BatchExplorer/issues/1180)
* Don't limit data tab to auto storage account [\#1173](https://github.com/Azure/BatchExplorer/issues/1173)
* Support Patching JobSchedules [\#1170](https://github.com/Azure/BatchExplorer/issues/1170)
* Batch Account Certificates Experience [\#1165](https://github.com/Azure/BatchExplorer/issues/1165)
* Refresh folder in file explorer should remove removed items. [\#874](https://github.com/Azure/BatchExplorer/issues/874)

### bug

* Prod build is borken with the new Commands [\#1311](https://github.com/Azure/BatchExplorer/issues/1311)
* Spelling mistake on release website [\#1310](https://github.com/Azure/BatchExplorer/issues/1310)
* Job progress doughnut renders funny when target node count is less than running nodes [\#1307](https://github.com/Azure/BatchExplorer/issues/1307)
* Missing timestamp after generating credentials to connect to node [\#1304](https://github.com/Azure/BatchExplorer/issues/1304)
* View node files for prep tasks file contents is truncated. [\#1302](https://github.com/Azure/BatchExplorer/issues/1302)
* Deleting folder is broken with new storageAccountId [\#1290](https://github.com/Azure/BatchExplorer/issues/1290)
* Fix pinning file groups to work with the new path [\#1289](https://github.com/Azure/BatchExplorer/issues/1289)
* Viewing prep and release tasks for job shows node doesn't exist when it does. [\#1288](https://github.com/Azure/BatchExplorer/issues/1288)
* NCJ file group selector shows all containers ...  [\#1276](https://github.com/Azure/BatchExplorer/issues/1276)
* Quotas not updated when switching Batch accounts [\#1269](https://github.com/Azure/BatchExplorer/issues/1269)
* Select dropdown not showing when parent has overflow hidden [\#1261](https://github.com/Azure/BatchExplorer/issues/1261)
* bl-select always defaults to focusFirstOption() [\#1258](https://github.com/Azure/BatchExplorer/issues/1258)
* Bugs with storage containers. [\#1243](https://github.com/Azure/BatchExplorer/issues/1243)
* Typo Internal Ip "Adress" should be "Address" [\#1240](https://github.com/Azure/BatchExplorer/issues/1240)
* Create new file group name validation not showing details [\#1235](https://github.com/Azure/BatchExplorer/issues/1235)
* NCJ load a template without metadata crash [\#1232](https://github.com/Azure/BatchExplorer/issues/1232)
* Local Template encoded with UTF-8-BOM fails to parse.  [\#1226](https://github.com/Azure/BatchExplorer/issues/1226)
* Non Batch API error message passed to ServerError will miss actual error message [\#1224](https://github.com/Azure/BatchExplorer/issues/1224)
* Auto pool not working for local template [\#1219](https://github.com/Azure/BatchExplorer/issues/1219)
* Allow optional/empty fields in job/pool templates [\#1082](https://github.com/Azure/BatchExplorer/issues/1082)
* Occasionally selecting a Batch account doesn't populate the jobs and pool from the selected account. [\#653](https://github.com/Azure/BatchExplorer/issues/653)

### other

* New form field should support hints and error [\#1279](https://github.com/Azure/BatchExplorer/issues/1279)
* Update batchlabs website to point to azure storage builds [\#1275](https://github.com/Azure/BatchExplorer/issues/1275)
* New input design [\#1273](https://github.com/Azure/BatchExplorer/issues/1273)
* Searching always show current item [\#1246](https://github.com/Azure/BatchExplorer/issues/1246)
* Gallery breadcrumb is still market [\#1227](https://github.com/Azure/BatchExplorer/issues/1227)
* BatchExplorer auto update wait to be downloaded before quit and install [\#1206](https://github.com/Azure/BatchExplorer/issues/1206)

## 0.14.1

### Hot fixes

* Selecting an item when the filter is open would not close the filter [\#1207](https://github.com/Azure/BatchExplorer/issues/1207)

## 0.14.0

[All items](https://github.com/Azure/BatchExplorer/milestone/16?closed=1)

### Feature

* Add MS and NCS_V3 sizes to vm size picker. [\#1191](https://github.com/Azure/BatchExplorer/issues/1191)
* Allow to pick custom user accounts when adding a task [\#1188](https://github.com/Azure/BatchExplorer/issues/1188)
* Hide persisted files explorer when no container found [\#1185](https://github.com/Azure/BatchExplorer/issues/1185)
* Drag and Drop support for local NCJ templates. [\#1179](https://github.com/Azure/BatchExplorer/issues/1179)
* Dedicated page for account monitoring metrics [\#1149](https://github.com/Azure/BatchExplorer/issues/1149)
* Upload node logs [\#1148](https://github.com/Azure/BatchExplorer/issues/1148)
* Show app insights per node [\#1144](https://github.com/Azure/BatchExplorer/issues/1144)
* Ability to delete a batch account [\#1133](https://github.com/Azure/BatchExplorer/issues/1133)
* Handle multiple folder uploads for a single file group [\#1129](https://github.com/Azure/BatchExplorer/issues/1129)
* File explorer right click download only works for containers [\#1120](https://github.com/Azure/BatchExplorer/issues/1120)
* Support non-public Azure clouds [\#1116](https://github.com/Azure/BatchExplorer/issues/1116)
* Make list and table use virtual scroll [\#1100](https://github.com/Azure/BatchExplorer/issues/1100)
* Give an option to request more quota  [\#1097](https://github.com/Azure/BatchExplorer/issues/1097)
* File explorer keyboard navigation [\#1062](https://github.com/Azure/BatchExplorer/issues/1062)
* Show quotas on respective pages [\#1048](https://github.com/Azure/BatchExplorer/issues/1048)
* Ability to create a batch account [\#1022](https://github.com/Azure/BatchExplorer/issues/1022)
* VNet support [\#1018](https://github.com/Azure/BatchExplorer/issues/1018)
* Job schedule support [\#1008](https://github.com/Azure/BatchExplorer/issues/1008)
* Create Blender plugin to test BL Custom Protocol [\#953](https://github.com/Azure/BatchExplorer/issues/953)
* Support command line parameters to support custom workflow [\#856](https://github.com/Azure/BatchExplorer/issues/856)
* More finely grained upload progress for file groups. [\#707](https://github.com/Azure/BatchExplorer/issues/707)
* Support for adding custom image to pools [\#434](https://github.com/Azure/BatchExplorer/issues/434)

### Bug

* Batch account with no autostorage add pool doesn't show user accounts and start task picker [\#1190](https://github.com/Azure/BatchExplorer/issues/1190)
* Getting a 400 error when trying to load files from Node.  [\#1181](https://github.com/Azure/BatchExplorer/issues/1181)
* NCJ Local templates seem to have stopped working [\#1171](https://github.com/Azure/BatchExplorer/issues/1171)
* Data not being disposed correctly when switching accounts [\#1169](https://github.com/Azure/BatchExplorer/issues/1169)
* Account details not disposing of the data [\#1167](https://github.com/Azure/BatchExplorer/issues/1167)
* Pool heatmap is not updating [\#1162](https://github.com/Azure/BatchExplorer/issues/1162)
* Clicking on the account details before done loading redirect to app packages [\#1157](https://github.com/Azure/BatchExplorer/issues/1157)
* Clicking on the task filter from job details crash [\#1155](https://github.com/Azure/BatchExplorer/issues/1155)
* Application license picker validation bug [\#1153](https://github.com/Azure/BatchExplorer/issues/1153)
* Table formatting on account overview incorrect [\#1136](https://github.com/Azure/BatchExplorer/issues/1136)
* Issue with list loading and changedetection [\#1131](https://github.com/Azure/BatchExplorer/issues/1131)
* Deleting folder from file group deletes every file in file group. [\#1126](https://github.com/Azure/BatchExplorer/issues/1126)
* Refresh button change detection issue [\#1122](https://github.com/Azure/BatchExplorer/issues/1122)
* Data details(slow) change detection not triggering correctly [\#1119](https://github.com/Azure/BatchExplorer/issues/1119)
* File too large to preview UI messed up [\#1113](https://github.com/Azure/BatchExplorer/issues/1113)
* Update existing file-group not working [\#1111](https://github.com/Azure/BatchExplorer/issues/1111)
* Heatmap change detection issue [\#1095](https://github.com/Azure/BatchExplorer/issues/1095)
* Error message after updating [\#1083](https://github.com/Azure/BatchExplorer/issues/1083)
* Should disable "add a pool button" before vmSize is initialized [\#985](https://github.com/Azure/BatchExplorer/issues/985)
* Task advanced filter is not applying [\#1158](https://github.com/Azure/BatchExplorer/issues/1158)
* Fix tool tip for account credentials dialog and show ARM resource ID for Account  [\#1201](https://github.com/Azure/BatchExplorer/issues/1201)

### Usability

* Do not show the pool os information is using custom image [\#1192](https://github.com/Azure/BatchExplorer/issues/1192)
* Pool cpu usage individual cpu is confusing [\#1145](https://github.com/Azure/BatchExplorer/issues/1145)
* Account charts are a bit confusing [\#1138](https://github.com/Azure/BatchExplorer/issues/1138)

### Other

* Remove all import from "electron" [\#1140](https://github.com/Azure/BatchExplorer/issues/1140)
* Complete making @batch-flask independent [\#1109](https://github.com/Azure/BatchExplorer/issues/1109)
* Move logger to @batch-flask package [\#1108](https://github.com/Azure/BatchExplorer/issues/1108)
* Create a new @batch-flask folder to simulate a package [\#1106](https://github.com/Azure/BatchExplorer/issues/1106)
* Connect to Node - always says creds valid for 24 hours on node [\#1085](https://github.com/Azure/BatchExplorer/issues/1085)
* Update EULA, license and thirdpartynotices [\#1105](https://github.com/Azure/BatchExplorer/issues/1105)
* Redesign table component [\#1101](https://github.com/Azure/BatchExplorer/issues/1101)
* Gallery tab still has "Market" breadcrumb & title [\#1076](https://github.com/Azure/BatchExplorer/issues/1076)

## 0.13.1

Hot fixes:

* Logs being in the wrong folder [#1087](https://github.com/Azure/BatchExplorer/issues/1087)
* Proxy settings crashing if not in the expected format
* Error popup after updating [#1083](https://github.com/Azure/BatchExplorer/issues/1083)
* Fix auto update

## 0.13.0

[All items](https://github.com/Azure/BatchExplorer/milestone/15?closed=1)

### feature

* Ctrl+Shift+N for new window [\#1046](https://github.com/Azure/BatchExplorer/issues/1046)
* BatchExplorer behind proxy [\#1015](https://github.com/Azure/BatchExplorer/issues/1015)
* Metadata property should display as pre [\#1010](https://github.com/Azure/BatchExplorer/issues/1010)

### bug

* Log out button doesnt work [\#1068](https://github.com/Azure/BatchExplorer/issues/1068)
* Stale task list [\#1065](https://github.com/Azure/BatchExplorer/issues/1065)
* File explorer folder last modified invalid date [\#1061](https://github.com/Azure/BatchExplorer/issues/1061)
* BatchExplorer doesn't use nextLink to retrieve all the subscriptions [\#1057](https://github.com/Azure/BatchExplorer/issues/1057)
* Pool vm size picker get weird spacing [\#1055](https://github.com/Azure/BatchExplorer/issues/1055)
* Error message box should scale to message size [\#1053](https://github.com/Azure/BatchExplorer/issues/1053)
* Authentication page hides behind app when you are not logged in [\#1043](https://github.com/Azure/BatchExplorer/issues/1043)
* Pool picker pools disappear after switched to a different batch account.  [\#1038](https://github.com/Azure/BatchExplorer/issues/1038)
* App protocol handler with session_id causes weird redraw issue [\#1037](https://github.com/Azure/BatchExplorer/issues/1037)
* Splash screen goes behind the app half way through loading [\#1035](https://github.com/Azure/BatchExplorer/issues/1035)
* Job Statistics: Graph fails to load "Loading Tasks. This can take a long time" [\#873](https://github.com/Azure/BatchExplorer/issues/873)

### other

## 0.12.4

### Hot fix

* Error redeem auth code for a token... [\#1044](https://github.com/Azure/BatchExplorer/issues/1044)
* Updater appears to be broken [\#1042](https://github.com/Azure/BatchExplorer/issues/1042)

## 0.12.3

### Hot fix

* File-group/container issue with adding more files(Disabled for non file group for now) [\#1033](https://github.com/Azure/BatchExplorer/issues/1033)
* Storage Container Search Broken  [\#1039](https://github.com/Azure/BatchExplorer/issues/1039)

## 0.12.2

### Hot fix

* Update Electron to fix vulnerability [\#1030](https://github.com/Azure/BatchExplorer/issues/1030)

## 0.12.1

### Hot fix

* Subscriptions not loading if not cached [\#1027](https://github.com/Azure/BatchExplorer/issues/1027)

## 0.12.0

[All items](https://github.com/Azure/BatchExplorer/milestone/14?closed=1)

### Feature

* Data view should show all blob container not just file group [\#1006](https://github.com/Azure/BatchExplorer/issues/1006)
* Rbac permission support. Disable action in batchlabs if user doesn't have write permission [\#1000](https://github.com/Azure/BatchExplorer/issues/1000)
* Make app single instance [\#998](https://github.com/Azure/BatchExplorer/issues/998)
* Stop prompting aad login window when refresh token are still valid [\#990](https://github.com/Azure/BatchExplorer/issues/990)
* Enable AOT compilation to improve loading time [\#986](https://github.com/Azure/BatchExplorer/issues/986)
* Cache batch accounts to improve initial loading time [\#982](https://github.com/Azure/BatchExplorer/issues/982)
* Provide sample code to get started with shared key credentials entered [\#980](https://github.com/Azure/BatchExplorer/issues/980)
* Account credentials access [\#970](https://github.com/Azure/BatchExplorer/issues/970)
* Support for inbound endpoints [\#965](https://github.com/Azure/BatchExplorer/issues/965)
* Make a open component in a new window  [\#74](https://github.com/Azure/BatchExplorer/issues/74)
* Update the theming system to use json instead of scss [\#1012](https://github.com/Azure/BatchExplorer/issues/1012)

### Other

* Implement a new promise base communication from renderer to main process [\#1004](https://github.com/Azure/BatchExplorer/issues/1004)
* Add code coverage [\#987](https://github.com/Azure/BatchExplorer/issues/987)
* Extract AAD logic to be outside of the angular service into the node environment [\#963](https://github.com/Azure/BatchExplorer/issues/963)

## 0.11.0

[All items](https://github.com/Azure/BatchExplorer/milestone/12?closed=1)

### feature

* Register batchlabs default protocol to open from the browser [\#934](https://github.com/Azure/BatchExplorer/issues/934)
* Batch Explorer should show a clear error when it cannot connect to its python web service [\#923](https://github.com/Azure/BatchExplorer/issues/923)
* Implement a footer for the app and move some of the dropdown from the header [\#901](https://github.com/Azure/BatchExplorer/issues/901)
* Show current quota usage on the account page [\#799](https://github.com/Azure/BatchExplorer/issues/799)
* File explorer download a folder with right click [\#657](https://github.com/Azure/BatchExplorer/issues/657)
* Goto directly to an entity doesn't show the entity in the quicklist [\#199](https://github.com/Azure/BatchExplorer/issues/199)
* Export entities to template to allow cloning after deleted [\#19](https://github.com/Azure/BatchExplorer/issues/19)
* NCJ advanced type for generating a container SAS [\#757](https://github.com/Azure/BatchExplorer/issues/757)

### bug

* Shortcut "cmd+H" is not supported on macOS [\#948](https://github.com/Azure/BatchExplorer/issues/948)
* Pricing is broken [\#857](https://github.com/Azure/BatchExplorer/issues/857)
* Pool estimated cost take rendering license into account [\#684](https://github.com/Azure/BatchExplorer/issues/684)

### other

* Application package icons need updating [\#939](https://github.com/Azure/BatchExplorer/issues/939)
* Tweak quick search ui [\#924](https://github.com/Azure/BatchExplorer/issues/924)
* List multi select should change color when losing focus [\#31](https://github.com/Azure/BatchExplorer/issues/31)

## 0.10.2

### Bug

* VM Size selector broken [\#940](https://github.com/Azure/BatchExplorer/issues/940)

## 0.10.1

[All items](https://github.com/Azure/BatchExplorer/milestone/13?closed=1)

### Bug

* Nodes with start task failed state don't show the files [\#929](https://github.com/Azure/BatchExplorer/issues/929)
* OS Family Not Reported on Pool Correctly [\#927](https://github.com/Azure/BatchExplorer/issues/927)
* Error reading job prep-task [\#926](https://github.com/Azure/BatchExplorer/issues/926)

## 0.10.0

[All items](https://github.com/Azure/BatchExplorer/milestone/11?closed=1)

### Feature

* Move breadcrumb in the header [\#906](https://github.com/Azure/BatchExplorer/issues/906)
* Create Pool/Job/Task monaco json editor intellisense [\#888](https://github.com/Azure/BatchExplorer/issues/888)
* Log viewer should switch to monaco editor [\#882](https://github.com/Azure/BatchExplorer/issues/882)
* Pause notification dismiss timeout when hovering the notification [\#879](https://github.com/Azure/BatchExplorer/issues/879)
* Allow to pick expiry time for user when connecting to a node [\#878](https://github.com/Azure/BatchExplorer/issues/878)
* Node files display message when node is not available [\#876](https://github.com/Azure/BatchExplorer/issues/876)
* Move from Codemirror to Monaco editor [\#870](https://github.com/Azure/BatchExplorer/issues/870)
* Make notification stay longer on the screen [\#848](https://github.com/Azure/BatchExplorer/issues/848)
* Ability to write json payload in the create forms and submit instead of UI [\#844](https://github.com/Azure/BatchExplorer/issues/844)
* Allow users to create empty file groups [\#826](https://github.com/Azure/BatchExplorer/issues/826)

### Bug

* Data upload in file group is not working [\#912](https://github.com/Azure/BatchExplorer/issues/912)
* Create empty file-group doesn't validate container name [\#905](https://github.com/Azure/BatchExplorer/issues/905)
* CSS for "forms in progress" needs updating and fonts made readable and consistent [\#904](https://github.com/Azure/BatchExplorer/issues/904)
* Switching fast between pools crash UI [\#898](https://github.com/Azure/BatchExplorer/issues/898)
* CSS bug when too many files in task outputs file explorer [\#893](https://github.com/Azure/BatchExplorer/issues/893)
* Account quota not updating when refreshing [\#885](https://github.com/Azure/BatchExplorer/issues/885)
* Missing SKU details about Linux N series VM [\#872](https://github.com/Azure/BatchExplorer/issues/872)

### Other

* Prepare release 0.10.0 [\#915](https://github.com/Azure/BatchExplorer/issues/915)
* Useragent should include OS [\#895](https://github.com/Azure/BatchExplorer/issues/895)
* Should we integrate Application Insights into Batch Explorer? [\#824](https://github.com/Azure/BatchExplorer/issues/824)
* Refactor rx-list-proxy to a new system [\#814](https://github.com/Azure/BatchExplorer/issues/814)
* Suggest using iconography instead of a label for the breadcrumb bar [\#696](https://github.com/Azure/BatchExplorer/issues/696)
* Ability to pin Jobs, Tasks, or Pools. [\#456](https://github.com/Azure/BatchExplorer/issues/456)
* Add typing to RxProxy options [\#204](https://github.com/Azure/BatchExplorer/issues/204)
* Perf counter support [\#112](https://github.com/Azure/BatchExplorer/issues/112)

## 0.9.0

[All items](https://github.com/Azure/BatchExplorer/milestone/10?closed=1)

### Feature

* Make start task command line textbox wrap [\#847](https://github.com/Azure/BatchExplorer/issues/847)
* Command line properties is often too long to be displayed in properties. [\#837](https://github.com/Azure/BatchExplorer/issues/837)
* Show a link to the logs folder to help debug [\#836](https://github.com/Azure/BatchExplorer/issues/836)
* Auto delete package versions when deleting an application package [\#831](https://github.com/Azure/BatchExplorer/issues/831)
* Display the application version [\#820](https://github.com/Azure/BatchExplorer/issues/820)
* Add evaluate autoscale formula  [\#817](https://github.com/Azure/BatchExplorer/issues/817)
* Add compute node errors banner [\#816](https://github.com/Azure/BatchExplorer/issues/816)
* Job create experience more details [\#794](https://github.com/Azure/BatchExplorer/issues/794)
* Upgrade to the new azure-batch sdk that work in the browser env [\#792](https://github.com/Azure/BatchExplorer/issues/792)
* Add context menu to app packages quick-list [\#776](https://github.com/Azure/BatchExplorer/issues/776)
* Allow file group creation from NCJ job submission page [\#761](https://github.com/Azure/BatchExplorer/issues/761)

### Bug

* Can't add a task when job is disabled [\#864](https://github.com/Azure/BatchExplorer/issues/864)
* Can't preview image on Windows or Linux nodes [\#853](https://github.com/Azure/BatchExplorer/issues/853)
* Disable "reimage node" option for nodes in IaaS pool [\#852](https://github.com/Azure/BatchExplorer/issues/852)
* User Identity not showing up in start task [\#849](https://github.com/Azure/BatchExplorer/issues/849)
* Adding a new task seems to produce blank list in the table [\#841](https://github.com/Azure/BatchExplorer/issues/841)
* When deleting job from the details card the css overlay is not removed. [\#828](https://github.com/Azure/BatchExplorer/issues/828)
* Failed to upload file groups for classic storage accounts [\#819](https://github.com/Azure/BatchExplorer/issues/819)

### Other

* Getting ready for version 0.9.0 [\#866](https://github.com/Azure/BatchExplorer/issues/866)
* Set user agent to BatchExplorer for all request [\#861](https://github.com/Azure/BatchExplorer/issues/861)
* Add suport for maxWallClockTime in the create job experience [\#839](https://github.com/Azure/BatchExplorer/issues/839)
* Refactor rx-entity-proxy to a new system [\#795](https://github.com/Azure/BatchExplorer/issues/795)
* Make an about page [\#279](https://github.com/Azure/BatchExplorer/issues/279)

## 0.8.0

[All items](https://github.com/Azure/BatchExplorer/milestone/9?closed=1)

### Feature

* Ncj app gallery [\#786](https://github.com/Azure/BatchExplorer/issues/786)
* Task output messages confusing for customers [\#769](https://github.com/Azure/BatchExplorer/issues/769)
* Allow specifying resize timeout on pool create [\#764](https://github.com/Azure/BatchExplorer/issues/764)
* Notification actions [\#750](https://github.com/Azure/BatchExplorer/issues/750)
* Enable edit start task from the node and reboot [\#749](https://github.com/Azure/BatchExplorer/issues/749)
* Allow delete folder/file from the file group context menu. [\#733](https://github.com/Azure/BatchExplorer/issues/733)
* Ability to resize the tree view in the file explorer(Movable splitter) [\#724](https://github.com/Azure/BatchExplorer/issues/724)
* Find a way to surface prep and release task failures [\#708](https://github.com/Azure/BatchExplorer/issues/708)

### Bug

* Form picker(Start task) reset to empty from when clicking cancel [\#801](https://github.com/Azure/BatchExplorer/issues/801)
* Typo in pool configuration [\#798](https://github.com/Azure/BatchExplorer/issues/798)
* Creating a pool without changing the resizeTimeout gives an error [\#796](https://github.com/Azure/BatchExplorer/issues/796)
* Pool start task failed quickfix not doing anything [\#788](https://github.com/Azure/BatchExplorer/issues/788)
* AAD refresh token expired/revoke doesn't refresh the app. [\#783](https://github.com/Azure/BatchExplorer/issues/783)
* File group download only downloading files at the root [\#780](https://github.com/Azure/BatchExplorer/issues/780)
* After deleting application, overlay is not removed [\#777](https://github.com/Azure/BatchExplorer/issues/777)
* File groups not listing all the files [\#751](https://github.com/Azure/BatchExplorer/issues/751)
* Memory leak in app [\#745](https://github.com/Azure/BatchExplorer/issues/745)
* Fix spelling of completition [\#742](https://github.com/Azure/BatchExplorer/issues/742)
* Copy and paste doesn't work on osx prod build [\#727](https://github.com/Azure/BatchExplorer/issues/727)
* Misleading message "The files for the specified task have been cleaned from the node." [\#689](https://github.com/Azure/BatchExplorer/issues/689)

### Other

* Organize summary card for all entities [\#754](https://github.com/Azure/BatchExplorer/issues/754)
* Disable tab animations [\#747](https://github.com/Azure/BatchExplorer/issues/747)
* show subscription name in the account details subtitle [\#740](https://github.com/Azure/BatchExplorer/issues/740)
* Make quick list more compact [\#735](https://github.com/Azure/BatchExplorer/issues/735)
* Make the details take the full height and scrolling happens in tabs content [\#730](https://github.com/Azure/BatchExplorer/issues/730)
* Refactor server error to work better with all different inputs [\#694](https://github.com/Azure/BatchExplorer/issues/694)
* Remove storage node proxy [\#685](https://github.com/Azure/BatchExplorer/issues/685)

## 0.7.0

[All items](https://github.com/Azure/BatchExplorer/milestone/8?closed=1)

### Features

* Ability to view third party notice from UI [\#690](https://github.com/Azure/BatchExplorer/issues/690)
* Command line input for task improvement [\#670](https://github.com/Azure/BatchExplorer/issues/670)
* Add files to a file group with drag and drop [\#651](https://github.com/Azure/BatchExplorer/issues/651)
* Add refresh shortcut to work in prod build [\#647](https://github.com/Azure/BatchExplorer/issues/647)
* User identity for task  [\#639](https://github.com/Azure/BatchExplorer/issues/639)
* Clean up excessive console errors when task logs are not available on node [\#631](https://github.com/Azure/BatchExplorer/issues/631)
* Add 3ds max to the application license picker [\#627](https://github.com/Azure/BatchExplorer/issues/627)
* Job tasks running time graph sorting/grouping of x axis [\#624](https://github.com/Azure/BatchExplorer/issues/624)
* Add charts on the job home page(when no jobs selected) [\#621](https://github.com/Azure/BatchExplorer/issues/621)
* Feature: File explorer [\#614](https://github.com/Azure/BatchExplorer/issues/614)
* Make an install command to help people getting started(windows) [\#610](https://github.com/Azure/BatchExplorer/issues/610)
* Add more charts for a job [\#473](https://github.com/Azure/BatchExplorer/issues/473)
* Settings page [\#472](https://github.com/Azure/BatchExplorer/issues/472)
* Tree view for files [\#466](https://github.com/Azure/BatchExplorer/issues/466)
* Provide built app for download [\#405](https://github.com/Azure/BatchExplorer/issues/405)
* Smart card support for windows  [\#271](https://github.com/Azure/BatchExplorer/issues/271)

### Bugs

* Heatmap display bug when resizing window or pool resize [\#715](https://github.com/Azure/BatchExplorer/issues/715)
* Exit code is not showing in the task table list [\#712](https://github.com/Azure/BatchExplorer/issues/712)
* Job preparation and release task having styling issues [\#709](https://github.com/Azure/BatchExplorer/issues/709)
* Progress getting lost if file group name is too large [\#704](https://github.com/Azure/BatchExplorer/issues/704)
* File explorer not reading files from storage account. [\#702](https://github.com/Azure/BatchExplorer/issues/702)
* Job graph is overflowing vertically when in running prod [\#697](https://github.com/Azure/BatchExplorer/issues/697)
* File explorer long file/folder name wrapping bug [\#668](https://github.com/Azure/BatchExplorer/issues/668)
* Autoscale formula not updating [\#665](https://github.com/Azure/BatchExplorer/issues/665)
* Profile settings throws an error for user settings [\#661](https://github.com/Azure/BatchExplorer/issues/661)
* Profile menu item forces navigation to dashboard and reload when closed. [\#660](https://github.com/Azure/BatchExplorer/issues/660)
* File explorer improve errors on task outputs [\#654](https://github.com/Azure/BatchExplorer/issues/654)
* UI gets into a bad state if you navigate to a start task which has an environment variable with no value [\#646](https://github.com/Azure/BatchExplorer/issues/646)
* Task id needs to be truncated in the table [\#645](https://github.com/Azure/BatchExplorer/issues/645)
* run elevated not set when running tasks with autoUser in admin mode [\#638](https://github.com/Azure/BatchExplorer/issues/638)
* BatchExplorer ghost process after closing prod app [\#633](https://github.com/Azure/BatchExplorer/issues/633)
* Detailed information should be shown if an error occurs during allocation [\#618](https://github.com/Azure/BatchExplorer/issues/618)
* Splash screen not showing in packaged distributable [\#616](https://github.com/Azure/BatchExplorer/issues/616)
* Graph hover text [\#608](https://github.com/Azure/BatchExplorer/issues/608)
* Grammar in task running time graph [\#607](https://github.com/Azure/BatchExplorer/issues/607)
* Handle forbidden 403 errors [\#577](https://github.com/Azure/BatchExplorer/issues/577)
* Cannot read a blob from a file group with a full path. [\#561](https://github.com/Azure/BatchExplorer/issues/561)

### Other

* Update readme to prepare for the release [\#692](https://github.com/Azure/BatchExplorer/issues/692)
* ThirdPartyNotice generator [\#682](https://github.com/Azure/BatchExplorer/issues/682)
* Log python stdout and stderr to file [\#678](https://github.com/Azure/BatchExplorer/issues/678)
* Find an open port for the python server to connect to [\#676](https://github.com/Azure/BatchExplorer/issues/676)
* Switch to es6 [\#641](https://github.com/Azure/BatchExplorer/issues/641)
* Table selection/activation improvement [\#626](https://github.com/Azure/BatchExplorer/issues/626)
* Upload file group as a background task [\#615](https://github.com/Azure/BatchExplorer/issues/615)

## Version 0.6.0(Beta)

[All items](https://github.com/Azure/BatchExplorer/milestone/6?closed=1)

### Features

* Show pool estimated pricing [\#595](https://github.com/Azure/BatchExplorer/issues/595)
* Added graphs for the job [\#591](https://github.com/Azure/BatchExplorer/issues/591)
* Download a file group(NCJ)  [\#589](https://github.com/Azure/BatchExplorer/issues/589)
* File picker inside a file group(NCJ) [\#571](https://github.com/Azure/BatchExplorer/issues/571)
* File group picker(NCJ)  [\#569](https://github.com/Azure/BatchExplorer/issues/569)
* File group UI(NJC)  [\#530](https://github.com/Azure/BatchExplorer/issues/530)
* Delete a node [\#554](https://github.com/Azure/BatchExplorer/issues/554)
* Propose to delete the job with the same id as the pool you are trying to delete [\#543](https://github.com/Azure/BatchExplorer/issues/543)
* Preview of files(node or storage uploaded) is more efficient with caching [\#519](https://github.com/Azure/BatchExplorer/issues/519)
* Make metadata editable [\#513](https://github.com/Azure/BatchExplorer/issues/513)
* Application license picker(Maya, 3ds Max) [\#498](https://github.com/Azure/BatchExplorer/issues/498)
* Right click functionatlities on the heatmap [\#487](https://github.com/Azure/BatchExplorer/issues/487)

[Many bug fixes](https://github.com/Azure/BatchExplorer/issues?q=is%3Aissue+milestone%3A0.6.0+is%3Aclosed+label%3Abug)

## Version 0.5.0(Beta)

[All items](https://github.com/Azure/BatchExplorer/milestone/5?closed=1)

### Features

* Link Storage account in Batch Explorer [\#385](https://github.com/Azure/BatchExplorer/issues/385)
* New actions buttons [\#408](https://github.com/Azure/BatchExplorer/issues/408)
* Low priority VMs [\#414](https://github.com/Azure/BatchExplorer/issues/414)
* Details now refresh automatically every 10 seconds [\#428](https://github.com/Azure/BatchExplorer/issues/428)
* Show batch account quotas [\#413](https://github.com/Azure/BatchExplorer/issues/413)
* Job show manager task details [\#447](https://github.com/Azure/BatchExplorer/issues/447)
* Preview images(and gif) and code files in labs  [\#417](https://github.com/Azure/BatchExplorer/issues/417)
* Setup python support for ncj [\#439](https://github.com/Azure/BatchExplorer/issues/439)
* Task output quick add otherfiles for debug [\#184](https://github.com/Azure/BatchExplorer/issues/184)
* Job prep/release task status read experience [\#429](https://github.com/Azure/BatchExplorer/issues/429)
* Start task failed show error banner on node details [\#476](https://github.com/Azure/BatchExplorer/issues/476)

## Version 0.4.0(Beta)

[All items](https://github.com/Azure/BatchExplorer/milestone/3?closed=1)

### Features

* Added a new multi picker control [\#358](https://github.com/Azure/BatchExplorer/issues/358)
* Added user accounts support at pool creation using the multi picker [\#359](https://github.com/Azure/BatchExplorer/issues/359)
* Update enabled/disabled properties icon to be less confusing [\#354](https://github.com/Azure/BatchExplorer/issues/354)
* Pool start task can now use the useridentity selecition. [\#356](https://github.com/Azure/BatchExplorer/issues/354)
* Move tasks tab to be first in the tab list [\#375](https://github.com/Azure/BatchExplorer/issues/375)
* Made a new editable table control and update resource files to use it [\#376](https://github.com/Azure/BatchExplorer/issues/376)
* New environment settings picker for tasks and start task [\#355](https://github.com/Azure/BatchExplorer/issues/355)
* Improve account home page with a quick access to pools, jobs and applications  [\#310](https://github.com/Azure/BatchExplorer/issues/310)
* Account list now allow to filter by multiple subscription(Last selection is saved) [\#352](https://github.com/Azure/BatchExplorer/issues/352)
* Use chached value to display entity(Job, Pool, etc.) immediately when selected in the list  [\#382](https://github.com/Azure/BatchExplorer/issues/382)
* Added a few more missing fields to the pool creation  [\#357](https://github.com/Azure/BatchExplorer/issues/357)
* Added loading icon for account list on first load  [\#340](https://github.com/Azure/BatchExplorer/issues/340)
* Added a packaging flow to be able to make an exe  [\#364](https://github.com/Azure/BatchExplorer/issues/364)
* Improve dates and timespan field in configuration [\#396](https://github.com/Azure/BatchExplorer/issues/396)
* Listen to electron error events to show a recovery window [\#337](https://github.com/Azure/BatchExplorer/issues/337)

### Fixes

* Edit start task cannot cancel [\#367](https://github.com/Azure/BatchExplorer/issues/367)
* Fix bug where graphs keeps history when switching between pools [\#353](https://github.com/Azure/BatchExplorer/issues/353)
* Fix unwanted form submit when pressing enter [\#393](https://github.com/Azure/BatchExplorer/issues/393)
* Fix configuration tabs having a nested scrollbar [\#397](https://github.com/Azure/BatchExplorer/issues/397)
* Fix list not having focus after click [\#400](https://github.com/Azure/BatchExplorer/issues/400)

## Version 0.3.1(Beta)

[All items](https://github.com/Azure/BatchExplorer/milestone/4?closed=1)

### Fixes

* Fix error when cloning a pool not using autoscale forumla [\#342](https://github.com/Azure/BatchExplorer/issues/342)
* UI bug in the pool nodes preview(Font size is off) [\#332](https://github.com/Azure/BatchExplorer/issues/332)
* Application edit form missed in the new form refactor [\#334](https://github.com/Azure/BatchExplorer/issues/334)

## Version 0.3.0(Beta)

[All items](https://github.com/Azure/BatchExplorer/milestone/2?closed=1)

### Features

* Autoscale forumla support with option to save forumla [\#321](https://github.com/Azure/BatchExplorer/issues/321)
* Big work on the form UI(Also added pool start task picker)
    * Section and picker [\#321](https://github.com/Azure/BatchExplorer/issues/4)
    * Form error sticky at the bottom not to miss it [\#317](https://github.com/Azure/BatchExplorer/issues/317)
* Read/Save files to azure storage UX  [\#110](https://github.com/Azure/BatchExplorer/issues/110)
* New VM size picker as a sortable table [\#292](https://github.com/Azure/BatchExplorer/issues/292)
* New pool picker for the job create experience [\#284](https://github.com/Azure/BatchExplorer/issues/284)
* New OS picker for the pool create experience [\#278](https://github.com/Azure/BatchExplorer/issues/278)
* Added refresh account button [\#289](https://github.com/Azure/BatchExplorer/issues/289)

### Fixes

* Bug with max results [\#295](https://github.com/Azure/BatchExplorer/issues/295) [\#297](https://github.com/Azure/BatchExplorer/issues/297) [\#299](https://github.com/Azure/BatchExplorer/issues/299)

## Version 0.2.0(Beta)

[All items](https://github.com/Azure/BatchExplorer/milestone/1?closed=1)

### Features

* Production build [PR 173](https://github.com/Azure/BatchExplorer/pull/173)
* Improve the VM size experience to show info about each vm size [PR 277](https://github.com/Azure/BatchExplorer/pull/277)
* Load all the VM sizes [PR 275](https://github.com/Azure/BatchExplorer/pull/275)
* Load all account on start: improve account selection experience by removing the need to click on the subscription first [PR 273](https://github.com/Azure/BatchExplorer/pull/273)
* Creating a new entity will add it to the query cache(i.e. Adding a pool then switching to jobs list then back to pool should still show the added pool in the list) [PR 272](https://github.com/Azure/BatchExplorer/pull/272)
* Splash screen show progress [PR 270](https://github.com/Azure/BatchExplorer/pull/270)
* Updated application icon [PR 266](https://github.com/Azure/BatchExplorer/pull/266)
* Clone entities should keep attributes not in form[PR 262](https://github.com/Azure/BatchExplorer/pull/262)
* Added yarn [PR 260](https://github.com/Azure/BatchExplorer/pull/260)

### Fixes

* Fix node files `Load more` always showing [PR 268](https://github.com/Azure/BatchExplorer/pull/268)

## Version 0.1.0(Beta)

Initial version

### Features

* Login with azure active directory(Giving access to user subscriptions and applications)
* Browse pools, node, jobs, tasks, applications
* Basic creationg of pools, jobs and tasks
* Upload new applications and packages
* Graphs for status of pools(heatmap, nodes availables, running tasks)
* Many error banner helper with quick fixes options(e.g. Task timeout)
* Much more [All closed issues](https://github.com/Azure/BatchExplorer/issues?q=is%3Aissue+is%3Aclosed)
