from config import get_db_connection

class BloodInventory:
    def __init__(self):
        self.conn = get_db_connection()
        self.cursor = self.conn.cursor(dictionary=True)

    def add_blood_unit(self, blood_group, quantity, donation_date, expiry_date):
        sql = "INSERT INTO blood_inventory (BloodGroup, Quantity, DonationDate, ExpiryDate) VALUES (%s, %s, %s, %s)"
        self.cursor.execute(sql, (blood_group, quantity, donation_date, expiry_date))
        self.conn.commit()

    def get_inventory(self):
        self.cursor.execute("SELECT * FROM blood_inventory")
        return self.cursor.fetchall()
