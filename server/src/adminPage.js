// Trang quản trị registry mini-app. Worker không đọc được file lúc chạy,
// nên HTML nằm luôn trong chuỗi này.
//
// Trang này KHÔNG chứa secret — người vận hành tự nhập ADMIN_TOKEN mỗi phiên.
// Token giữ trong sessionStorage: đóng tab là mất, đỡ hơn localStorage.
//
// Nguyên tắc: trang KHÔNG tự tính "thiết bị nào nhận bản nào". Câu đó chỉ có
// server trả lời, qua /registry/simulate và /registry — vì logic chọn phiên bản
// nằm ở registry.js. Cài lại một bản thứ hai ở đây là tự mua đường nói dối.

export const ADMIN_HTML = `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Registry mini-app</title>
<style>
:root{
  --bg:#F8F6F2; --card:#FFFFFF; --sunk:#FBFAF7; --text:#1A1815; --sub:#736E66;
  --border:#E8E3DB; --strong:#C4BAA9; --accent:#A8732B; --accent-bg:#F3E8D5;
  --accent-ink:#855819; --btn:#95661F;
  --danger:#a5342a; --danger-bg:#FBEAE8; --ok:#1a7a40; --ok-bg:#E6F2EA;
  --warn:#8a5a00; --warn-bg:#FBF0DC; --tag-draft:#665F55;
}
@media (prefers-color-scheme: dark){
  :root{
    --bg:#121212; --card:#1F1F1F; --sunk:#181818; --text:#F0EDE8; --sub:#A6A6A6;
    --border:#2A2A2A; --strong:#575047; --accent:#e0b877; --accent-bg:#34281A;
    --accent-ink:#e0b877; --btn:#e0b877;
    --danger:#e8776a; --danger-bg:#2E1A18; --ok:#4ade80; --ok-bg:#152A1E;
    --warn:#e0b877; --warn-bg:#2E2515; --tag-draft:#A6A6A6;
  }
}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--text);
  font:15px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;
  padding:24px 16px 80px}
.wrap{max-width:1040px;margin:0 auto}
h1{font-size:20px;margin:0 0 2px}
.lede{color:var(--sub);font-size:13px;margin:0 0 20px}
h2{font-size:14px;margin:0}
.card{background:var(--card);border:1px solid var(--border);border-radius:12px;
  padding:16px;margin-bottom:16px}
.row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.spread{justify-content:space-between}
label{font-size:12px;color:var(--sub);display:block;margin-bottom:3px}
input,select{font:inherit;font-size:13px;padding:7px 9px;border-radius:8px;
  border:1px solid var(--strong);background:var(--bg);color:var(--text);min-width:0}
input:focus,select:focus{outline:2px solid var(--accent);outline-offset:-1px}
button{font:inherit;font-size:13px;font-weight:600;padding:8px 14px;border-radius:8px;
  border:1px solid var(--strong);background:var(--card);color:var(--text);cursor:pointer}
button:hover:not(:disabled){border-color:var(--accent)}
button:disabled{opacity:.45;cursor:not-allowed}
button.primary{background:var(--btn);border-color:var(--btn);color:#fff}
@media (prefers-color-scheme: dark){button.primary{color:#1A1815}}
button.sm{font-size:12px;font-weight:500;padding:4px 9px;border-radius:6px}
button.link{border:0;background:none;color:var(--danger);padding:4px 6px;font-weight:400}
.app{border:1px solid var(--border);border-radius:10px;padding:14px;margin-bottom:12px}
.app-head{display:flex;gap:8px;align-items:center;margin-bottom:10px;flex-wrap:wrap}
.app-head input{flex:1 1 130px}
/* Bảng nhiều cột: cho RIÊNG nó cuộn ngang, không để cả trang trôi theo */
.tablewrap{overflow-x:auto;margin:0 -2px;padding:0 2px}
table{width:100%;border-collapse:collapse;font-size:13px;min-width:860px}
th{text-align:left;font-size:11px;letter-spacing:.06em;text-transform:uppercase;
  color:var(--sub);font-weight:500;padding:0 6px 6px 0;white-space:nowrap}
td{padding:3px 6px 3px 0;vertical-align:middle}
td input,td select{width:100%}
.w-ver{width:80px}.w-num{width:58px}.w-host{width:74px}
.ramp{display:flex;gap:2px}
.ramp button{padding:3px 6px;font-size:11px;font-weight:500;border-radius:5px;min-width:30px}
.pill{display:inline-block;font-size:11px;padding:2px 8px;border-radius:99px;
  background:var(--accent-bg);color:var(--accent-ink);font-weight:600}
.tag{display:inline-block;font-size:11px;padding:1px 7px;border-radius:99px;font-weight:600}
.tag.active{background:var(--ok-bg);color:var(--ok)}
.tag.paused{background:var(--warn-bg);color:var(--warn)}
.tag.draft{background:var(--border);color:var(--tag-draft)}
.dirty{font-size:12px;color:var(--warn);font-weight:600}
.dirty.hide{visibility:hidden}
.msg{font-size:13px;padding:9px 12px;border-radius:8px;margin-bottom:12px;display:none}
.msg.on{display:block}
.msg.err{background:var(--danger-bg);color:var(--danger)}
.msg.ok{background:var(--ok-bg);color:var(--ok)}
.note{font-size:12px;padding:8px 11px;border-radius:8px;margin-top:10px;
  background:var(--warn-bg);color:var(--warn)}
pre{background:var(--sunk);border:1px solid var(--border);border-radius:8px;
  padding:12px;font-size:12px;overflow:auto;margin:10px 0 0;max-height:340px}
.hint{font-size:12px;color:var(--sub);margin-top:8px}
.bars{margin-top:10px;display:grid;gap:6px}
.bar-row{display:grid;grid-template-columns:76px 1fr 74px;gap:8px;align-items:center;font-size:12px}
.bar{height:16px;background:var(--sunk);border:1px solid var(--border);
  border-radius:5px;overflow:hidden}
.bar i{display:block;height:100%;background:var(--accent)}
.bar.none i{background:var(--strong)}
.mono{font-variant-numeric:tabular-nums}
.log{font-size:12px;display:grid;gap:10px;margin-top:10px}
.log time{color:var(--sub);font-size:11px}
.log ul{margin:3px 0 0;padding-left:18px}
.gone{display:none}
</style>
</head>
<body>
<div class="wrap">
  <h1>Registry mini-app</h1>
  <p class="lede">Quản lý phiên bản mini-app và tỉ lệ phát hành.</p>

  <div id="msg" class="msg"></div>

  <!-- Đăng nhập -->
  <div class="card" id="auth">
    <div class="row">
      <div style="flex:1 1 240px">
        <label for="tok">ADMIN_TOKEN</label>
        <input id="tok" type="password" style="width:100%" placeholder="dán token" autocomplete="off">
      </div>
      <button class="primary" id="btn-login" style="align-self:flex-end">Kết nối</button>
    </div>
    <p class="hint">Token chỉ giữ trong tab này, đóng tab là mất.</p>
  </div>

  <div id="main" class="gone">
    <!-- Mini-app -->
    <div class="card">
      <div class="row spread" style="margin-bottom:12px">
        <div class="row" style="gap:10px">
          <h2>Mini-app</h2>
          <span id="dirty" class="dirty hide">● chưa lưu</span>
        </div>
        <div class="row">
          <button id="btn-add-app">+ Mini-app</button>
          <button id="btn-reload">Bỏ thay đổi</button>
          <button class="primary" id="btn-save">Lưu</button>
        </div>
      </div>
      <div id="apps"></div>
    </div>

    <!-- Thử một thiết bị cụ thể -->
    <div class="card">
      <h2>Thiết bị này sẽ nhận gì</h2>
      <p class="hint" style="margin:2px 0 10px">
        Gọi <code>/registry</code> thật — chỉ phản ánh bản <em>đã lưu</em>.
      </p>
      <div class="row">
        <div><label for="pv-host">Host</label><input id="pv-host" class="w-ver" value="1.0.0"></div>
        <div><label for="pv-dev">Device ID</label><input id="pv-dev" value="thiet-bi-thu"></div>
        <div><label for="pv-pin">Ghim (id@ver)</label><input id="pv-pin" placeholder="loyalty@1.2.0"></div>
        <button id="btn-preview" style="align-self:flex-end">Thử</button>
      </div>
      <pre id="pv-out">—</pre>
    </div>

    <!-- Nhật ký -->
    <div class="card">
      <div class="row spread">
        <h2>Nhật ký thay đổi</h2>
        <button class="sm" id="btn-log">Tải nhật ký</button>
      </div>
      <div id="log" class="log"></div>
    </div>
  </div>
</div>

<script>
const $ = s => document.querySelector(s);
let registry = { miniApps: [] };
let savedJson = '';           // ảnh chụp bản đã lưu, để biết có gì chưa ghi

const token = {
  get: () => sessionStorage.getItem('registry-token') || '',
  set: v => sessionStorage.setItem('registry-token', v),
  clear: () => sessionStorage.removeItem('registry-token'),
};

let msgTimer;
const say = (text, kind) => {
  const el = $('#msg');
  el.textContent = text;
  el.className = 'msg on ' + kind;
  clearTimeout(msgTimer);
  if (kind === 'ok') { msgTimer = setTimeout(() => { el.className = 'msg'; }, 3000); }
};

const api = async (path, method, body) => {
  const res = await fetch(path, {
    method,
    headers: {
      'Authorization': 'Bearer ' + token.get(),
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) { throw new Error(data.error || ('HTTP ' + res.status)); }
  return data;
};

const isDirty = () => JSON.stringify(registry) !== savedJson;

const markDirty = () => {
  $('#dirty').className = isDirty() ? 'dirty' : 'dirty hide';
  // Mô phỏng chạy trên bản ĐÃ LƯU, nên khoá lại khi đang có sửa đổi treo
  document.querySelectorAll('[data-sim]').forEach(b => { b.disabled = isDirty(); });
};

// Đóng tab khi còn sửa dở thì mất hết — trình duyệt sẽ hỏi lại
window.addEventListener('beforeunload', e => {
  if (isDirty()) { e.preventDefault(); e.returnValue = ''; }
});

const esc = s => String(s ?? '').replace(/[&<>"]/g, ch =>
  ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[ch]));

const STATUSES = ['active', 'paused', 'draft'];
const RAMP = [0, 10, 25, 50, 100];

// Vẽ lại cả bảng sau mỗi thay đổi cấu trúc. Registry cỡ vài chục dòng nên
// đủ nhanh, đổi lại không phải đồng bộ state với DOM.
const render = () => {
  const box = $('#apps');
  if (!registry.miniApps.length) {
    box.innerHTML = '<p class="hint">Chưa có mini-app nào.</p>';
    markDirty();
    return;
  }
  box.innerHTML = registry.miniApps.map((app, ai) => {
    const versions = app.versions || [];
    const actives = versions.filter(v => v.status === 'active');
    return \`
    <div class="app">
      <div class="app-head">
        <span class="pill">\${esc(app.id) || '(chưa có id)'}</span>
        <input data-app="\${ai}" data-f="id"   value="\${esc(app.id)}"   placeholder="id">
        <input data-app="\${ai}" data-f="name" data-lang="vi" value="\${esc(app.name?.vi)}" placeholder="Tên (VI)">
        <input data-app="\${ai}" data-f="name" data-lang="en" value="\${esc(app.name?.en)}" placeholder="Tên (EN)">
        <input data-app="\${ai}" data-f="icon" value="\${esc(app.icon)}" placeholder="icon ionicon">
        <button class="link" data-del-app="\${ai}">Xoá</button>
      </div>

      <div class="row" style="gap:6px;margin-bottom:10px;font-size:12px;color:var(--sub)">
        <span>\${versions.length} phiên bản</span>
        \${STATUSES.map(st => {
          const n = versions.filter(v => (v.status || 'draft') === st).length;
          return n ? \`<span class="tag \${st}">\${n} \${st}</span>\` : '';
        }).join('')}
        \${actives.length === 0
          ? '<span class="tag paused">không bản nào phát hành — mini-app sẽ biến mất khỏi app</span>'
          : ''}
      </div>

      <div class="tablewrap">
      <table>
        <thead><tr>
          <th>Phiên bản</th><th>Trạng thái</th><th>Rollout %</th><th></th>
          <th>minHost</th><th>maxHost</th><th>container</th><th>chunkBase</th><th></th>
        </tr></thead>
        <tbody>
        \${versions.map((v, vi) => \`
          <tr>
            <td><input class="w-ver" data-app="\${ai}" data-ver="\${vi}" data-f="version" value="\${esc(v.version)}"></td>
            <td><select data-app="\${ai}" data-ver="\${vi}" data-f="status">
              \${STATUSES.map(s =>
                \`<option value="\${s}" \${(v.status || 'draft') === s ? 'selected' : ''}>\${s}</option>\`).join('')}
            </select></td>
            <td><input class="w-num mono" type="number" min="0" max="100" data-app="\${ai}" data-ver="\${vi}" data-f="rollout" value="\${v.rollout ?? 100}"></td>
            <td><span class="ramp">\${RAMP.map(r =>
              \`<button class="sm" data-ramp="\${ai}:\${vi}:\${r}" title="đặt rollout \${r}%">\${r}</button>\`).join('')}</span></td>
            <td><input class="w-host" data-app="\${ai}" data-ver="\${vi}" data-f="minHost" value="\${esc(v.minHost)}"></td>
            <td><input class="w-host" data-app="\${ai}" data-ver="\${vi}" data-f="maxHost" value="\${esc(v.maxHost)}"></td>
            <td><input data-app="\${ai}" data-ver="\${vi}" data-f="container" value="\${esc(v.container)}"></td>
            <td><input data-app="\${ai}" data-ver="\${vi}" data-f="chunkBase" value="\${esc(v.chunkBase)}"></td>
            <td><button class="link" data-del-ver="\${ai}:\${vi}">×</button></td>
          </tr>\`).join('')}
        </tbody>
      </table>
      </div>

      <div class="row" style="margin-top:10px">
        <button class="sm" data-add-ver="\${ai}">+ Phiên bản</button>
        <button class="sm" data-sim="\${esc(app.id)}">Mô phỏng phát hành</button>
        <input class="w-ver" id="sim-host-\${ai}" value="1.0.0" title="phiên bản host để mô phỏng">
      </div>
      <div id="sim-\${ai}"></div>
    </div>\`;
  }).join('');
  markDirty();
};

// Gõ tới đâu ghi vào registry tới đó
$('#apps').addEventListener('input', e => {
  const el = e.target;
  const f = el.dataset.f;
  if (!f) { return; }
  const app = registry.miniApps[+el.dataset.app];
  const target = el.dataset.ver === undefined ? app : app.versions[+el.dataset.ver];

  if (el.dataset.lang) {
    // Tên hiển thị là map đa ngôn ngữ, không phải chuỗi — app đọc theo ngôn ngữ đang dùng
    target.name = { ...(target.name || {}), [el.dataset.lang]: el.value };
  } else if (f === 'rollout') {
    // Chặn tại chỗ: rollout ngoài 0–100 làm phép so bucket vô nghĩa
    const n = Math.max(0, Math.min(100, Number(el.value)));
    target.rollout = Number.isFinite(n) ? n : 100;
  } else if (!el.value && (f === 'minHost' || f === 'maxHost')) {
    delete target[f];   // để rỗng = không ràng buộc, đừng lưu chuỗi rỗng
  } else {
    target[f] = el.value;
  }
  markDirty();
});

$('#apps').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b) { return; }

  if (b.dataset.sim !== undefined) { return simulate(b.dataset.sim, b); }

  if (b.dataset.ramp) {
    const [ai, vi, r] = b.dataset.ramp.split(':').map(Number);
    registry.miniApps[ai].versions[vi].rollout = r;
  } else if (b.dataset.delApp !== undefined) {
    const app = registry.miniApps[+b.dataset.delApp];
    if (!confirm('Xoá mini-app "' + (app.id || '?') + '" khỏi registry?')) { return; }
    registry.miniApps.splice(+b.dataset.delApp, 1);
  } else if (b.dataset.addVer !== undefined) {
    const app = registry.miniApps[+b.dataset.addVer];
    app.versions = app.versions || [];
    // Bản mới mặc định draft + 0% — thêm nhầm cũng không tới tay ai
    app.versions.push({ version: '', status: 'draft', rollout: 0, container: '', chunkBase: '' });
  } else if (b.dataset.delVer) {
    const [ai, vi] = b.dataset.delVer.split(':').map(Number);
    registry.miniApps[ai].versions.splice(vi, 1);
  } else {
    return;
  }
  render();
});

$('#btn-add-app').onclick = () => {
  registry.miniApps.push({ id: '', name: {}, icon: '', versions: [] });
  render();
};

// ── Mô phỏng ────────────────────────────────────────────────────────────────
const simulate = async (id, btn) => {
  const ai = registry.miniApps.findIndex(a => a.id === id);
  const out = $('#sim-' + ai);
  const host = $('#sim-host-' + ai).value || '1.0.0';
  out.innerHTML = '<p class="hint">Đang tính…</p>';
  try {
    const d = await api(\`/registry/simulate?app=\${encodeURIComponent(id)}&host=\${encodeURIComponent(host)}&n=4000\`, 'GET');
    const bar = (label, percent, none) => \`
      <div class="bar-row">
        <span class="mono">\${esc(label)}</span>
        <span class="bar \${none ? 'none' : ''}"><i style="width:\${percent}%"></i></span>
        <span class="mono">\${percent}%</span>
      </div>\`;
    out.innerHTML = \`
      <div class="bars">
        \${d.versions.map(v => bar('v' + v.version, v.percent, false)).join('')}
        \${d.none.count ? bar('không nhận', d.none.percent, true) : ''}
      </div>
      <p class="hint">Ước lượng trên \${d.sampleSize} thiết bị giả, host v\${esc(d.hostVersion)}.</p>
      \${d.starved.length
        ? \`<div class="note">Bản \${d.starved.map(v => 'v' + esc(v)).join(', ')} đang active nhưng
             <b>không thiết bị nào nhận</b> — thường do một bản cao hơn đã phủ 100%,
             hoặc rollout đang để 0.</div>\`
        : ''}\`;
  } catch (err) {
    out.innerHTML = \`<p class="hint" style="color:var(--danger)">Lỗi: \${esc(err.message)}</p>\`;
  }
};

// ── Nạp / lưu ───────────────────────────────────────────────────────────────
const load = async () => {
  const data = await api('/registry/admin', 'GET');
  registry = { miniApps: Array.isArray(data.miniApps) ? data.miniApps : [] };
  savedJson = JSON.stringify(registry);
  render();
};

$('#btn-login').onclick = async () => {
  const v = $('#tok').value.trim();
  if (!v) { return say('Chưa nhập token.', 'err'); }
  token.set(v);
  try {
    await load();
    $('#auth').classList.add('gone');
    $('#main').classList.remove('gone');
    $('#tok').value = '';
    say('Đã kết nối.', 'ok');
  } catch (err) {
    token.clear();
    say(err.message === 'unauthorized' ? 'Token không đúng.' : ('Lỗi: ' + err.message), 'err');
  }
};
$('#tok').addEventListener('keydown', e => { if (e.key === 'Enter') { $('#btn-login').click(); } });

$('#btn-reload').onclick = () => {
  if (isDirty() && !confirm('Bỏ các thay đổi chưa lưu?')) { return; }
  load().then(() => say('Đã tải lại từ server.', 'ok')).catch(err => say('Lỗi: ' + err.message, 'err'));
};

// URL bundle sẽ được app tải về rồi CHẠY. http ngoài localhost nghĩa là ai
// chen giữa đường cũng đổi được code chạy trên máy người dùng.
const badUrl = u =>
  !/^https:\\/\\//.test(u) &&
  // chunkBase hay được ghi không có dấu / cuối — resolver tự thêm, đừng bắt lỗi
  !/^http:\\/\\/localhost(:\\d+)?(\\/|$)/.test(u);

const validate = () => {
  const ids = registry.miniApps.map(a => a.id);
  const dupApp = ids.find((id, i) => id && ids.indexOf(id) !== i);
  if (dupApp) { return 'Trùng id mini-app: ' + dupApp; }
  if (ids.some(id => !id)) { return 'Có mini-app chưa đặt id.'; }

  for (const app of registry.miniApps) {
    if (!app.name?.vi) { return app.id + ': thiếu tên tiếng Việt.'; }

    const vs = (app.versions || []).map(v => v.version);
    const dup = vs.find((v, i) => v && vs.indexOf(v) !== i);
    if (dup) { return app.id + ': trùng phiên bản ' + dup; }

    for (const v of app.versions || []) {
      const at = app.id + ' ' + (v.version || '(chưa đặt)');
      if (!/^\\d+\\.\\d+\\.\\d+$/.test(v.version)) {
        return app.id + ': phiên bản "' + v.version + '" không đúng dạng x.y.z';
      }
      if (v.minHost && !/^\\d+\\.\\d+\\.\\d+$/.test(v.minHost)) { return at + ': minHost sai dạng x.y.z'; }
      if (v.maxHost && !/^\\d+\\.\\d+\\.\\d+$/.test(v.maxHost)) { return at + ': maxHost sai dạng x.y.z'; }
      if (v.status !== 'active') { continue; }
      if (!v.container) { return at + ': bản active phải có container.'; }
      if (!v.chunkBase) { return at + ': bản active phải có chunkBase.'; }
      if (badUrl(v.container)) { return at + ': container phải là https (hoặc http://localhost khi chạy thử).'; }
      if (badUrl(v.chunkBase)) { return at + ': chunkBase phải là https (hoặc http://localhost khi chạy thử).'; }
    }
  }
  return null;
};

$('#btn-save').onclick = async () => {
  const problem = validate();
  if (problem) { return say(problem, 'err'); }
  try {
    const r = await api('/registry/admin', 'PUT', registry);
    savedJson = JSON.stringify(registry);
    markDirty();
    say(r.changes?.length
      ? 'Đã lưu — ' + r.changes.length + ' thay đổi: ' + r.changes.join('; ')
      : 'Đã lưu (không có gì thay đổi).', 'ok');
    loadLog();
  } catch (err) {
    say(err.message === 'unauthorized' ? 'Token hết hiệu lực, tải lại trang.' : ('Lỗi: ' + err.message), 'err');
  }
};

// ── Thử một thiết bị ────────────────────────────────────────────────────────
$('#btn-preview').onclick = async () => {
  const q = new URLSearchParams({ host: $('#pv-host').value, device: $('#pv-dev').value });
  const pin = $('#pv-pin').value.trim();
  if (pin) { q.append('pin', pin); }
  try {
    const res = await fetch('/registry?' + q);
    const data = await res.json();
    $('#pv-out').textContent = data.miniApps.length
      ? JSON.stringify(data.miniApps, null, 2)
      : 'Thiết bị này không nhận mini-app nào.';
  } catch (err) {
    $('#pv-out').textContent = 'Lỗi: ' + err.message;
  }
};

// ── Nhật ký ─────────────────────────────────────────────────────────────────
const loadLog = async () => {
  const box = $('#log');
  try {
    const { entries } = await api('/registry/admin/log', 'GET');
    box.innerHTML = entries.length
      ? entries.map(e => \`
          <div>
            <time>\${esc(new Date(e.at).toLocaleString('vi-VN'))}</time>
            <ul>\${e.changes.map(c => '<li>' + esc(c) + '</li>').join('')}</ul>
          </div>\`).join('')
      : '<p class="hint">Chưa có thay đổi nào được ghi.</p>';
  } catch (err) {
    box.innerHTML = '<p class="hint" style="color:var(--danger)">Lỗi: ' + esc(err.message) + '</p>';
  }
};
$('#btn-log').onclick = loadLog;

// Quay lại tab cũ thì khỏi nhập token lần nữa
if (token.get()) {
  load()
    .then(() => { $('#auth').classList.add('gone'); $('#main').classList.remove('gone'); loadLog(); })
    .catch(() => token.clear());
}
</script>
</body>
</html>`;
