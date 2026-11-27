import {
  Camera,
  Car,
  Cpu,
  Headphones,
  Laptop,
  Monitor,
  Printer,
  Projector,
  Router,
  Server,
  Smartphone,
  Sofa,
  Tablet,
  Wrench,
  KeyRound,
  Package,
  ScanLine,
  BatteryCharging,
  IdCard,
  Zap,
  FlaskConical,
  AirVent,
  Armchair,
  Tv,
} from "lucide-react";
import { Avatar, Badge, Bar, Count, Icon, Stage, States, Window, useReducedMotion } from "../../kit";
import { after, before, beat, LEAD, STEP, useInView, usePictureWidth } from "./hooks";
import { useTheme } from "../../lib/theme";
import "./feature-grid.css";

// NimitTech Assets — the features section, a ruled bento with dashed dividers.
//
//   Tile       Span   Kind        The one thing                           Moves
//   Register   2 × 1  Hero UI     the asset register, one laptop handed   status turns Assigned, holder appears
//   Sheets     1 × 1  Stat        "0" spreadsheets                        counts down from 6
//   Lifecycle  1 × 1  Diagram     procured → retired, one live stage      the line fills to Assigned
//   Service    2 × 1  Component   the service schedule                    the jobs draw in, one flags due
//   Kinds      3 × 1  Collection  asset categories, bleeding off          the rows drift apart
//
// Wide: 2 + 1, 1 + 2, then the band — the two middle rows mirror each other.

const ACCENT = "#1f5eff";

function Tile({ area, title, children, picture }) {
  return (
    <section className={`fg-cell fg-cell--${area}`}>
      {title ? (
        <p className="fg-copy">
          {title} {children}
        </p>
      ) : (
        children
      )}
      {picture}
    </section>
  );
}

/* ---------------- Register (hero) ---------------- */

const ROWS = [
  { name: 96, tag: 44, holder: 70 },
  { real: true },
  { name: 112, tag: 44, holder: 58 },
  { name: 84, tag: 44, holder: 76 },
  { name: 104, tag: 44, holder: 64 },
  { name: 90, tag: 44, holder: 72 },
];

function Register({ on, layout }) {
  const wide = layout === "wide";
  const list = (
    <div className="fg-register">
      <div className="fg-reg-head" aria-hidden>
        <span>Asset</span>
        <span>Tag</span>
        <span>Status</span>
        {wide && <span>Holder</span>}
      </div>
      {ROWS.map((row, i) =>
        row.real ? (
          <div key={i} className="fg-reg-row" data-real>
            <span className="fg-reg-asset">
              <span className="fg-reg-icon">
                <Laptop size={15} strokeWidth={1.6} />
              </span>
              <span className="fg-reg-name">MacBook Pro 14″</span>
            </span>
            <span className="fg-reg-tag">NT-0142</span>
            <States
              value={on ? "assigned" : "stock"}
              align="start"
              className="fg-reg-status"
              states={{
                stock: <Badge className="fg-pill">In stock</Badge>,
                assigned: (
                  <Badge tone="accent" dot className="fg-pill">
                    Assigned
                  </Badge>
                ),
              }}
            />
            {wide && (
              <span className="fg-reg-holder" data-on={on || undefined}>
                <Avatar name="Aarav Mehta" size={20} />
                <span>Aarav Mehta</span>
              </span>
            )}
          </div>
        ) : (
          <div key={i} className="fg-reg-row" aria-hidden>
            <span className="fg-reg-asset">
              <Bar w={26} h={26} r={7} tone={1} />
              <Bar w={row.name} h={6} tone={3} />
            </span>
            <Bar w={row.tag} h={6} tone={2} />
            <Bar w={62} h={20} r={10} tone={1} />
            {wide && (
              <span className="fg-reg-holder fg-reg-holder--filler">
                <Bar w={20} h={20} r={10} tone={2} />
                <Bar w={row.holder} h={6} tone={2} />
              </span>
            )}
          </div>
        ),
      )}
    </div>
  );

  const toolbar = (
    <span className="fg-tools" aria-hidden>
      <Bar w={120} h={26} r={7} tone={1} />
      <Bar w={26} h={26} r={7} tone={2} />
    </span>
  );

  if (!wide) {
    return (
      <Window title="Assets" className="fg-window fg-window--compact" body={{ "data-crop": "" }}>
        {list}
      </Window>
    );
  }
  return (
    <Window
      className="fg-window"
      body={{ "data-crop": "" }}
      title="Assets"
      toolbar={toolbar}
      sidebarWidth={156}
      sidebar={
        <nav className="fg-side" aria-hidden>
          {[52, 70, 44, 58, 48].map((w, i) => (
            <span key={i} className="fg-nav" data-active={i === 0 || undefined}>
              <Bar w={12} h={12} r={3} tone={i === 0 ? 4 : 2} />
              <Bar w={w} h={6} tone={i === 0 ? 4 : 2} />
            </span>
          ))}
        </nav>
      }
    >
      {list}
    </Window>
  );
}

