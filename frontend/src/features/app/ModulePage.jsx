import { LEVEL_LABELS, moduleByKey } from "../../lib/access";

/**
 * A module that isn't built yet: what it will do, the user's access level in
 * it, and when it's planned. The route is already role-guarded, so this page
 * only ever shows to roles that are allowed in.
 */
export function ModulePage({ moduleKey, access }) {
  const mod = moduleByKey(moduleKey);
  const { Icon } = mod;
  return (
    <>
      <div className="page-head">
        <h1>{mod.label}</h1>
        <p>{mod.summary}</p>
      </div>
      <section className="panel">
        <div className="empty">
          <span className="empty__icon">
            <Icon size={20} strokeWidth={1.75} />
          </span>
          <strong>Not built yet</strong>
          <span>{mod.plan ?? "Planned in a later phase."}</span>
          <span className="access-chip">{LEVEL_LABELS[access]}</span>
        </div>
      </section>
    </>
  );
}
