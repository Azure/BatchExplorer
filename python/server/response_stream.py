class ResponseStream:
    def __init__(self):
        self.callbacks = []

    def onData(self, callback):
        self.callbacks.append(callback)

    async def send(self, data, last = False):
        for callback in self.callbacks:
            await callback(data, last)

        if last:
            self.callbacks = []
