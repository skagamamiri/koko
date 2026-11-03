/**
 * SISTEM PENGURUSAN KOKURIKULUM SEKOLAH (KOKO)
 * Backend Google Apps Script — data disimpan dalam Google Sheet.
 *
 * CARA PASANG:
 * 1. Buka Google Sheet baharu > Extensions > Apps Script.
 * 2. Tampal kod ini dalam Code.gs.
 * 3. Tambah fail HTML bernama "index" dan tampal kandungan index.html.
 * 4. Deploy > New deployment > Web app
 *      Execute as: Me   |   Who has access: Anyone (atau Anyone within domain)
 * 5. Buka URL web app. Log masuk: Pentadbir Sistem, katalaluan asal "admin123".
 *
 * Setiap koleksi disimpan dalam tab sendiri (murid, guru, unit, ...).
 * Lajur A = id, lajur B dst = data JSON (dipecah jika melebihi had sel).
 */

var SPREADSHEET_ID = ''; // Kosongkan jika skrip terikat (bound) pada Sheet. Jika tidak, isi ID Sheet.
var COLLECTIONS = ['murid', 'guru', 'unit', 'perjumpaan', 'program', 'jawatan', 'ekstra', 'pencapaian'];
var CHUNK = 45000;
var SESSION_HOURS = 6;

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Pengurusan Kokurikulum Sekolah')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/* ---------------- util sheet ---------------- */
function ss_() {
  return SPREADSHEET_ID ? SpreadsheetApp.openById(SPREADSHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
}
function sheet_(name) {
  var ss = ss_();
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.getRange(1, 1, 1, 2).setValues([['id', 'data']]).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}
function readAll_(name) {
  var sh = sheet_(name);
  var last = sh.getLastRow();
  if (last < 2) return [];
  var width = Math.max(2, sh.getLastColumn());
  var vals = sh.getRange(2, 1, last - 1, width).getValues();
  var out = [];
  for (var i = 0; i < vals.length; i++) {
    if (!vals[i][0]) continue;
    var json = vals[i].slice(1).join('');
    try { out.push(JSON.parse(json)); } catch (e) {}
  }
  return out;
}
function chunks_(json) {
  var parts = [];
  for (var i = 0; i < json.length; i += CHUNK) parts.push(json.substring(i, i + CHUNK));
  if (!parts.length) parts.push('');
  return parts;
}
function findRow_(sh, id) {
  var last = sh.getLastRow();
  if (last < 2) return -1;
  var f = sh.getRange(2, 1, last - 1, 1).createTextFinder(String(id)).matchEntireCell(true).findNext();
  return f ? f.getRow() : -1;
}
function writeRow_(sh, id, json) {
  var parts = chunks_(json);
  var row = findRow_(sh, id);
  if (row < 0) row = sh.getLastRow() + 1;
  var width = Math.max(sh.getLastColumn(), parts.length + 1);
  var line = [String(id)].concat(parts);
  while (line.length < width) line.push('');
  sh.getRange(row, 1, 1, width).setValues([line]);
}
function withLock_(fn) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try { return fn(); } finally { lock.releaseLock(); }
}
function checkCol_(col) {
  if (COLLECTIONS.indexOf(col) < 0) throw new Error('Koleksi tidak sah: ' + col);
}

/* ---------------- tetapan ---------------- */
function getSettings_() {
  var list = readAll_('settings');
  var s = list.length ? list[0] : {};
  if (!s.adminPassword) s.adminPassword = 'admin123';
  return s;
}
function saveSettings_(s) {
  s.id = 'settings';
  writeRow_(sheet_('settings'), 'settings', JSON.stringify(s));
}

