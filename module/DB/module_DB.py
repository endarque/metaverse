# file name : module_DB
# pwd : /module/DB/module_DB.py

import pymysql
from properties.sql.sql_sentence import query as query_list

class Database:
    def __init__(self):
        self.db = pymysql.connect(host='maap.crd72iz5rvqc.ap-northeast-2.rds.amazonaws.com',
                                  user='admin',
                                  password='gkswjdtn',
                                  db='MAAP_DB',
                                  charset='utf8')
        self.cursor = self.db.cursor(pymysql.cursors.DictCursor)

    def execute(self, query, args={}):
        self.cursor.execute(query, args)

    def executeOne(self, query, args={}):
        self.cursor.execute(query, args)
        row = self.cursor.fetchone()
        return row

    def executeAll(self, query, args={}):
        self.cursor.execute(query, args)
        row = self.cursor.fetchall()
        return row

    def commit(self):
        self.db.commit()

    # if connection is lost reconnect to DB
    def reconnect(self):
        print("reconnect() : DB connection is closed. Reconnect to DB")
        self.db.ping(True)
        self.cursor.execute("SELECT 1;")

    def open(self):
        return self.db.open


def SELECT(sql_sentence, val, *args):
    # sql = prop[sql_sentence]    #"SELECT * FROM TB_USER;"
    # row = db_class.executeAll(sql)
    if not db_class.open():
        db_class.reconnect()

    sql = query_list[sql_sentence]
    for value in args:
        sql = sql + value

    # print("SELECT[" + sql_sentence + "] : " + sql)
    try:
        if val is None:
            row = db_class.executeAll(sql)
        else:
            row = db_class.executeAll(sql, val)
        return row
    except ConnectionAbortedError as db_err:
        print("SELECT(ConnectionAbortedError) : " + str(db_err))
        db_class.reconnect()
        result, err = error_handler("SELECT", sql, val)
        return result
    except pymysql.err.MySQLError as db_err:
        print("SELECT(MySQLError) : " + str(db_err))
        db_class.reconnect()
        result, err = error_handler("SELECT", sql, val)
        return result
    except Exception as e:
        print("Exception : " + str(e))
        return []
    except pymysql.err.OperationalError as db_err:
        print("SELECT(OperationalError) : " + str(db_err))
        db_class.reconnect()
        result, err = error_handler("SELECT", sql, val)
        return result
    except pymysql.err.DataError as db_err:
        print("SELECT(DataError) : " + str(db_err))
        db_class.reconnect()
        result, err = error_handler("SELECT", sql, val)
        return result
    except pymysql.err.InternalError as db_err:
        print("SELECT(InternalError) : " + str(db_err))
        db_class.reconnect()
        result, err = error_handler("SELECT", sql, val)
        return result
    except pymysql.err.IntegrityError as db_err:
        print("SELECT(IntegrityError) : " + str(db_err))
        db_class.reconnect()
        result, err = error_handler("SELECT", sql, val)
        return result
    except pymysql.err.DatabaseError as db_err:
        print("SELECT(DatabaseError) : " + str(db_err))
        db_class.reconnect()
        result, err = error_handler("SELECT", sql, val)
        return result
    except pymysql.err.InterfaceError as db_err:
        print("SELECT(InterfaceError) : " + str(db_err))
        db_class.reconnect()
        result, err = error_handler("SELECT", sql, val)
        return result


# val = list 형태로 넘겨준다.
def INSERT(sql_sentence, val):
    if not db_class.open():
        db_class.reconnect()

    sql = query_list[sql_sentence]
    # print("INSERT[" + sql_sentence + "] : " + sql)
    try:
        db_class.execute(sql, val)
        db_class.commit()
    except ConnectionAbortedError as db_err:
        print("INSERT(ConnectionAbortedError) : " + str(db_err))
        db_class.reconnect()
        result, err = error_handler("INSERT", sql, val)
        return result, err
    except pymysql.err.MySQLError as db_err:
        print("INSERT(MySQLError) : " + str(db_err))
        db_class.reconnect()
        result, err = error_handler("INSERT", sql, val)
        return result, err
    except Exception as e:
        print("Exception : " + str(e))
        return False, str(e)
    except pymysql.err.OperationalError as db_err:
        print("INSERT(OperationalError) : " + str(db_err))
        db_class.reconnect()
        result, err = error_handler("INSERT", sql, val)
        return result, err
    except pymysql.err.DataError as db_err:
        print("INSERT(DataError) : " + str(db_err))
        db_class.reconnect()
        result, err = error_handler("INSERT", sql, val)
        return result, err
    except pymysql.err.InternalError as db_err:
        print("INSERT(InternalError) : " + str(db_err))
        db_class.reconnect()
        result, err = error_handler("INSERT", sql, val)
        return result, err
    except pymysql.err.IntegrityError as db_err:
        print("INSERT(IntegrityError) : " + str(db_err))
        db_class.reconnect()
        result, err = error_handler("INSERT", sql, val)
        return result, err
    except pymysql.err.DatabaseError as db_err:
        print("INSERT(DatabaseError) : " + str(db_err))
        db_class.reconnect()
        result, err = error_handler("INSERT", sql, val)
        return result, err
    except pymysql.err.InterfaceError as db_err:
        print("INSERT(InterfaceError) : " + str(db_err))
        db_class.reconnect()
        result, err = error_handler("INSERT", sql, val)
        return result, err

    return True, None


