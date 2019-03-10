import azext.batch
from msrestazure.azure_active_directory import AdalAuthentication

class BatchAccount:
    def __init__(self, account_id: str, name: str, account_endpoint: str, subscription_id: str):
        self.id = account_id
        self.name = name
        self.account_endpoint = account_endpoint
        self.subscription_id = subscription_id

    @staticmethod
    def from_dict(data: dict):
        return BatchAccount(
            account_id=data['id'],
            name=data['name'],
            account_endpoint=data['properties']['accountEndpoint'],
            subscription_id=data['subscription']['subscriptionId']
        )


class AADAuth:
    def __init__(self, batchToken: str, armToken: str, armUrl: str, storage_endpoint: str, account: BatchAccount):
        self.batchCreds = AdalAuthentication(
            lambda: {'accessToken': batchToken, 'tokenType': 'Bearer'})
        self.armCreds = AdalAuthentication(
            lambda: {'accessToken': armToken, 'tokenType': 'Bearer'})
        self.armUrl = armUrl
        self.storage_endpoint = storage_endpoint
        self.account = account

        self.client = azext.batch.BatchExtensionsClient(
            credentials=self.batchCreds,
            batch_account=self.account.name,
            batch_url='https://{0}'.format(account.account_endpoint),
            subscription_id=account.subscription_id,
            mgmt_credentials=self.armCreds,
            mgmt_base_url=self.armUrl,
            storage_endpoint=self.storage_endpoint)

    @staticmethod
    def from_dict(data: dict):
        return AADAuth(
            batchToken=data['batchToken'],
            armToken=data['armToken'],
            armUrl=data['armUrl'],
            storage_endpoint=data['storageEndpoint'],
            account=BatchAccount.from_dict(data['account']),
        )
