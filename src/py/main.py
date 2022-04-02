import os
import fitz
import io
import sys
import sqlite3
import datetime
from shutil import copyfile
from sqlite3 import Error
from datetime import date

def createContract(folder, data, total, payed, phone, invoice):
    client = ""
    try:
        template = fitz.Document(os.path.join(os.getcwd(), "resources", "app", "docs", "template.pdf"))
        for i in range(1, 3):
            page = template[i]
            wid = page.firstWidget
            while wid:
                if wid.field_name == 'name client':
                    wid.field_value = client = data[21]
                elif wid.field_name == "phone":
                    wid.field_value = phone
                elif wid.field_name == "address":
                    wid.field_value = data[1].replace("/-/", ",")
                elif wid.field_name == "materials_description":
                    wid.field_value = data[2].replace("/-/", ",")
                elif wid.field_name == "back splash":
                    wid.field_value = data[5].replace("/-/", ",")
                elif wid.field_name == "Edge":
                    wid.field_value = data[6].replace("/-/", ",")
                elif wid.field_name == "Special Edge":
                    wid.field_value = data[7].replace("/-/", ",")
                elif wid.field_name == "island_Yes":
                    if data[8].strip() != "false":
                        wid.field_value = True
                    else:
                        wid.field_value = False
                        wid = wid.next
                        wid.field_value = True
                elif wid.field_name == "vanity_Yes":
                    if not len(data[10]) > 0:
                        wid = wid.next
                        wid.field_value = True
                    else:
                        wid.field_value = True
                elif wid.field_name == "kitchen_sinks":
                    wid.field_value = data[9]
                elif wid.field_name == "bath_sinks":
                    wid.field_value = data[10]
                elif wid.field_name == "client name":
                    wid.field_value = client
                elif wid.field_name == 'cost':
                    wid.field_value = total
                elif wid.field_name == 'pay now':
                    wid.field_value = payed
                elif wid.field_name == "restant pay":
                    wid.field_value = str(int(total) - int(payed))
                elif wid.field_name == 'today':
                    wid.field_value = datetime.datetime.now().strftime("%d/%m/%Y")
                elif wid.field_name == "bank acct":
                    wid.field_value = invoice
                wid.update()
                wid = wid.next
        
        template.save(folder + "/contract_{0}.pdf".format(client))
        template.close()
        print("Contract saved in: " + folder)
    except Exception as e:
        print(e.args)

