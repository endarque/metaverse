from flask_login import logout_user

class login():

    def logout(self):
        logout_user()
        return