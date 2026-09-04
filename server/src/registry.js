// Registry mini-app: quyết định THIẾT BỊ NÀY nên tải phiên bản nào.
//
// Toàn bộ logic chọn phiên bản là hàm thuần — không đụng mạng, không đụng KV —
// để test cạn được. Phần I/O nằm ở index.js.

/** So sánh semver "1.10.2" vs "1.9.0". Trả <0, 0, >0. */
export const compareVersion = (a, b) => {
  const pa = String(a).split('.').map(Number);
  const pb = String(b).split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    const d = (pa[i] || 0) - (pb[i] || 0);
    if (d !== 0) { return d; }
  }
  return 0;
};

/**
 * Băm tất định để chia nhóm rollout. Cùng thiết bị + cùng mini-app luôn ra cùng
 * số — nên người dùng không bị nhảy qua lại giữa hai phiên bản mỗi lần mở app.
 */
export const rolloutBucket = (deviceId, miniAppId) => {
  const s = `${deviceId}:${miniAppId}`;
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) % 100;
};

const isCompatible = (v, hostVersion) => {
  if (v.minHost && compareVersion(hostVersion, v.minHost) < 0) { return false; }
  // maxHost là NGƯỠNG LOẠI TRỪ: "2.0.0" nghĩa là host 2.x trở lên không dùng được
  if (v.maxHost && compareVersion(hostVersion, v.maxHost) >= 0) { return false; }
  return true;
};

/**
 * Chọn phiên bản cho một mini-app.
 * Thứ tự ưu tiên: bản ghim > bản mới nhất còn active, tương thích host, và
 * thiết bị rơi vào nhóm rollout.
 * Trả về null nếu không có bản nào dùng được — app phải chịu được trường hợp này.
 */
export const resolveVersion = (app, { hostVersion, deviceId, pin }) => {
  const versions = Array.isArray(app.versions) ? app.versions : [];

  if (pin) {
    // Ghim dùng để QA: bỏ qua rollout nhưng VẪN kiểm tương thích, tránh nạp
    // bundle chắc chắn crash trên host này.
    const found = versions.find(v => v.version === pin);
    return found && isCompatible(found, hostVersion) ? found : null;
  }

  const bucket = rolloutBucket(deviceId, app.id);

  return versions
    .filter(v => v.status === 'active')
    .filter(v => isCompatible(v, hostVersion))
    .filter(v => bucket < (v.rollout ?? 100))
    .sort((a, b) => compareVersion(b.version, a.version))[0] ?? null;
};

/** Dựng danh sách mini-app đã chốt phiên bản, để trả cho app. */
export const resolveManifest = (registry, ctx) => {
  const apps = Array.isArray(registry?.miniApps) ? registry.miniApps : [];
  return apps
    .map(app => {
      const v = resolveVersion(app, { ...ctx, pin: ctx.pins?.[app.id] });
      if (!v) { return null; }
      return {
        id: app.id,
        name: app.name,
        icon: app.icon,
        version: v.version,
        container: v.container,
        chunkBase: v.chunkBase,
        // Có sẵn trong manifest để sau này bật xác thực mà không đổi cấu trúc.
        // HIỆN CHƯA KIỂM — xem phần An toàn trong README.
        sha256: v.sha256 ?? null,
      };
    })
    .filter(Boolean);
};

/**
 * Ước lượng phân bố phiên bản trên một đám thiết bị giả.
 *
 * Dùng CHÍNH resolveVersion chứ không tính lại — nếu mô phỏng có logic riêng
 * thì nó sẽ nói dối đúng vào lúc cần tin nhất. Thiết bị giả nên đây là ước
 * lượng, không phải số liệu thật; hàm băm phân bố đều nên vẫn đại diện được.
 */
export const simulateRollout = (app, { hostVersion, sampleSize = 1000 }) => {
  const n = Math.max(1, Math.min(10000, Number(sampleSize) || 1000));
  const counts = new Map();
  let none = 0;

  for (let i = 0; i < n; i++) {
    const v = resolveVersion(app, { hostVersion, deviceId: `sim-${app.id}-${i}` });
    if (!v) { none++; continue; }
    counts.set(v.version, (counts.get(v.version) ?? 0) + 1);
  }

  const pct = c => Math.round((c / n) * 1000) / 10;

  // Bản active, tương thích host, nhưng không thiết bị nào nhận — thường là do
  // một bản cao hơn đã phủ 100%. Đây là cái bẫy hay gặp nhất khi chỉnh rollout.
  const starved = (app.versions ?? [])
    .filter(v => v.status === 'active' && isCompatible(v, hostVersion))
    .filter(v => !counts.has(v.version))
    .map(v => v.version);

  return {
    sampleSize: n,
    hostVersion,
    versions: [...counts.entries()]
      .sort((a, b) => compareVersion(b[0], a[0]))
      .map(([version, count]) => ({ version, count, percent: pct(count) })),
    none: { count: none, percent: pct(none) },
    starved,
  };
};

const versionMap = app =>
  new Map((app.versions ?? []).map(v => [v.version, v]));

/**
 * So hai bản registry, trả về danh sách thay đổi bằng lời.
 * Dùng cho nhật ký — người vận hành cần biết "ai đổi rollout của bản nào",
 * chứ đọc lại cả JSON thì không ra.
 */
export const diffRegistry = (prev, next) => {
  const before = new Map((prev?.miniApps ?? []).map(a => [a.id, a]));
  const after = new Map((next?.miniApps ?? []).map(a => [a.id, a]));
  const lines = [];

  for (const id of before.keys()) {
    if (!after.has(id)) { lines.push(`gỡ mini-app ${id}`); }
  }

  for (const [id, app] of after) {
    const old = before.get(id);
    if (!old) {
      lines.push(`thêm mini-app ${id}`);
      continue;
    }
    const ov = versionMap(old);
    const nv = versionMap(app);

    for (const version of ov.keys()) {
      if (!nv.has(version)) { lines.push(`${id}: xoá bản ${version}`); }
    }
    for (const [version, v] of nv) {
      const o = ov.get(version);
      if (!o) {
        lines.push(`${id}: thêm bản ${version} (${v.status ?? 'draft'}, ${v.rollout ?? 100}%)`);
        continue;
      }
      if (o.status !== v.status) {
        lines.push(`${id} ${version}: ${o.status} → ${v.status}`);
      }
      if ((o.rollout ?? 100) !== (v.rollout ?? 100)) {
        lines.push(`${id} ${version}: rollout ${o.rollout ?? 100}% → ${v.rollout ?? 100}%`);
      }
      if (o.container !== v.container) {
        lines.push(`${id} ${version}: đổi container`);
      }
      if ((o.minHost ?? '') !== (v.minHost ?? '') || (o.maxHost ?? '') !== (v.maxHost ?? '')) {
        lines.push(`${id} ${version}: đổi khoảng host`);
      }
    }
  }

  return lines;
};
