/* Shared app logic for all pages.
   - Validations: phone (10 digits), email (basic), days since donation >= 50 for donor eligibility
   - Hospital license uniqueness enforced in registration (stored in localStorage)
   - Data stored under keys
*/
const LS = {
  donors: 'bd_donors',
  hospitals: 'bd_hospitals',
  admin: 'bd_admin',
  requests: 'bd_requests',
  current: 'bd_current'
};

function load(key){ try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch(e){ return []; } }
function save(key, data){ localStorage.setItem(key, JSON.stringify(data)); }

/* Seed admin */
(function seedAdmin(){
  if(!localStorage.getItem(LS.admin)){
    save(LS.admin, [{ name:'System Admin', email:'admin@system.com', password:'admin123' }]);
  }
})();

/* Validators */
function validPhone(s){ return /^[0-9]{10}$/.test(String(s).trim()); }
function validEmail(s){
  s = String(s||'').trim();
  if(!s) return false;
  const parts = s.split('@');
  if(parts.length !== 2) return false;
  if(parts[1].indexOf('.') === -1) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

/* UI helpers */
function showMsg(el, text, type='error'){
  if(!el) return;
  el.textContent = text;
  el.className = 'message ' + (type==='success' ? 'success' : 'error');
}

/* Update stats on home and elsewhere */
function updateStats(){
  const donors = load(LS.donors).length;
  const hosp = load(LS.hospitals).length;
  const req = load(LS.requests).length;
  const sDon = document.getElementById('stat-donors'); if(sDon) sDon.textContent = donors;
  const sHosp = document.getElementById('stat-hosp'); if(sHosp) sHosp.textContent = hosp;
  const sReq = document.getElementById('stat-req'); if(sReq) sReq.textContent = req;
  const aDon = document.getElementById('admin-stat-donors'); if(aDon) aDon.value = donors;
  const aHosp = document.getElementById('admin-stat-hosp'); if(aHosp) aHosp.value = hosp;
  const aReq = document.getElementById('admin-stat-req'); if(aReq) aReq.value = req;
}
updateStats();

/* Page-specific wiring */
document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.getAttribute('data-page');

  if(page === 'register') wireRegister();
  if(page === 'login') wireLogin();
  if(page === 'donor') wireDonor();
  if(page === 'hospital') wireHospital();
  if(page === 'admin') wireAdmin();
  if(page === 'home') updateStats();
});

/* ========== Register page ========== */
function wireRegister(){
  const portalSel = document.getElementById('reg-portal');
  const donorFields = document.getElementById('donor-fields');
  const hospFields = document.getElementById('hospital-fields');
  const adminFields = document.getElementById('admin-fields');
  const msg = document.getElementById('reg-msg');

  function update(){
    const p = portalSel.value;
    donorFields.classList.toggle('hidden', p!=='donor');
    hospFields.classList.toggle('hidden', p!=='hospital');
    adminFields.classList.toggle('hidden', p!=='admin');
    msg.textContent = '';
    msg.className = 'message';
  }
  portalSel.addEventListener('change', update);
  update();

  document.getElementById('register-btn').addEventListener('click', () => {
    msg.textContent = '';
    const p = portalSel.value;

    if(p === 'donor'){
      const name = document.getElementById('donor-name').value.trim();
      const phone = document.getElementById('donor-phone').value.trim();
      const email = document.getElementById('donor-email').value.trim();
      const age = parseInt(document.getElementById('donor-age').value || '0',10);
      const blood = document.getElementById('donor-blood').value;
      const days = parseInt(document.getElementById('donor-days').value || '-1',10);
      const disease = document.getElementById('donor-disease').value.trim();

      if(!name) return showMsg(msg, 'Please enter name.');
      if(!validPhone(phone)) return showMsg(msg, 'Phone must be exactly 10 digits.');
      if(!validEmail(email)) return showMsg(msg, 'Please enter a valid email.');
      if(!age || age < 16) return showMsg(msg, 'Age must be at least 16.');
      if(!blood) return showMsg(msg, 'Select blood type.');
      if(isNaN(days) || days < 0) return showMsg(msg, 'Enter days since last donation.');
      if(days < 50) return showMsg(msg, 'Not eligible: minimum 50 days since last donation.');

      const donors = load(LS.donors);
      if(donors.some(d => d.email.toLowerCase() === email.toLowerCase())) return showMsg(msg, 'Donor with this email already exists.');
      donors.push({ name, phone, email, age, blood, days, disease, created: Date.now() });
      save(LS.donors, donors);
      showMsg(msg, 'Donor registered successfully. Please login.', 'success');
      updateStats();
      // clear form
      ['donor-name','donor-phone','donor-email','donor-age','donor-blood','donor-days','donor-disease'].forEach(id=>document.getElementById(id).value='');
    }

    if(p === 'hospital'){
      const name = document.getElementById('h-name').value.trim();
      const phone = document.getElementById('h-phone').value.trim();
      const email = document.getElementById('h-email').value.trim();
      const license = document.getElementById('h-license').value.trim();
      const addr = document.getElementById('h-address').value.trim();

      if(!name) return showMsg(msg, 'Enter hospital name.');
      if(!validPhone(phone)) return showMsg(msg, 'Phone must be 10 digits.');
      if(!validEmail(email)) return showMsg(msg, 'Enter a valid email.');
      if(!license) return showMsg(msg, 'Enter license number.');

      const hospitals = load(LS.hospitals);
      if(hospitals.some(h => h.license.toLowerCase() === license.toLowerCase())) return showMsg(msg, 'License already registered (must be unique).');

      hospitals.push({ name, phone, email, license, addr, created:Date.now(), inventory: [] });
      save(LS.hospitals, hospitals);
      showMsg(msg, 'Hospital registered. For demo, use license as password to login.', 'success');
      updateStats();
      ['h-name','h-phone','h-email','h-license','h-address'].forEach(id=>document.getElementById(id).value='');
    }

    if(p === 'admin'){
      const name = document.getElementById('a-name').value.trim();
      const email = document.getElementById('a-email').value.trim();
      const pass = document.getElementById('a-pass').value.trim();
      if(!name) return showMsg(msg, 'Enter admin name.');
      if(!validEmail(email)) return showMsg(msg, 'Enter a valid email.');
      if(!pass || pass.length < 4) return showMsg(msg, 'Password at least 4 chars.');

      const admins = load(LS.admin);
      if(admins.some(a => a.email.toLowerCase() === email.toLowerCase())) return showMsg(msg, 'Admin with this email exists.');
      admins.push({ name, email, password: pass });
      save(LS.admin, admins);
      showMsg(msg, 'Admin created. Please login.', 'success');
      ['a-name','a-email','a-pass'].forEach(id=>document.getElementById(id).value='');
    }
  });
}

