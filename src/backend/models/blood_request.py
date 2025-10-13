from config import get_db_connection

class BloodRequest:
    def __init__(self):
        self.conn = get_db_connection()
        self.cursor = self.conn.cursor(dictionary=True)

    def create_request(self, hospital_name, blood_group, quantity, request_date):
        sql = "INSERT INTO blood_requests (HospitalName, BloodGroup, QuantityRequested, RequestDate, Status) VALUES (%s, %s, %s, %s, 'Pending')"
        self.cursor.execute(sql, (hospital_name, blood_group, quantity, request_date))
        self.conn.commit()

    def get_all_requests(self):
        self.cursor.execute("SELECT * FROM blood_requests")
        return self.cursor.fetchall()
