// Shared helper: count rows per store in the Study's IndexedDB from a Playwright page.
//   const counts = await idbCounts(page, ["skill_evidence", "error_events"]);
export async function idbCounts(page, stores) {
  return page.evaluate(async (names) => {
    const dbs = await indexedDB.databases();
    const target = dbs.map((d) => d.name).find((n) => n && n.startsWith("the-study"));
    if (!target) return { error: "no database", dbs: dbs.map((d) => d.name) };
    const db = await new Promise((res, rej) => {
      const r = indexedDB.open(target);
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
    const out = { database: target };
    for (const name of names) {
      if (!db.objectStoreNames.contains(name)) {
        out[name] = null;
        continue;
      }
      out[name] = await new Promise((res, rej) => {
        const tx = db.transaction(name, "readonly");
        const req = tx.objectStore(name).getAll();
        req.onsuccess = () => res(req.result);
        req.onerror = () => rej(req.error);
      });
    }
    db.close();
    return out;
  }, stores);
}
