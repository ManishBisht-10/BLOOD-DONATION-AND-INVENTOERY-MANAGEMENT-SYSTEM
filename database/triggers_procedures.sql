USE blood_donation_system;

-- =========================================
-- TRIGGER 1: Update Donor Last Donation Date
-- =========================================
DELIMITER //
CREATE TRIGGER update_donor_last_donation
AFTER INSERT ON Donation
FOR EACH ROW
BEGIN
  UPDATE Donor
  SET last_donation_date = NEW.donation_date
  WHERE donor_id = NEW.donor_id;
END //
DELIMITER ;

-- =========================================
-- TRIGGER 2: Add Approved Donation to Inventory
-- =========================================
DELIMITER //
CREATE TRIGGER after_donation_approval
AFTER UPDATE ON Donation
FOR EACH ROW
BEGIN
  DECLARE donor_bg VARCHAR(5);
  IF NEW.status = 'approved' THEN
    SELECT blood_group INTO donor_bg FROM Donor WHERE donor_id = NEW.donor_id;

    IF EXISTS (SELECT * FROM Inventory WHERE hospital_id = NEW.hospital_id AND blood_group = donor_bg) THEN
      UPDATE Inventory
      SET quantity = quantity + NEW.quantity
      WHERE hospital_id = NEW.hospital_id AND blood_group = donor_bg;
    ELSE
      INSERT INTO Inventory (hospital_id, blood_group, quantity, expiry_date)
      VALUES (NEW.hospital_id, donor_bg, NEW.quantity, DATE_ADD(NEW.donation_date, INTERVAL 42 DAY));
    END IF;
  END IF;
END //
DELIMITER ;

-- =========================================
-- TRIGGER 3: Deduct Stock After Request Fulfilled
-- =========================================
DELIMITER //
CREATE TRIGGER after_request_fulfilled
AFTER UPDATE ON Requests
FOR EACH ROW
BEGIN
  IF NEW.status = 'fulfilled' THEN
    UPDATE Inventory
    SET quantity = quantity - NEW.quantity
    WHERE hospital_id = NEW.fulfilled_by AND blood_group = NEW.blood_group;
  END IF;
END //
DELIMITER ;
 

-- =========================================
-- STORED PROCEDURE: Check Blood Availability
-- =========================================
DELIMITER //
CREATE PROCEDURE GetAvailableBlood(IN h_id INT)
BEGIN
  SELECT blood_group, quantity, expiry_date
  FROM Inventory
  WHERE hospital_id = h_id
  ORDER BY blood_group;
END //
DELIMITER ;

-- =========================================
-- STORED PROCEDURE: Approve Pending Requests
-- =========================================
DELIMITER //
CREATE PROCEDURE ApproveRequest(IN req_id INT)
BEGIN
  UPDATE Requests SET status = 'approved' WHERE request_id = req_id;
END //
DELIMITER ;