/* ---------------- sesi ---------------- */
function newToken_(info) {
  var t = Utilities.getUuid();
  CacheService.getScriptCache().put('tok_' + t, JSON.stringify(info), SESSION_HOURS * 3600);
  return t;
}
function auth_(token, needAdmin) {
  if (!token) throw new Error('Sila log masuk semula.');
  var raw = CacheService.getScriptCache().get('tok_' + token);
  if (!raw) throw new Error('Sesi tamat. Sila log masuk semula.');
  var info = JSON.parse(raw);
  if (needAdmin && info.role !== 'admin') throw new Error('Hanya pentadbir dibenarkan.');
  return info;
}

/* ---------------- API (dipanggil dari index.html) ---------------- */
function apiLoad() {
  var out = {};
  COLLECTIONS.forEach(function (c) { out[c] = readAll_(c); });
  var s = getSettings_();
  delete s.adminPassword; // tidak dihantar ke pelayar
  out.settings = s;
  out._empty = COLLECTIONS.every(function (c) { return out[c].length === 0; });
  return JSON.stringify(out);
}

function apiLogin(who, pass) {
  pass = String(pass || '').trim();
  if (who === 'admin') {
    if (pass !== String(getSettings_().adminPassword)) return JSON.stringify({ ok: false, msg: 'Katalaluan pentadbir salah.' });
    return JSON.stringify({ ok: true, role: 'admin', nama: 'Pentadbir Sistem', id: 'admin', token: newToken_({ role: 'admin', id: 'admin' }) });
  }
  var g = readAll_('guru').filter(function (x) { return x.id === who; })[0];
  if (!g) return JSON.stringify({ ok: false, msg: 'Guru tidak dijumpai.' });
  var norm = function (v) { return String(v || '').replace(/\D/g, ''); };
  if (!norm(g.ic) || norm(g.ic) !== norm(pass)) return JSON.stringify({ ok: false, msg: 'No. KP tidak sepadan.' });
  return JSON.stringify({ ok: true, role: 'guru', nama: g.nama, id: g.id, token: newToken_({ role: 'guru', id: g.id }) });
}

function apiSave(token, col, json) {
  auth_(token);
  checkCol_(col);
  var rec = JSON.parse(json);
  if (!rec.id) throw new Error('Rekod tiada id');
  withLock_(function () { writeRow_(sheet_(col), rec.id, json); });
  return true;
}

function apiSaveMany(token, col, json) {
  auth_(token);
  checkCol_(col);
  var recs = JSON.parse(json);
  withLock_(function () {
    var sh = sheet_(col);
    recs.forEach(function (r) { writeRow_(sh, r.id, JSON.stringify(r)); });
  });
  return true;
}

function apiDelete(token, col, id) {
  auth_(token);
  checkCol_(col);
  withLock_(function () {
    var sh = sheet_(col);
    var row = findRow_(sh, id);
    if (row > 0) sh.deleteRow(row);
  });
  return true;
}

function apiSaveSettings(token, json) {
  auth_(token, true);
  var s = JSON.parse(json);
  withLock_(function () {
    var cur = getSettings_();
    if (!s.adminPassword) s.adminPassword = cur.adminPassword; // kekalkan jika kosong
    saveSettings_(s);
  });
  return true;
}

/** Ganti SEMUA data (restore sandaran / data demo / kosongkan). */
function apiReplaceAll(token, json) {
  auth_(token, true);
  var d = JSON.parse(json);
  withLock_(function () {
    COLLECTIONS.forEach(function (c) {
      var sh = sheet_(c);
      if (sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, Math.max(2, sh.getLastColumn())).clearContent();
      var rows = (d[c] || []).map(function (r) {
        return [String(r.id)].concat(chunks_(JSON.stringify(r)));
      });
      if (rows.length) {
        var w = rows.reduce(function (m, r) { return Math.max(m, r.length); }, 2);
        rows = rows.map(function (r) { while (r.length < w) r.push(''); return r; });
        sh.getRange(2, 1, rows.length, w).setValues(rows);
      }
    });
    if (d.settings) {
      var cur = getSettings_();
      if (!d.settings.adminPassword) d.settings.adminPassword = cur.adminPassword;
      saveSettings_(d.settings);
    }
  });
  return true;
}
