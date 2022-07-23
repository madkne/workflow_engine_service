
import json
from typing import Dict, List, Literal


class WorkflowStateAction():
    __name: str
    __type: Literal['hook_url', 'redis', 'local']
    __access_roles: List[str]
    __required_fields: List[str]
    __optional_fields: List[str]
    __message_required: bool
    __meta: Dict
    __set_fields: Dict
    # hook_url type
    __url: str
    __method: Literal['get', 'post', 'put', 'delete']
    __headers: Dict = None
    # redis type
    __channel: str
    __response_channel: str
    __redis_instance: str = None
    # local type
    __next_state: str

    def __init__(self, name: str, access_roles: List[str] = ['_all_'], message_required=False, meta: Dict = {}, required_fields: List[str] = [], optional_fields: List[str] = [], set_fields: List[str] = []):
        self.__name = name
        self.__access_roles = access_roles
        self.__message_required = message_required
        self.__meta = meta
        self.__required_fields = required_fields
        self.__optional_fields = optional_fields
        self.__set_fields = set_fields

        return None

    def hook_url(self, url: str, method: Literal['get', 'post', 'put', 'delete'] = 'post', headers: Dict = {}):
        self.__type = 'hook_url'
        self.__url = url
        self.__method = method
        self.__headers = headers
        return self

    def redis(self, channel: str, response_channel: str, instance: str = None):
        self.__type = 'redis'
        self.__channel = channel
        self.__response_channel = response_channel
        if instance is not None:
            self.__redis_instance = instance
        return self

    def local(self, next_state: str):
        self.__type = 'local'
        self.__next_state = next_state
        return self

    def set_fields(self, fields: Dict):
        self.__set_fields = fields
        return self

    def required_fields(self, fields: List[str]):
        self.__required_fields = fields
        return self

    def optional_fields(self, fields: List[str]):
        self.__optional_fields = fields
        return self

    def get_name(self):
        return self.__name

    def __str__(self) -> str:
        schema = {
            'access_roles': self.__access_roles,
            'set_fields': self.__set_fields,
            'required_fields': self.__required_fields,
            'optional_fields': self.__optional_fields,
            'name': self.__name,
            'message_required': self.__message_required,
            'type': self.__type,
        }
        if self.__type == 'local':
            schema['next_state'] = self.__next_state
        elif self.__type == 'hook_url':
            schema['url'] = self.__url
            schema['method'] = self.__method
            if self.__headers is not None:
                schema['headers'] = self.__headers
        elif self.__type == 'redis':
            schema['channel'] = self.__channel
            schema['response_channel'] = self.__response_channel
            if self.__redis_instance is not None:
                schema['redis_instance'] = self.__redis_instance

        return json.dumps(schema)
