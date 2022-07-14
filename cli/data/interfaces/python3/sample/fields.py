from lib.fields import FieldClass, FieldItem
from lib.fields.FieldClass import FieldClass


class {{name}}Fields(FieldClass):
    phone = FieldItem.StringField(default="091300000")
    is_done = FieldItem.BooleanField()
    email = FieldItem.StringField('email').validation(
        FieldItem.FieldItemValidation(builtin_check=FieldItem.FieldItemValidation.builtInType.EMAIL))
    avatar = FieldItem.FileField(
        max_file_size=342, allowed_mime_types=['application/json'])