/* ========== Login page ========== */
function wireLogin(){
  const emailEl = document.getElementById('login-email');
  const passEl  = document.getElementById('login-password');
  const portalSel = document.getElementById('login-portal');
  const msg = document.getElementById('login-msg');

  document.getElementById('login-btn').addEventListener('click', () => {
    msg.textContent = '';
    const email = emailEl.value.trim();
    const pass = passEl.value.trim();
    const portal = portalSel.value;

    if(!validEmail(email) && portal !== 'hospital') return showMsg(msg, 'Enter a valid email.');
    if(!pass) return showMsg(msg, 'Enter password.');

    if(portal === 'donor'){
      const donors = load(LS.donors);
      const user = donors.find(d => d.email.toLowerCase() === email.toLowerCase());
      if(!user) return showMsg(msg, 'Donor not found. Register first.');
      localStorage.setItem(LS.current, JSON.stringify({ portal:'donor', email:user.email }));
      window.location.href = 'donor.html';
    } else if(portal === 'hospital'){
      // hospital may login with email OR license; for demo password must match license
      const hospitals = load(LS.hospitals);
      const hosp = hospitals.find(h => h.email.toLowerCase() === email.toLowerCase() || h.license.toLowerCase() === email.toLowerCase());
      if(!hosp) return showMsg(msg, 'Hospital not found. Use email or license to login.');
      if(pass !== hosp.license) return showMsg(msg, 'For demo: hospital password must equal license number.');
      localStorage.setItem(LS.current, JSON.stringify({ portal:'hospital', email:hosp.email, license:hosp.license }));
      window.location.href = 'hospital.html';
    } else if(portal === 'admin'){
      const admins = load(LS.admin);
      const admin = admins.find(a => a.email.toLowerCase() === email.toLowerCase() && a.password === pass);
      if(!admin) return showMsg(msg, 'Invalid admin credentials.');
      localStorage.setItem(LS.current, JSON.stringify({ portal:'admin', email:admin.email }));
      window.location.href = 'admin.html';
    }
  });
}

