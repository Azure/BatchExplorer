import inspect
from jsonrpc.error import JsonRpcMethodNotFoundError, JsonRpcInvalidParamsError


class BatchLabsApp:
    """
        Batch labs app
    """

    def __init__(self):
        self.procedures = dict()

    def procedure(self, name: str, **options):
        def decorator(func):
            self.add_procedure(name, func, **options)
            return func
        return decorator

    def add_procedure(self, name: str, callback=None):
        """Connects a URL rule.  Works exactly like the :meth:`route`
        decorator.

        Basically this example::

            @app.procedure('foo')
            def foo():
                pass

        Is equivalent to the following::

            def foo():
                pass
            app.add_procedure('foo', foo)

        """
        self.procedures[name] = callback

    async def call_procedure(self, request):
        """
            Call the register procedure with the given name. If none found it raise a JsonRpcMethodNotFoundError
        """
        name = request.method
        params = request.params
        if name in self.procedures:
            try:
                action = self.procedures[name]
                if inspect.iscoroutinefunction(action):
                    return await action(request, *params)
                else:
                    return action(request, *params)

            except TypeError as e:
                raise JsonRpcInvalidParamsError(e.args)
        else:
            raise JsonRpcMethodNotFoundError(name)


app = BatchLabsApp()
