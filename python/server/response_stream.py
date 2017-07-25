class ResponseStream:
    def __init__(self):
        self.callbacks = []

    def onData(self, callback):
        self.callbacks.append(callback)

    def send(self, data, last = False):
        for callback in self.callbacks:
            callback(data, last)

        if last:
            self.callbacks = []