/* ========== Donor page ========== */
function wireDonor(){
  const cur = JSON.parse(localStorage.getItem(LS.current) || 'null');
  const welcome = document.getElementById('donor-welcome');
  const donateMsg = document.getElementById('donate-msg');

  if(!cur || cur.portal !== 'donor'){
    // redirect to login if not logged in
    window.location.href = 'login.html';
    return;
  }
  const donors = load(LS.donors);
  const me = donors.find(d => d.email === cur.email);
  if(me) welcome.textContent = `Hello ${me.name} — Blood: ${me.blood} • Last: ${me.days} days ago`;

  document.getElementById('donor-logout').addEventListener('click', () => {
    localStorage.removeItem(LS.current);
    window.location.href = 'index.html';
  });

  document.getElementById('donate-btn').addEventListener('click', () => {
    donateMsg.textContent = '';
    const qty = parseInt(document.getElementById('donation-qty').value || '0',10);
    const date = document.getElementById('donation-date').value;
    if(!qty || qty < 100) return showMsg(donateMsg, 'Quantity must be ≥100 ml.');
    if(!date) return showMsg(donateMsg, 'Choose donation date.');
    if(!me) return showMsg(donateMsg, 'Donor not found.');

    me.lastDonation = date;
    me.days = Math.max(0, Math.floor((Date.now() - new Date(date)) / (1000*60*60*24)));
    save(LS.donors, donors);
    showMsg(donateMsg, 'Donation recorded. Thank you!', 'success');
    updateStats();
  });

  // show open requests for donor to view
  const reqs = load(LS.requests);
  const list = document.getElementById('requests-list');
  list.innerHTML = reqs.length ? reqs.map(r=>`<div>${r.id} • ${r.hospital} • ${r.blood} • ${r.qty} ml</div>`).join('') : 'No requests yet.';
}

/* ========== Hospital page ========== */
function wireHospital(){
  const cur = JSON.parse(localStorage.getItem(LS.current) || 'null');
  if(!cur || cur.portal !== 'hospital') { window.location.href = 'login.html'; return; }

  const hospitals = load(LS.hospitals);
  const hosp = hospitals.find(h => h.license === cur.license || h.email === cur.email);
  if(!hosp) { window.location.href = 'login.html'; return; }

  document.getElementById('hospital-welcome').textContent = `${hosp.name} • ${hosp.license}`;
  document.getElementById('hospital-logout').addEventListener('click', () => {
    localStorage.removeItem(LS.current); window.location.href = 'index.html';
  });

  function renderInv(){
    const invList = document.getElementById('inv-list');
    if(!hosp.inventory || !hosp.inventory.length) return invList.textContent = 'No inventory yet.';
    invList.innerHTML = hosp.inventory.map(i=>`<div class="row between"><div>${i.blood}</div><div>${i.qty} ml</div></div>`).join('');
  }
  renderInv();

  document.getElementById('add-inv').addEventListener('click', () => {
    const bg = document.getElementById('inv-blood').value;
    const qty = parseInt(document.getElementById('inv-qty').value || '0',10);
    if(!qty || qty < 50) return showMsg(document.getElementById('inv-list'), 'Qty must be ≥50.');
    hosp.inventory = hosp.inventory || [];
    const e = hosp.inventory.find(x => x.blood === bg);
    if(e) e.qty += qty;
    else hosp.inventory.push({ blood: bg, qty });
    // save hospitals array
    const updated = hospitals.map(h => h.license === hosp.license ? hosp : h);
    save(LS.hospitals, updated);
    renderInv();
    updateStats();
  });

  document.getElementById('create-req').addEventListener('click', () => {
    const blood = document.getElementById('req-blood').value;
    const qty = parseInt(document.getElementById('req-qty').value || '0',10);
    if(!qty || qty < 50) return showMsg(document.getElementById('req-msg'), 'Qty must be ≥50.');
    const requests = load(LS.requests);
    const id = 'REQ-' + Date.now();
    requests.push({ id, hospital: hosp.name, license: hosp.license, blood, qty, status:'open', created: Date.now() });
    save(LS.requests, requests);
    showMsg(document.getElementById('req-msg'), 'Request created.', 'success');
    updateStats();
  });
}

/* ========== Admin page ========== */
function wireAdmin(){
  const cur = JSON.parse(localStorage.getItem(LS.current) || 'null');
  if(!cur || cur.portal !== 'admin'){ window.location.href = 'login.html'; return; }
  const admins = load(LS.admin);
  const admin = admins.find(a => a.email === cur.email);
  if(!admin){ window.location.href = 'login.html'; return; }

  document.getElementById('admin-logout').addEventListener('click', () => {
    localStorage.removeItem(LS.current); window.location.href = 'index.html';
  });

  function renderHospitals(){
    const list = load(LS.hospitals);
    const el = document.getElementById('admin-hosp-list');
    if(!list.length){ el.textContent='No hospitals registered.'; return; }
    el.innerHTML = list.map(h => `<div class="row between"><div><strong>${h.name}</strong> <span class="muted">(${h.license})</span><div class="tiny muted">${h.email} • ${h.phone}</div></div><div><button class="btn ghost view-h" data-lic="${h.license}">View</button></div></div>`).join('');
    el.querySelectorAll('.view-h').forEach(b => b.addEventListener('click', (e) => {
      const lic = e.currentTarget.dataset.lic;
      const hosp = load(LS.hospitals).find(x => x.license === lic);
      if(!hosp) return alert('Hospital not found');
      alert(`Hospital: ${hosp.name}\nLicense: ${hosp.license}\nEmail: ${hosp.email}\nPhone: ${hosp.phone}\nAddress: ${hosp.addr || 'N/A'}`);
    }));
  }
  renderHospitals();
  updateStats();
}