function RegisterTile() {
  const [theme] = useTheme();
  const [ref, width] = usePictureWidth(640);
  const layout = width < 560 ? "compact" : "wide";
  return (
    <Tile
      area="hero"
      title={<b>Every asset, one register.</b>}
      picture={
        <div ref={ref} className="fg-picture fg-picture--hero">
          <Stage width={width} height={layout === "wide" ? 300 : 290} accent={ACCENT} theme={theme} initial={before} poster={after} play="once" script={beat(0)} className="fg-stage">
            {(s) => <Register on={s.on} layout={layout} />}
          </Stage>
        </div>
      }
    >
      See what you own, where it is and who has it — updated the moment it changes hands.
    </Tile>
  );
}

/* ---------------- Sheets (stat) ---------------- */

function SheetsTile() {
  const reduced = useReducedMotion();
  const [ref, seen] = useInView(LEAD + STEP);
  return (
    <Tile area="stat" title={null}>
      <div ref={ref} className="fg-stat">
        <span className="fg-stat-lead">
          <Icon name="file" size={16} className="fg-stat-glyph" />
          Spreadsheets to maintain
        </span>
        <span className="fg-stat-number">
          <Count value={seen || reduced ? 0 : 6} duration={1300} />
        </span>
        <span className="fg-stat-label">Purchases, handovers and repairs are logged as they happen.</span>
      </div>
    </Tile>
  );
}

/* ---------------- Lifecycle (diagram) ---------------- */

const STAGES = ["Procured", "In stock", "Assigned", "In repair", "Retired"];
const LIVE = 2;

function LifecycleTile() {
  const [theme] = useTheme();
  const [ref, width] = usePictureWidth(340);
  return (
    <Tile
      area="flow"
      title={<b>The whole lifecycle.</b>}
      picture={
        <div ref={ref} className="fg-picture fg-picture--flow">
          <Stage width={width} height={224} accent={ACCENT} theme={theme} initial={before} poster={after} play="once" script={beat(2)} className="fg-stage">
            {(s) => (
              <ol className="fg-flow" data-on={s.on || undefined} style={{ "--live": LIVE }}>
                <span className="fg-flow__rail" aria-hidden>
                  <span className="fg-flow__fill" />
                </span>
                {STAGES.map((name, i) => (
                  <li key={name} className="fg-flow__step" data-done={i <= LIVE || undefined} data-live={i === LIVE || undefined} style={{ "--i": i }}>
                    <span className="fg-flow__dot" />
                    <span className="fg-flow__name">{name}</span>
                    {i === LIVE ? <span className="fg-flow__now">Now</span> : <Bar w={40 + ((i * 17) % 24)} h={6} tone={1} className="fg-flow__bar" />}
                  </li>
                ))}
              </ol>
            )}
          </Stage>
        </div>
      }
    >
      From purchase order to disposal.
    </Tile>
  );
}

/* ---------------- Service (component) ---------------- */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
// Each job: start and length in months (0–6); one is real and due soon
const JOBS = [
  { at: 0.4, len: 1.1, label: 92 },
  { at: 2.05, len: 0.8, real: true },
  { at: 1.2, len: 1.6, label: 76 },
  { at: 3.3, len: 1.2, label: 104 },
];