class BBDD:
    query = None
    cursor = None
    conection = None
    bbdd_path = os.getcwd() + "/resources/app/src/database/main.db"
    send = ""
    tables_list = ["clients", "jobs", "suppliers", "supplies", "users"]
    create_table_clients = 'CREATE TABLE clients ("ID" INTEGER NOT NULL UNIQUE, "FULLNAME" TEXT NOT NULL UNIQUE, "EMAIL" TEXT UNIQUE, "PHONE" TEXT NOT NULL UNIQUE,\
        PRIMARY KEY("ID"));'
    create_table_jobs = 'CREATE TABLE "jobs" ("ID" INTEGER NOT NULL UNIQUE, "CLIENT" INTEGER NOT NULL, "ADDRESS" TEXT NOT NULL, "MATERIALS"	TEXT, "MEASURMENT_DAY" DATE,\
        "INSTALATION_DAY" DATE, "SIGN_DAY" DATE, "BACKSPLASH" TEXT, "EDGE" TEXT, "SPECIAL_EDGE" TEXT, "ISLAND" TEXT, "KITCHEN_SINK" TEXT, "VANITYS" TEXT DEFAULT 0,\
            "SPECIAL_PARTS"	INTEGER, "DESCRIPTION" TEXT, "TEMPLATES" INTEGER DEFAULT 0, "IMAGES" TEXT DEFAULT false, "CONTRACT" TEXT DEFAULT false,\
                "METHOD_PAY_FIRST" TEXT, "TOTAL" NUMERIC, "PAYED" NUMERIC, "REST" NUMERIC, "METHOD_PAY_SECOND" INTEGER, PRIMARY KEY("ID"),\
                    FOREIGN KEY("CLIENT") REFERENCES "clients"("ID"));'
    create_table_suppliers = 'CREATE TABLE "suppliers" ( "ID" INTEGER NOT NULL, "NAME" TEXT NOT NULL, "REPRESENTANT" TEXT NOT NULL, "PHONE" TEXT NOT NULL,\
        PRIMARY KEY("ID"));'
    create_table_supplies = 'CREATE TABLE "supplies" ("ID" INTEGER, "BRAND" TEXT, "MODEL" TEXT, "SUPPLIER" INTEGER NOT NULL, "TYPE" TEXT, "MATERIAL" TEXT,\
        "COLOR" TEXT, "SIZE" TEXT, "PRICE" REAL, "IMAGES" TEXT, PRIMARY KEY("ID" AUTOINCREMENT), FOREIGN KEY("SUPPLIER") REFERENCES "suppliers"("ID"));'
    create_table_users = 'CREATE TABLE "users" ( "ID" INTEGER UNIQUE, "NAME" NOT NULL UNIQUE, "PASSWORD" TEXT NOT NULL, PRIMARY KEY("ID" AUTOINCREMENT));'

    def __init__(self):
        self.conection = sqlite3.connect(self.bbdd_path)
        self.cursor = self.conection.cursor()
    
    def control(self):
        all_tables = []
        self.query = "SELECT name FROM sqlite_master WHERE type='table';"
        self.cursor.execute(self.query)
        tables = self.cursor.fetchall()
        for tab in tables:
            tab = str(tab).replace("'", "").replace("(", "").replace(")", "").replace(",", "")
            all_tables.append(tab)
        for tab in self.tables_list:
            if tab not in all_tables:
                if tab == "clients":
                    self.cursor.execute(self.create_table_clients)
                if tab == "jobs":
                    self.cursor.execute(self.create_table_jobs)
                elif tab == "suppliers":
                    self.cursor.execute(self.create_table_suppliers)
                elif tab == "supplies":
                    self.cursor.execute(self.create_table_supplies)
                elif tab == "users":
                    self.cursor.execute(self.create_table_users)
        self.conection.commit()
        return("OK")

    def newUser(self):
        try:
            user = sys.argv[2]
            password = sys.argv[3]
            self.query = "INSERT INTO users (NAME, PASSWORD) VALUES (?, ?);"
            if self.cursor.execute(self.query, [user, password]):
                self.conection.commit()
                return "OK"
            else:
                raise Exception("Something was wrong while recording the new user")
        except Exception as e:
            return e.args


    def getAllUsers(self):
        try:
            res = self.cursor.execute("SELECT * FROM users").fetchall()
            if res:
                return "OK"
            else:
                raise Exception("There are no some user registered. Please, create your user")
        except Exception as e:
            return e.args

    def confirmUser(self):
        try:
            user = sys.argv[2]
            password = sys.argv[3]
            self.query = "SELECT * FROM users WHERE NAME = ? AND PASSWORD = ?"
            exist_user = self.cursor.execute(self.query, [user, password]).fetchall()
            if exist_user:
                return "OK"
            else:
                raise Exception("The username or password are wrong.")
        except Exception as e:
            return e.args

    def getAllSuppliers(self):
        try:
            self.query = "SELECT ID, NAME, REPRESENTANT, PHONE FROM suppliers"
            result = self.cursor.execute(self.query)
            supp_list = result.fetchall()
            if supp_list:
                for i in supp_list:
                    self.send += str(i) + "|"
                return self.send
            else:
                raise Exception("There are no some supplier registered")
        except Exception as e:
            return e.args
        except Error as err:
            return err

    def newSupplier(self, name, representant, phone):
        try:
            self.query = "INSERT INTO suppliers (NAME, REPRESENTANT, PHONE) VALUES (?, ?, ?)"
            result = self.cursor.execute(self.query, [name.strip(), representant.strip(), phone.strip()])
            if result:
                self.conection.commit()
                return "Supplier registrated succesfully"
            else:
                raise Exception("Something was wrong while recording the new supplier")
        except Exception as e:
            return e.args
    
    def deleteSupplier(self, id):
        try:
            res = self.cursor.execute("DELETE FROM suppliers WHERE ID = ?", id)
            if res:
                self.conection.commit()
                res = self.cursor.execute("DELETE FROM supplies WHERE SUPPLIER = ?", id)
                if res:
                    self.conection.commit()
                    return "Supplier deleted succesfully"
            else:
                raise Exception("Something was wrong while deleting the supplier")
        except Exception as e:
            return e.args

    def updateSupplier(self, id, name, representant, phone):
        try:
            res = self.cursor.execute("UPDATE suppliers SET NAME = ?, REPRESENTANT = ?, PHONE = ? WHERE ID = ?;", [name, representant, phone, id])
            if res:
                self.conection.commit()
                return "Supplier updated succesfully"
            else:
                raise Exception("Something was wrong while updating supplier's data")
        except Exception as e:
            return e.args

    def getAllClients(self):
        try:
            self.query = "SELECT ID, FULLNAME, PHONE, EMAIL FROM clients"
            result = self.cursor.execute(self.query)
            clients_list = result.fetchall()
            if clients_list:
                for i in clients_list:
                    self.send += str(i) + "|"
                return self.send
            else:
                raise Exception("There are no clients registered")
        except Exception as e:
            return e.args
        except Error as err:
            return err
        
    def getClientByPhone(self, phone):
        try:
            self.query = "SELECT * FROM clients WHERE PHONE = ?"
            result = self.cursor.execute(self.query, [phone.strip()])
            client = result.fetchone()
            if client:
                return client
            else:
                raise Exception("There are no some client with that phone")
        except Exception as e:
            return e.args
        except Error as err:
            return err

    def newClient(self, fullname, phone, email):
        try:
            self.query = "INSERT INTO clients (FULLNAME, PHONE, EMAIL) VALUES (?, ?, ?);"
            result = self.cursor.execute(self.query, [fullname.strip(), phone.strip(), email.strip()])
            if result:
                self.conection.commit()
                return "Successful registration"
            else:
                raise Exception("Something was wrong with registration. Try it again")
        except Exception as e:
            return e.args
        except Error as err:
            return err
    
    def deleteClient(self, phone):
        try:
            self.query = "DELETE FROM clients WHERE PHONE = ?"
            if self.cursor.execute(self.query, [phone.strip()]):
                self.conection.commit()
                return "Client deleted succesfully"
            else:
                raise Exception("Something was wrong while deleting the client")
        except Exception as e:
            return e.args
        except Error as err:
            return err
    
    def updateClient(self, id, name, email, phone):
        try:
            self.query = "UPDATE clients SET FULLNAME = ?, PHONE = ?, EMAIL = ? WHERE ID = ?;"
            if self.cursor.execute(self.query, [name.strip(), phone.strip(), email.strip(), id.strip()]):
                self.conection.commit()
                return "Client data updated succesfully"
            else:
                raise Exception("Something was wrong while updating data of client")
        except Exception as e:
            return e.args

    def getAllJobs(self):
        j = 0
        send = ""
        try:
            self.query = "SELECT * FROM jobs;"
            result = self.cursor.execute(self.query)
            if result:
                all_jobs = result.fetchall()
                if all_jobs:
                    for job in all_jobs:
                        self.query = "SELECT * FROM clients WHERE ID = ?;"
                        job = list(job)
                        job[1] = self.cursor.execute(self.query, [job[1]]).fetchone()
                        self.send = self.send + str(job) + "|"
                    return self.send
                else:
                    raise Exception("No jobs registered in the system")
            else:
                raise Exception("No jobs registered in the system")
        except Exception as e:
            return e
    
    def newJob(self, list):
        # list = [filepy, "newJob", client, address, meas, materials, backsp, edge, sp_edge, island, bsink, ksink, templates, descr, special, contract, invoice, method, files, client_name, total, payed, phone, vanity, sec_pay])
                    # 0       1        2        3      4       5          6     7       8       9       10      11      12      13      14        15        16      17      18      19         20    21    22     23       24
        i = 0
        params = []
        filelist = []
        path_flag = False
        try:
            params.append(list[2]) # client [0]
            params.append(str(list[3]).replace(",", "/-/").strip()) # address [1]
            params.append(str(list[5]).replace(",", "/-/").strip()) # material [2]
            params.append(str(list[4]).replace(",", "/-/").strip()) # measurment [3]
            params.append(date.today().strftime("%Y/%m/%d").strip()) # sign_day [4]
            params.append(str(list[6]).replace(",", "/-/").strip()) # backsplash [5]
            params.append(str(list[7]).replace(",", "/-/").strip()) # edge [6]
            params.append(str(list[8]).replace(",", "/-/").strip()) # special edge [7]
            params.append(list[11].strip()) # kitchen sinks [8]
            params.append(list[10].strip()) # bath sinks [9]
            params.append(list[9].strip()) # island [10]
            params.append(str(list[14]).replace(",", "/-/").strip()) # special part [11]
            params.append(str(list[13]).replace(",", "/-/").strip()) # description [12]
            params.append(str(list[12]).strip()) # templates [13]
            if list[18] != "false":
                list[18] = list[18].split(" - ")
                list[18].pop()
                filelist = list[18]
                params.append("true") # has files [14]
            else:
                params.append("false") # has files [14]
            params.append(list[15].strip()) # contract [15]
            params.append(str(list[17]).strip()) # first method pay [16]
            params.append(str(list[20]).strip()) # total [17]
            params.append(str(list[21]).strip()) # payed [18]
            params.append(int(list[20]) - int(list[21])) # rest [19]
            params.append(list[24]) # second method pay [20]
            self.query = "INSERT INTO jobs (CLIENT, ADDRESS, MATERIALS, MEASURMENT_DAY, SIGN_DAY, BACKSPLASH, EDGE, SPECIAL_EDGE, ISLAND, KITCHEN_SINK, VANITYS, SPECIAL_PARTS, DESCRIPTION, TEMPLATES, IMAGES, CONTRACT, METHOD_PAY_FIRST, TOTAL, PAYED, REST, METHOD_PAY_SECOND)\
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);"
            if self.cursor.execute(self.query, params):
                his_path = os.path.join(os.getcwd(), "resources", "app", "docs", "jobs")
                if not os.path.exists(his_path):
                    os.mkdir(his_path)
                his_path = os.path.join(his_path,  list[19].strip())
                if not os.path.exists(his_path):
                    os.mkdir(his_path)
                his_path = os.path.join(his_path, "Job_" + str(self.cursor.lastrowid).strip())
                if not os.path.exists(his_path):
                    os.mkdir(his_path)
                if list[15].strip() == "true":
                    params.append(list[19]) # Client Name [21]
                                #   folder,   data,        total,          payed,           phone,                   invoice
                    createContract(his_path, params, list[20].strip(), list[21].strip(), list[22].strip(), str(self.cursor.lastrowid).strip())
                for file in filelist:
                    name = file.split("\\")
                    copyfile(file, his_path + "\\" + name[len(name)-1])
                self.conection.commit()
                return "New Job Registered Succesfully"
            else:
                raise Exception("Something was wrong while saving new job")
        except Exception as e:
            return e.args

    def updateJob(self, data):
        # list = [filepy, "updateJob", id_job, address, meas_day, materials, backsplash, edge, sp_edge, bath_sinks, kitchen_sinks, island, templates, description, sp_parts, need_contract, need_invoice, method_pay, files_job, client_name, total_money, payed, phone, vanity, method_sec]
                   # 0       1            2        3        4        5          6          7      8         9             10         11       12          13          14          15            16            17          18         19           20         21     22     23        24      
        i = 0
        params = []
        filelist = []
        path_flag = False
        try:
            client = list(self.getClientByPhone(data[22]))
            params.append(client[0]) # id client [0]
            params.append(str(data[3]).replace(",", "/-/").strip()) # address [1]
            params.append(str(data[5]).replace(",", "/-/").strip()) # material [2]
            params.append(str(data[4]).replace(",", "/-/").strip()) # measurment [3]
            params.append(date.today().strftime("%Y/%m/%d").strip()) # sign_day [4]
            params.append(str(data[6]).replace(",", "/-/").strip()) # backsplash [5]
            params.append(str(data[7]).replace(",", "/-/").strip()) # edge [6]
            params.append(str(data[8]).replace(",", "/-/").strip()) # special edge [7]
            params.append(data[11].strip()) # island [10]
            params.append(data[10].strip()) # kitchen sinks [8]
            params.append(data[9].strip()) # bath sinks [9]
            params.append(str(data[14]).replace(",", "/-/").strip()) # special part [11]
            params.append(str(data[13]).replace(",", "/-/").strip()) # description [12]
            params.append(str(data[12]).strip()) # templates [13]
            if data[18] != "false":
                data[18] = data[18].split(" - ")
                data[18].pop()
                filelist = data[18]
                params.append("true") # Has Files [14]
            else:
                params.append("false") # Has Files [14]
            params.append(data[15].strip()) # contract [15]
            params.append(str(data[17]).strip()) # method pay [16]
            params.append(str(data[20]).strip()) # total [17]
            params.append(str(data[21]).strip()) # payed [18]
            params.append(int(data[20]) - int(data[21])) # rest [19]
            params.append(data[24]) # method second pay [20]
            params.append(data[2]) # ID Job [21]
            self.query = "UPDATE jobs SET CLIENT = ?, ADDRESS = ?, MATERIALS = ?, MEASURMENT_DAY = ?, SIGN_DAY = ?, BACKSPLASH = ?, EDGE = ?,\
                SPECIAL_EDGE = ?, ISLAND = ?, KITCHEN_SINK = ?, VANITYS = ?, SPECIAL_PARTS = ?, DESCRIPTION = ?, TEMPLATES = ?, IMAGES = ?, CONTRACT = ?,\
                    METHOD_PAY_FIRST = ?, TOTAL = ?, PAYED = ?, REST = ?, METHOD_PAY_SECOND = ? WHERE ID = ?"
            if self.cursor.execute(self.query, params):
                his_path = os.path.join(os.getcwd(), "resources", "app", "docs", "jobs")
                if not os.path.exists(his_path):
                    os.mkdir(his_path)
                his_path = os.path.join(his_path,  data[19].strip())
                if not os.path.exists(his_path):
                    os.mkdir(his_path)
                his_path = os.path.join(his_path, "Job_" + data[2])
                if not os.path.exists(his_path):
                    os.mkdir(his_path)
                if data[15].strip() == "true":
                    params.pop()
                    params.append(data[19]) # client name for contract [21]
                    createContract(his_path, params, data[20].strip(), data[21].strip(), data[22].strip(), data[2])
                for file in filelist:
                    name = file.split("\\")
                    copyfile(file, his_path + "\\" + name[len(name)-1])
                self.conection.commit()
                return "New Job Registered Succesfully"
            else:
                raise Exception("Something was wrong while saving new job")
        except Exception as e:
            return e.args
        

    def getJobById(self, id):
        try:
            self.query = "SELECT * FROM jobs WHERE ID = ?"
            if self.cursor.execute(self.query, id):
                job = list(self.cursor.fetchone())
                if self.cursor.execute("SELECT FULLNAME, EMAIL, PHONE FROM clients WHERE ID=?", [job[1]]):
                    job[1] = self.cursor.fetchone()
                return job
            else:
                raise Exception("Something was wrong with database")
        except Exception as e:
            return e.args
    
    def newInstallDay(self, day, id_job):
        try:
            self.query = "UPDATE jobs SET INSTALATION_DAY = ? WHERE ID = ?"
            res = self.cursor.execute(self.query, [day.strip(), id_job])
            if res:
                self.conection.commit()
                return "Job Updated Succesfully"
            else:
                raise Exception("Something was wrong while updating job")
        except Exception as e:
            return e.args
    
    def addPlans(self, plans, id_job, name_client):
        has_plan = "false"
        fileList = []
        try:
            self.query = "UPDATE jobs SET IMAGES = ? WHERE ID = ?"
            if plans != "false":
                fileList = plans.split(" - ")
                fileList.pop()
                has_plan = "true"
            res = self.cursor.execute(self.query, [has_plan.strip(), id_job])
            if res:
                his_path = os.path.join(os.getcwd(),"resources", "app", "docs", "jobs")
                if not os.path.exists(his_path):
                    os.mkdir(his_path)
                his_path = os.path.join(his_path, name_client)
                if not os.path.exists(his_path):
                    os.mkdir(his_path)
                his_path = os.path.join(his_path, "Job_" + id_job)
                if not os.path.exists(his_path):
                    os.mkdir(his_path)
                for file in fileList:
                    name = file.split("\\")
                    copyfile(file, his_path + "\\" + name[len(name)-1])
                self.conection.commit()
                return "Job Updated succesfully"
            else:
                raise Exception("Something was wrong while updating the job")
        except Exception as e:
            return e.args

    def newSupply(self, brand, model, supplier, type, descr, material, color, price, files, size):
        dir = ""
        has_files = False
        try:
            print(files)
            if len(files.strip()) > 0:
                has_files = True
                dir = os.path.join(os.getcwd(), "resources", "app", "docs", "sinks")
                if not os.path.exists(dir):
                    os.mkdir(dir)
                dir = os.path.join(dir, type.replace(" ", "_"))
                if not os.path.exists(dir):
                    os.mkdir(dir)    
                dir = os.path.join(dir, brand.replace(" ", "_"))
                if not os.path.exists(dir):
                    os.mkdir(dir)
                dir = os.path.join(dir, model.replace(" ", "_"))
                if not os.path.exists(dir):
                    os.mkdir(dir)
                files = files.split(" - ")
                files.pop()
                for f in files:
                    name = f.split("\\")
                    if os.path.exists(dir): 
                        copyfile(f, dir + "\\" + name[len(name)-1])
                    else:
                        raise Exception(dir + " not exists")
            self.query = "INSERT INTO supplies (BRAND, MODEL, SUPPLIER, TYPE, MATERIAL, COLOR, SIZE, PRICE, IMAGES) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);"
            res = self.cursor.execute(self.query, [brand.strip(), model.strip(), supplier.strip(), type.strip(), material.strip(), color.strip(), size.strip(), price.strip(), has_files])
            if res:
                self.conection.commit()
                return "Supply registered Succesfully"
            else:
                raise Exception("something was wrong while registering the new supply")
        except Exception as e:
            return e.args

    def getAllSupplies(self):
        allSuplies = ""
        try:
            self.query = "SELECT ID, BRAND, MODEL, SUPPLIER, TYPE, PRICE, MATERIAL, COLOR, SIZE, IMAGES FROM supplies"
            res = self.cursor.execute(self.query)
            if res:
                res = res.fetchall()
                if res:
                    for sink in res:
                        sink = list(sink)
                        sink[3] = str(self.cursor.execute("SELECT NAME FROM suppliers WHERE ID = ?", [sink[3]]).fetchone()).replace("'", "").replace("(", "").replace(",", "").replace(")", "")
                        allSuplies += str(tuple(sink)) + "|"
                    return allSuplies
                else:
                    return "No Sinks are registered"
            else:
                raise Exception("Something was wrong while giving the sinks")
        except Exception as e:
            return e.args
        

