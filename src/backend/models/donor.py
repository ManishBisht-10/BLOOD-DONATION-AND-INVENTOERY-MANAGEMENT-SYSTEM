from config import get_db_connection

class Donor:
    def __init__(self):
        self.conn = get_db_connection()
        self.cursor = self.conn.cursor(dictionary=True)

    def add_donor(self, name, age, gender, blood_group, contact):
        sql = "INSERT INTO donors (Name, Age, Gender, BloodGroup, ContactInfo) VALUES (%s, %s, %s, %s, %s)"
        self.cursor.execute(sql, (name, age, gender, blood_group, contact))
        self.conn.commit()

    def get_all_donors(self):
        self.cursor.execute("SELECT * FROM donors")
        return self.cursor.fetchall()