function ServiceTile() {
  const [theme] = useTheme();
  const [ref, width] = usePictureWidth(640);
  const layout = width < 560 ? "compact" : "wide";
  const months = layout === "wide" ? MONTHS : MONTHS.slice(0, 4);
  const span = months.length;
  return (
    <Tile
      area="service"
      title={<b>Service before it breaks.</b>}
      picture={
        <div ref={ref} className="fg-picture fg-picture--service">
          <Stage width={width} height={layout === "wide" ? 216 : 236} accent={ACCENT} theme={theme} initial={before} poster={after} play="once" script={beat(3)} className="fg-stage">
            {(s) => (
              <div className="fg-service" data-on={s.on || undefined} data-layout={layout} style={{ "--span": span }}>
                <div className="fg-service__head">
                  <span className="fg-service__title">Upcoming service</span>
                  <Bar w={64} h={6} tone={2} />
                </div>
                <div className="fg-service__axis" aria-hidden>
                  {months.map((m) => (
                    <span key={m}>{m}</span>
                  ))}
                </div>
                <div className="fg-service__rows">
                  <span className="fg-service__today" style={{ "--at": 1.75 }} aria-hidden />
                  {JOBS.map((job, i) => (
                    <div key={i} className="fg-service__row" data-real={job.real || undefined}>
                      <span className="fg-service__label">
                        {job.real ? (
                          <>
                            <Wrench size={13} strokeWidth={1.7} />
                            Generator · Block B
                          </>
                        ) : (
                          <Bar w={job.label} h={6} tone={2} />
                        )}
                      </span>
                      <span className="fg-service__track">
                        <span className="fg-service__job" style={{ "--at": job.at, "--len": job.len, "--i": i }}>
                          {job.real && <span className="fg-service__due">Due in 9 days</span>}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Stage>
        </div>
      }
    >
      Warranties and maintenance on one calendar, with a nudge before anything lapses.
    </Tile>
  );
}

/* ---------------- Kinds (collection) ---------------- */

const KINDS = [
  [[Laptop, "Laptops"], [Monitor, "Monitors"], [Smartphone, "Phones"], [KeyRound, "Software licences"], [Car, "Vehicles"], [Sofa, "Furniture"], [Server, "Servers"], [Printer, "Printers"], [ScanLine, "Scanners"], [IdCard, "Access cards"], [Zap, "Generators"], [Tv, "Displays"]],
  [[Projector, "Projectors"], [Tablet, "Tablets"], [Router, "Network gear"], [Wrench, "Tools"], [Camera, "Cameras"], [Headphones, "Headsets"], [Cpu, "Components"], [Package, "Spares"], [FlaskConical, "Lab equipment"], [AirVent, "AC units"], [Armchair, "Desks & chairs"], [BatteryCharging, "UPS & batteries"]],
];

function KindsTile() {
  const [theme] = useTheme();
  return (
    <Tile
      area="kinds"
      title={<b>Track anything you own.</b>}
      picture={
        <div className="fg-picture fg-picture--kinds">
          <Stage width={1800} height={112} accent={ACCENT} theme={theme} initial={before} poster={after} play="once" script={beat(4)} className="fg-stage">
            {(s) => (
              <div className="fg-kinds" data-on={s.on || undefined} aria-hidden>
                {KINDS.map((row, r) => (
                  <div key={r} className="fg-kinds__row" style={{ "--dir": r % 2 ? 1 : -1, "--off": `${[-60, -10][r]}px` }}>
                    {row.map(([Glyph, name]) => (
                      <span key={name} className="fg-chip">
                        <Glyph size={15} strokeWidth={1.6} />
                        {name}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </Stage>
        </div>
      }
    >
      Hardware, software licences, vehicles and furniture — each with its own fields.
    </Tile>
  );
}

export function FeatureGrid() {
  return (
    <div className="feature-grid">
      <div className="fg-body">
      <div className="fg-hlines" aria-hidden>
        <span className="fg-hline" />
        <span className="fg-hline" />
        <span className="fg-hline" />
        <span className="fg-hline" />
      </div>
      <div className="fg-frame">
        <div className="fg-grid">
          <RegisterTile />
          <SheetsTile />
          <LifecycleTile />
          <ServiceTile />
          <KindsTile />
        </div>
      </div>
      </div>
    </div>
  );
}
