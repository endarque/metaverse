query = {
    "sentence": "query",
    "CREATE_USER": "INSERT INTO MP_USER (USER_ID, EMAIL_ADDRESS, USER_NAME, MANAGER, USER_TYPE) VALUES (%s, %s, %s, %s, %s) ",
    "SELECT_USER": "SELECT * FROM MP_USER WHERE USER_ID = %s",
}