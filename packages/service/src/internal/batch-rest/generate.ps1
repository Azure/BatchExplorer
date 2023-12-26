

npx tsp-client update `
--emitter-options `
"
service-dir=.;
package-dir=generated;
generateMetadata=false;
azureSdkForJs=false;
generateTest=false
"

-o "./generated2"