def DELETE(sql_sentence, val):
    if not db_class.open():
        db_class.reconnect()

    sql = query_list[sql_sentence]
    # print("DELETE[" + sql_sentence + "] : " + sql)

    try:
        db_class.execute(sql, val)
        db_class.commit()
    except ConnectionAbortedError as db_err:
        print("DELETE(ConnectionAbortedError) : " + str(db_err))
        db_class.reconnect()
        result, err = error_handler("DELETE", sql, val)
        return result, err
    except pymysql.err.MySQLError as db_err:
        print("DELETE(MySQLError) : " + str(db_err))
        db_class.reconnect()
        result, err = error_handler("DELETE", sql, val)
        return result, err
    except Exception as e:
        print("Exception : " + str(e))
        return False, str(e)
    except pymysql.err.OperationalError as db_err:
        print("DELETE(OperationalError) : " + str(db_err))
        db_class.reconnect()
        result, err = error_handler("DELETE", sql, val)
        return result, err
    except pymysql.err.DataError as db_err:
        print("DELETE(DataError) : " + str(db_err))
        db_class.reconnect()
        result, err = error_handler("DELETE", sql, val)
        return result, err
    except pymysql.err.InternalError as db_err:
        print("DELETE(InternalError) : " + str(db_err))
        db_class.reconnect()
        result, err = error_handler("DELETE", sql, val)
        return result, err
    except pymysql.err.IntegrityError as db_err:
        print("DELETE(IntegrityError) : " + str(db_err))
        db_class.reconnect()
        result, err = error_handler("DELETE", sql, val)
        return result, err
    except pymysql.err.DatabaseError as db_err:
        print("DELETE(DatabaseError) : " + str(db_err))
        db_class.reconnect()
        result, err = error_handler("DELETE", sql, val)
        return result, err
    except pymysql.err.InterfaceError as db_err:
        print("DELETE(InterfaceError) : " + str(db_err))
        db_class.reconnect()
        result, err = error_handler("DELETE", sql, val)
        return result, err

    return True, None


def UPDATE(sql_sentence, val):
    if not db_class.open():
        db_class.reconnect()

    sql = query_list[sql_sentence]
    # print("UPDATE[" + sql_sentence + "] : " + sql)
    try:
        db_class.execute(sql, val)
        db_class.commit()
    except ConnectionAbortedError as db_err:
        print("UPDATE(ConnectionAbortedError) : " + str(db_err))
        db_class.reconnect()
        result, err = error_handler("UPDATE", sql, val)
        return result, err
    except pymysql.err.MySQLError as db_err:
        print("UPDATE(MySQLError) : " + str(db_err))
        db_class.reconnect()
        result, err = error_handler("UPDATE", sql, val)
        return result, err
    except Exception as e:
        print("Exception : " + str(e))
        return False, str(e)
    except pymysql.err.OperationalError as db_err:
        print("UPDATE(OperationalError) : " + str(db_err))
        db_class.reconnect()
        result, err = error_handler("UPDATE", sql, val)
        return result, err
    except pymysql.err.DataError as db_err:
        print("UPDATE(DataError) : " + str(db_err))
        db_class.reconnect()
        result, err = error_handler("UPDATE", sql, val)
        return result, err
    except pymysql.err.InternalError as db_err:
        print("UPDATE(InternalError) : " + str(db_err))
        db_class.reconnect()
        result, err = error_handler("UPDATE", sql, val)
        return result, err
    except pymysql.err.IntegrityError as db_err:
        print("UPDATE(IntegrityError) : " + str(db_err))
        db_class.reconnect()
        result, err = error_handler("UPDATE", sql, val)
        return result, err
    except pymysql.err.DatabaseError as db_err:
        print("UPDATE(DatabaseError) : " + str(db_err))
        db_class.reconnect()
        result, err = error_handler("UPDATE", sql, val)
        return result, err
    except pymysql.err.InterfaceError as db_err:
        print("UPDATE(InterfaceError) : " + str(db_err))
        db_class.reconnect()
        result, err = error_handler("UPDATE", sql, val)
        return result, err

    return True, None


# DB reconnect issue 발생 시 error로 인해 진행하지 못한 query를
# 다시한번 실행시켜 준다.
def error_handler(sql_type, sql, val):
    if sql_type is "SELECT":
        if val is None:
            row = db_class.executeAll(sql)
        else:
            row = db_class.executeAll(sql, val)
        return row, None
    elif sql_type is "UPDATE" or sql_type is "INSERT" or sql_type is "DELETE":
        try:
            db_class.execute(sql, val)
            db_class.commit()
        except Exception as e:
            return False, str(e)
        return True, None


if __name__ == "module.DB.module_DB":
    print("Load module_DB")
    db_class = Database()