def selector():
    res = ""
    bd = None
    try:
        bd = BBDD()
        fun = sys.argv[1]
        if fun == "control":
            res = bd.control()
        elif fun == "getUsers":
            res = bd.getAllUsers()
        elif fun == "newUser":
            res = bd.newUser()
        elif fun == "confirmUser":
            res = bd.confirmUser()
        elif fun == "getAllSuppliers":
            res = bd.getAllSuppliers()
        elif fun == "newSupplier":
            res = bd.newSupplier(sys.argv[2], sys.argv[3], sys.argv[4])
        elif fun == "deleteSupplier":
            res = bd.deleteSupplier(sys.argv[2])
        elif fun == "updateSupplier":
            res = bd.updateSupplier(sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5])
        elif fun == "getAllClients":
            res = bd.getAllClients()
        elif fun == "newClient":
            res = bd.newClient(sys.argv[2], sys.argv[3], sys.argv[4])
        elif fun == "searchClientByPhone":
            res = bd.getClientByPhone(sys.argv[2])
        elif fun == "deleteClient":
            res = bd.deleteClient(sys.argv[2])
        elif fun == "updateClient":
            res = bd.updateClient(sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5])
        elif fun == "getAllJobs":
            res = bd.getAllJobs()
        elif fun == "newJob":
            res = bd.newJob(sys.argv)
        elif fun == "getJobById":
            res = bd.getJobById(sys.argv[2])
        elif fun == "newInstallDay":
            res = bd.newInstallDay(sys.argv[2], sys.argv[3])
        elif fun == "addPlans":
            res = bd.addPlans(sys.argv[2], sys.argv[3], sys.argv[4])
        elif fun == "updateJob":
            res = bd.updateJob(sys.argv)
        elif fun == "getAllSupplies":
            res = bd.getAllSupplies()
        elif fun == "newSupply":
            res = bd.newSupply(sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5], sys.argv[6], sys.argv[7], sys.argv[8], sys.argv[9], sys.argv[10], sys.argv[11])
        elif fun == "asd":
            res = "asd"
        print(res)

    except Exception as e:
        print(e.args)
    except Error as err:
        print(err.args)

    finally:
        bd.conection.close()
        sys.stdout.flush()

if __name__ == "__main__":
    selector()