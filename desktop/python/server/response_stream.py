import asyncio

class ResponseStreamManager:
    def __init__(self):
        self.loop = asyncio.new_event_loop()

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
