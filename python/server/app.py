import inspect
import traceback
from jsonrpc.error import JsonRpcMethodNotFoundError, JsonRpcInvalidParamsError, JsonRpcError
import azext.batch.errors as batch_ext_error
import azure.batch.models.batch_error as batch_error
import azure.common
import logging

class BatchLabsApp:
    """
        Batch Explorer app
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
        print("Adding new proc", name)
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
            except azure.common.AzureMissingResourceHttpError as e:
                # pylint: disable=E1101
                raise JsonRpcError(e.status_code, str(e), {})
            except batch_error.BatchErrorException as e:
                # pylint: disable=E1101
                raise JsonRpcError(e.response.status_code, e.message.value, e.response.json())
            except batch_ext_error.MissingParameterValue as e:
                raise JsonRpcInvalidParamsError(str(e), {
                    'paramName': e.parameter_name,
                    'paramDescription': e.parameter_description,
                })
            except TypeError as e:
                logging.error("Failed to call procedure %s, error was thrown %s", name, str(e))
                print(traceback.format_exc())
                raise JsonRpcInvalidParamsError(str(e), e.args)
        else:
            raise JsonRpcMethodNotFoundError(name)


app = BatchLabsApp()
