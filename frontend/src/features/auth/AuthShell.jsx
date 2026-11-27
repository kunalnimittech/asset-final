import { Avatar, Bar } from "../../kit";
import "./auth.css";

// Sign-in and sign-up share one symmetric page: the form on the left half,
// a 2 × 2 ruled bento on the right half, split by a dashed divider.

// A deterministic QR-like pattern for the asset tag: finder squares in three
// corners and a pseudo-random fill everywhere else.
const N = 21;
const finder = (x, y) => {
  const inBox = (ox, oy) => x >= ox && x < ox + 7 && y >= oy && y < oy + 7;
  return inBox(0, 0) || inBox(N - 7, 0) || inBox(0, N - 7);
};
const finderOn = (x, y) => {
  const local = (v, o) => v - o;
  const boxes = [[0, 0], [N - 7, 0], [0, N - 7]];
  for (const [ox, oy] of boxes) {
    const lx = local(x, ox);
    const ly = local(y, oy);
    if (lx >= 0 && lx < 7 && ly >= 0 && ly < 7) {
      const ring = lx === 0 || lx === 6 || ly === 0 || ly === 6;
      const core = lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4;
      return ring || core;
    }
  }
  return false;
};
const CELLS = [];
for (let y = 0; y < N; y++) {
  for (let x = 0; x < N; x++) {
    const on = finder(x, y) ? finderOn(x, y) : ((x * 7 + y * 13 + x * y * 3) % 5) < 2;
    if (on) CELLS.push([x, y]);
  }
}

function AssetTag() {
  return (
    <div className="au-tag" aria-hidden>
      <div className="au-tag__top">
        <span className="au-tag__brand">NimitTech</span>
        <span className="au-tag__kind">Asset</span>
      </div>
      <svg className="au-tag__qr" viewBox={`0 0 ${N} ${N}`} shapeRendering="crispEdges">
        {CELLS.map(([x, y]) => (
          <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" />
        ))}
      </svg>
      <span className="au-tag__id">NT-0142</span>
    </div>
  );
}

function Activity() {
  return (
    <div className="au-log" aria-hidden>
      <div className="au-log__row" data-real>
        <span className="au-log__dot" />
        <span className="au-log__text">
          <b>Laptop returned</b>
          <span>to IT store</span>
        </span>
        <span className="au-log__time">2m</span>
      </div>
      {[[96, 54], [80, 70], [104, 48]].map(([a, b], i) => (
        <div key={i} className="au-log__row">
          <Avatar size={18} tone="ink" />
          <span className="au-log__text">
            <Bar w={a} h={6} tone={3} />
            <Bar w={b} h={6} tone={2} />
          </span>
          <Bar w={16} h={6} tone={2} />
        </div>
      ))}
    </div>
  );
}

function Aside() {
  return (
    <aside className="au-aside" aria-label="About NimitTech Assets">
      <div className="au-frame">
        <div className="au-grid">
          <section className="au-cell au-cell--tag">
            <p className="au-copy">
              <b>Tag it once.</b> Every item gets a scannable label.
            </p>
            <AssetTag />
          </section>
          <section className="au-cell au-cell--statement">
            <p className="au-statement">
              Scan.
              <br />
              Assign.
              <br />
              <span>Done.</span>
            </p>
          </section>
          <section className="au-cell au-cell--stat">
            <span className="au-stat-lead">Access by role</span>
            <span className="au-stat-number">2</span>
            <span className="au-stat-label">Admins run the register. Everyone else sees what's theirs.</span>
          </section>
          <section className="au-cell au-cell--log">
            <p className="au-copy">
              <b>A full audit trail.</b>
            </p>
            <Activity />
          </section>
        </div>
      </div>
    </aside>
  );
}

export function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="au">
      <div className="au-main">
        <div className="au-form-wrap">
          <h1 className="au-title">{title}</h1>
          <p className="au-sub">{subtitle}</p>
          {children}
          {footer && <p className="au-switch">{footer}</p>}
        </div>
      </div>
      <Aside />
    </div>
  );
}
