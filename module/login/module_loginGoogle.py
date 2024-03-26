import json
from flask_login import login_user
import requests
from oauthlib.oauth2 import WebApplicationClient
from module.login.module_login import login
from module.login.module_user import User, UserType

GOOGLE_CLIENT_ID = "300941907475-fvqoq9em70o7nihiqfm6p00avoecsl43.apps.googleusercontent.com"
GOOGLE_CLIENT_PW = "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"
GOOGLE_DISCOVERY_URL = "https://accounts.google.com/.well-known/openid-configuration"

class loginGoogle(login):

    def __init__(self):
        self.client = WebApplicationClient(GOOGLE_CLIENT_ID)

    def login(self, baseUrl):

        googleConfig = self.getGoogleProviderConfig()
        endPoint = googleConfig["authorization_endpoint"]

        requestUri = self.client.prepare_request_uri(
            endPoint,
            redirect_uri=baseUrl + '/callback',
            scope=["openid", "email", "profile"],
        )

        return requestUri

    def callback(self, reqestCode, authUrl, baseUrl):

        code = reqestCode
        googleConfig = self.getGoogleProviderConfig()
        tokenEndPoint = googleConfig["token_endpoint"]

        tokenUrl, headers, body = self.client.prepare_token_request(
            tokenEndPoint,
            authorization_response=authUrl,
            redirect_url=baseUrl,
            code=code,
        )

        tokenResponse = requests.post(
            tokenUrl,
            headers=headers,
            data=body,
            auth=(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_PW),
        )

        # token parse
        self.client.parse_request_body_response(json.dumps(tokenResponse.json()))

        userEndPoint = googleConfig["userinfo_endpoint"]
        uri, headers, body = self.client.add_token(userEndPoint)
        userResponse = requests.get(uri, headers=headers, data=body)

        # 사용자 정보 얻어오기, 환경에 따라 추가 필요
        print(userResponse.json())
        if userResponse.json().get("email_verified"):
            uniqueId = userResponse.json()["sub"]
            email = userResponse.json()['email']
            name = userResponse.json()['given_name']
        else:
            return 400

        # 유저 정보 생성 (DB에 넣을 정보)
        user = User(uniqueId=uniqueId, email=email, name=name, type=UserType.GOOGLE)

        # 가입된 유저가 아니면 유저 데이터 베이스 정보 생성
        #if User.get(uniqueId):
        #     User.create(user)

        login_user(user)

        return 200

    def getGoogleProviderConfig(self):
        return requests.get(GOOGLE_DISCOVERY_URL).json()