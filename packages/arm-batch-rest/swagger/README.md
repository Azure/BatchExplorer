# Azure Batch TypeScript Protocol Layer

> see <https://aka.ms/autorest>

## Configuration

```yaml
package-name: "@batch/arm-batch-rest"
title: BatchManagementClient
description: Batch Management Client
generate-metadata: false
generate-test: false
generate-sample: false
license-header: MICROSOFT_MIT_NO_VERSION
output-folder: ../
source-code-folder-path: ./src/generated
input-file: https://raw.githubusercontent.com/Azure/azure-rest-api-specs/main/specification/batch/resource-manager/Microsoft.Batch/stable/2022-10-01/BatchManagement.json
package-version: 1.0.0-beta.1
rest-level-client: true
add-credentials: true
azure-arm: true
credential-scopes: "https://management.azure.com/.default"
use-extension:
  "@autorest/typescript": "6.0.0-rc.2"
```

### Rename BatchAccountCreateParameters -> AccountBatchCreateParameters

```yaml
directive:
  - from: swagger-document
    where: $.definitions.BatchAccountCreateParameters
    transform: >
      $["x-ms-client-name"] = "AccountBatchCreateParameters";
```

### Rename BatchAccountUpdateParameters -> AccountBatchUpdateParameters

```yaml
directive:
  - from: swagger-document
    where: $.definitions.BatchAccountUpdateParameters
    transform: >
      $["x-ms-client-name"] = "AccountBatchUpdateParameters";
```

### Rename BatchAccountRegenerateKeyParameters -> AccountBatchRegenerateKeyParameters

```yaml
directive:
  - from: swagger-document
    where: $.definitions.BatchAccountRegenerateKeyParameters
    transform: >
      $["x-ms-client-name"] = "AccountBatchRegenerateKeyParameters";
```
