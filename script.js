/* =========================================================
   ALOR DISHA - Yogasana Competition Form
   Frontend (Vanilla JS)
   ========================================================= */

// ====== CONFIGURATION ======
// Replace with your Google Apps Script Web App URL after deployment.
const WEB_APP_URL = 'YOUR_WEB_APP_URL_HERE';

// ====== STATE ======
let guardianSeq = 0;

// ====== INIT ======
document.addEventListener('DOMContentLoaded', () => {
  addGuardian();
});

// =========================================================
// GUARDIAN SECTIONS
// =========================================================
function addGuardian(data) {
  guardianSeq++;
  const seq = guardianSeq;
  const container = document.getElementById('guardians-container');
  const div = document.createElement('div');
  div.className = 'guardian-section';
  div.id = 'gsec-' + seq;

  const removeBtn = guardianSeq > 1
    ? '<button type="button" class="btn-remove" onclick="removeGuardian(' + seq + ')">Remove</button>'
    : '';

  div.innerHTML =
    '<div class="guardian-header">' +
      '<h4>Related Person ' + seq + '</h4>' + removeBtn +
    '</div>' +
    '<div class="grid">' +
      field('Relationship <span class="req">*</span>',
        '<select class="g-relationship">' +
          '<option value="">Select</option>' +
          '<option>Father</option>' +
          '<option>Mother</option>' +
          '<option>Guardian</option>' +
          '<option>Brother</option>' +
          '<option>Sister</option>' +
          '<option>Relative</option>' +
          '<option>Other</option>' +
        '</select>') +
      field('Name <span class="req">*</span>',
        '<input type="text" class="g-name" autocomplete="off">') +
      field('Date of Birth',
        '<input type="date" class="g-dob">') +
      field('Aadhaar Number',
        '<input type="text" class="g-aadhaar" maxlength="12" inputmode="numeric" placeholder="12 digits" autocomplete="off">') +
      field('Father / Mother / Guardian Name',
        '<input type="text" class="g-parent-name" autocomplete="off">') +
      field('Mobile Number',
        '<input type="text" class="g-mobile" maxlength="10" inputmode="numeric" placeholder="10 digits" autocomplete="off">') +
      field('WhatsApp Number',
        '<input type="text" class="g-whatsapp" maxlength="10" inputmode="numeric" placeholder="10 digits" autocomplete="off">') +
      '<div class="field full">' +
        '<label>Full Address with PIN Code</label>' +
        '<textarea class="g-address" rows="2" placeholder="House / Street / Area / City / State"></textarea>' +
      '</div>' +
    '</div>';

  container.appendChild(div);

  if (data) fillGuardianSection(div, data);
}

function field(labelHtml, inputHtml) {
  return '<div class="field"><label>' + labelHtml + '</label>' + inputHtml + '</div>';
}

function removeGuardian(seq) {
  const el = document.getElementById('gsec-' + seq);
  if (el) el.remove();
}

function fillGuardianSection(sec, g) {
  sec.querySelector('.g-relationship').value = g.relationship || '';
  sec.querySelector('.g-name').value = g.name || '';
  sec.querySelector('.g-dob').value = inputDate(g.dob);
  sec.querySelector('.g-aadhaar').value = g.aadhaar || '';
  sec.querySelector('.g-parent-name').value = g.parentName || '';
  sec.querySelector('.g-mobile').value = g.mobile || '';
  sec.querySelector('.g-whatsapp').value = g.whatsapp || '';
  sec.querySelector('.g-address').value = g.address || '';
}

// =========================================================
// COLLECT & VALIDATE
// =========================================================
function collectCandidate() {
  return {
    name: val('c-name'),
    dob: val('c-dob'),
    aadhaar: val('c-aadhaar').replace(/\D/g, ''),
    mobile: val('c-mobile').replace(/\D/g, ''),
    whatsapp: val('c-whatsapp').replace(/\D/g, ''),
    address: val('c-address')
  };
}

function collectGuardians() {
  const list = [];
  document.querySelectorAll('.guardian-section').forEach(sec => {
    const g = {
      relationship: sec.querySelector('.g-relationship').value,
      name: sec.querySelector('.g-name').value,
      dob: sec.querySelector('.g-dob').value,
      aadhaar: sec.querySelector('.g-aadhaar').value.replace(/\D/g, ''),
      parentName: sec.querySelector('.g-parent-name').value,
      mobile: sec.querySelector('.g-mobile').value.replace(/\D/g, ''),
      whatsapp: sec.querySelector('.g-whatsapp').value.replace(/\D/g, ''),
      address: sec.querySelector('.g-address').value
    };
    // Only include if any field is filled
    const any = Object.values(g).some(v => v && String(v).trim() !== '');
    if (any) list.push(g);
  });
  return list;
}

