import requests
from flask_login import login_user
from module.login.module_login import login
from module.login.module_user import User, UserType
from oauthlib.oauth2 import WebApplicationClient

KAKAO_AUTH_SERVER = "https://kauth.kakao.com%s"
KAKAO_API_SERVER = "https://kapi.kakao.com%s"
KAKAO_RESTAPI_KEY = "1e03b9449a21e4ef67fe0594dea2574f"
KAKAO_SECTERT_KEY = "DClCfmRiHvmISDFYt0y4Tb5HUl0R7QKI"

class loginKakao(login):

    def __init__(self):
        self.auth_server = KAKAO_AUTH_SERVER
        self.api_server = KAKAO_API_SERVER
        self.default_header = {
            "Content-Type": "application/x-www-form-urlencoded",
            "Cache-Control": "no-cache",
        }
        return

    def login(self, baseUrl):
        self.redirectUri = baseUrl + '/callback'
        kakao_oauth_url = f"https://kauth.kakao.com/oauth/authorize?client_id={KAKAO_RESTAPI_KEY}&redirect_uri={self.redirectUri}&response_type=code"
        return kakao_oauth_url


    def callback(self, requestCode, baseUrl):
        token = requests.post(
            url=self.auth_server % "/oauth/token",
            headers=self.default_header,
            data={
                "grant_type": "authorization_code",
                "client_id": KAKAO_RESTAPI_KEY,
                "client_secret": KAKAO_SECTERT_KEY,
                "redirect_uri": self.redirectUri,
                "code": requestCode,
            }
        ).json()

        if "error" in token:
            print("Error in Token")
            return 400

        user = requests.post(
            url=self.api_server % "/v2/user/me",
            headers={
                **self.default_header,
                **{"Authorization": "Bearer " + token['access_token']}
            },
            data={}
        ).json()

        print("User : ", user)
        uniqueId = user['id']
        kakao_account = user["kakao_account"]
        profile = kakao_account["profile"]
        name = profile["nickname"]
        if "email" in kakao_account.keys():
            email = kakao_account["email"]
        else:
            email = f"{name}@kakao.com"

        user = User(uniqueId, email, name, UserType.KAKAO)

        # if User.get(uniqueId):
        #    User.create(user)

        login_user(user)

        return 200