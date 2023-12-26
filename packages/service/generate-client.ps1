

# override options for emitter: @azure-tools/typespec-ts
# see details: https://www.npmjs.com/package/@azure-tools/typespec-ts
$options = (
    "generateMetadata=false; " +
    "azureSdkForJs=false; " +
    "generateTest=false; "
)

npx tsp-client update `
--emitter-options $options `
--output-dir "./src/internal/batch-rest/generated"

