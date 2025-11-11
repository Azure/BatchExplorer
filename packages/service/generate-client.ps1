

# overrided options for emitter: @azure-tools/typespec-ts
# see details: https://www.npmjs.com/package/@azure-tools/typespec-ts
$options = (
    "generateMetadata=false; " +
    "azureSdkForJs=false; " +
    "generateTest=false; "
)

#Sample commands to generate client from a local PR branch which is not merged to azure-rest-api-specs repo main branch yet
#npx tsp-client sync --local-spec-repo C:\git\azure-rest-api-specs\specification\batch\Azure.Batch --output-dir "./src/internal/batch-rest/generated"
#npx tsp-client generate --emitter-options $options --output-dir "./src/internal/batch-rest/generated"

npx tsp-client update `
--emitter-options $options `
--output-dir "./src/internal/batch-rest/generated"

