from flask_login import UserMixin
from enum import Enum
# import module.DB.module_DB as db

class UserType(Enum):
    GOOGLE  = 1
    KAKAO   = 2
    NAVER   = 3

class User(UserMixin):

    def __init__(self, uniqueId, email, name, type):
        self.id = uniqueId
        self.email = email
        self.name = name
        self.type = type

    @staticmethod
    def get(uniqueID):
        # DB에서 유저 정보 확인해서 가져올 것
        # row = db.SELECT("SELECT_USER", uniqueID)

        # print(row)
        # if len(row) == 0:
        #    return None

        user = User(uniqueID, "badcats01@gmail.com", "badcats", UserType.GOOGLE) # row[0]["EMAIL_ADDRESS"], row[0]["USER_NAME"], row[0]["USER_TYPE"])
        return user

    @staticmethod
    def create(user):
        # DB에 유저 넣을 것
        db.INSERT("CREATE_USER", [user.id, user.email, user.name, 'false', user.type])
        return