function validate(c, guardians) {
  const errs = [];

  // Candidate required
  if (!c.name) errs.push('Candidate name is required.');
  if (!c.dob) errs.push('Candidate date of birth is required.');
  if (!c.aadhaar) errs.push('Candidate Aadhaar number is required.');
  else if (!/^\d{12}$/.test(c.aadhaar)) errs.push('Candidate Aadhaar must be exactly 12 digits.');

  if (c.mobile && !/^\d{10}$/.test(c.mobile)) errs.push('Candidate mobile number must be exactly 10 digits.');
  if (c.whatsapp && !/^\d{10}$/.test(c.whatsapp)) errs.push('Candidate WhatsApp number must be exactly 10 digits.');
  if (c.dob && isNaN(new Date(c.dob).getTime())) errs.push('Candidate date of birth is not a valid date.');

  // Guardians
  guardians.forEach((g, i) => {
    const lbl = 'Related Person ' + (i + 1);
    if (!g.relationship) errs.push(lbl + ': relationship is required.');
    if (!g.name) errs.push(lbl + ': name is required.');
    if (g.aadhaar && !/^\d{12}$/.test(g.aadhaar)) errs.push(lbl + ': Aadhaar must be exactly 12 digits.');
    if (g.mobile && !/^\d{10}$/.test(g.mobile)) errs.push(lbl + ': mobile must be exactly 10 digits.');
    if (g.whatsapp && !/^\d{10}$/.test(g.whatsapp)) errs.push(lbl + ': WhatsApp must be exactly 10 digits.');
    if (g.dob && isNaN(new Date(g.dob).getTime())) errs.push(lbl + ': date of birth is not valid.');
  });

  return errs;
}

// =========================================================
// SUBMIT
// =========================================================
async function submitForm(e) {
  e.preventDefault();
  hideMessage();

  if (WEB_APP_URL === 'YOUR_WEB_APP_URL_HERE') {
    showMessage('WEB_APP_URL is not configured yet. Open script.js and paste your Google Apps Script Web App URL.', 'error');
    return;
  }

  const c = collectCandidate();
  const guardians = collectGuardians();
  const errs = validate(c, guardians);

  if (errs.length) {
    showMessage(errs.join('<br>'), 'error');
    return;
  }

  showLoading();
  try {
    const res = await apiPost({
      action: 'createCandidate',
      candidate: c,
      guardians: guardians
    });
    hideLoading();

    if (res.ok) {
      showSuccess(res.candidateId, res.serialNumber);
      resetFormState();
    } else {
      showMessage(res.error || 'Something went wrong.', 'error');
    }
  } catch (err) {
    hideLoading();
    showMessage('Network or server error: ' + err.message, 'error');
  }
}

function showSuccess(cid, serial) {
  document.getElementById('register-section').classList.add('hidden');
  document.getElementById('success-title').textContent = 'Registration Successful';
  document.getElementById('success-cid').textContent = cid;
  document.getElementById('success-serial').textContent = serial;
  document.getElementById('success-panel').classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// =========================================================
// RESET
// =========================================================
function resetForm() {
  resetFormState();
  document.getElementById('success-panel').classList.add('hidden');
  document.getElementById('register-section').classList.remove('hidden');
}

function resetFormState() {
  document.getElementById('candidate-form').reset();
  document.getElementById('guardians-container').innerHTML = '';
  guardianSeq = 0;
  addGuardian();
  hideMessage();
}

// =========================================================
// API HELPERS
// =========================================================
async function apiPost(data) {
  const res = await fetch(WEB_APP_URL, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'text/plain;charset=utf-8' }
  });
  return res.json();
}

// =========================================================
// UI HELPERS
// =========================================================
function showLoading() { document.getElementById('loading').classList.remove('hidden'); }
function hideLoading() { document.getElementById('loading').classList.add('hidden'); }

function showMessage(html, type) {
  const el = document.getElementById('message');
  el.className = 'message ' + type;
  el.innerHTML = html;
  el.classList.remove('hidden');
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
function hideMessage() {
  document.getElementById('message').classList.add('hidden');
}

function val(id) {
  return (document.getElementById(id).value || '').trim();
}

function esc(s) {
  if (s === null || s === undefined) return '';
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// DD/MM/YYYY -> YYYY-MM-DD (for date input)
function inputDate(str) {
  if (!str) return '';
  const s = String(str).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) return m[3] + '-' + m[2].padStart(2, '0') + '-' + m[1].padStart(2, '0');
  return '';
}