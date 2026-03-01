const Database = require("better-sqlite3");

const DB_NAME = "ciber_cortes.db";

// ====== PRECIOS ======
const PRECIO_COPIA_KYOCERA = 1.0;
const PRECIO_IMP_KYOCERA   = 1.5;
const PRECIO_IMP_KYO_COLOR   = 1.4;

const GASTO_CATS = [
  "Luz", "Renta", "Internet/Telefonía", "Insumos (papel/tinta)",
  "Mantenimiento", "Sueldos", "Transporte", "Otros"
];

function createDbApi({ dbPath }) {
  const db = new Database(dbPath);

  function ensureColumn(table, col, coltypeSql) {
    const cols = db.prepare(`PRAGMA table_info(${table})`).all().map(r => r.name);
    if (!cols.includes(col)) db.prepare(`ALTER TABLE ${table} ADD COLUMN ${col} ${coltypeSql}`).run();
  }

  function init_db_and_migrate() {
    db.prepare(`
      CREATE TABLE IF NOT EXISTS cortes (
        fecha TEXT PRIMARY KEY,
        recargas REAL DEFAULT 0,
        ciber REAL DEFAULT 0,
        rfc REAL DEFAULT 0,
        actas REAL DEFAULT 0,
        color_variable REAL DEFAULT 0,
        otros REAL DEFAULT 0,
        retiro_caja REAL DEFAULT 0,
        caja_inicial REAL DEFAULT 0,
        caja_real REAL DEFAULT 0,
        notas TEXT
      )
    `).run();

    db.prepare(`CREATE TABLE IF NOT EXISTS contadores (fecha TEXT PRIMARY KEY)`).run();

    db.prepare(`
      CREATE TABLE IF NOT EXISTS gastos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fecha TEXT NOT NULL,
        categoria TEXT NOT NULL,
        monto REAL NOT NULL CHECK(monto >= 0),
        nota TEXT
      )
    `).run();

    ensureColumn("contadores", "lect_copia_kyocera", "REAL DEFAULT 0");
    ensureColumn("contadores", "lect_imp_kyocera",   "REAL DEFAULT 0");
    ensureColumn("contadores", "lect_imp_kyo_c",   "REAL DEFAULT 0");
    ensureColumn("contadores", "notas",              "TEXT");

    db.prepare(`CREATE INDEX IF NOT EXISTS idx_gastos_fecha ON gastos(fecha)`).run();

    return {
      ok: true,
      dbPath,
      precios: { PRECIO_COPIA_KYOCERA, PRECIO_IMP_KYOCERA, PRECIO_IMP_KYO_COLOR },
      gastoCats: GASTO_CATS
    };
  }

  function upsert_corte(p) {
    db.prepare(`
      INSERT INTO cortes (
        fecha, recargas, ciber, rfc, actas, color_variable, otros,
        retiro_caja, caja_inicial, caja_real, notas
      ) VALUES (
        @fecha, @recargas, @ciber, @rfc, @actas, @color_variable, @otros,
        @retiro_caja, @caja_inicial, @caja_real, @notas
      )
      ON CONFLICT(fecha) DO UPDATE SET
        recargas=excluded.recargas,
        ciber=excluded.ciber,
        rfc=excluded.rfc,
        actas=excluded.actas,
        color_variable=excluded.color_variable,
        otros=excluded.otros,
        retiro_caja=excluded.retiro_caja,
        caja_inicial=excluded.caja_inicial,
        caja_real=excluded.caja_real,
        notas=excluded.notas
    `).run(p);
    return { ok: true };
  }

  function upsert_contadores(p) {
    db.prepare(`
      INSERT INTO contadores (fecha, lect_copia_kyocera, lect_imp_kyocera, lect_imp_kyo_c, notas)
      VALUES (@fecha, @lect_copia_kyocera, @lect_imp_kyocera, @lect_imp_kyo_c, @notas)
      ON CONFLICT(fecha) DO UPDATE SET
        lect_copia_kyocera=excluded.lect_copia_kyocera,
        lect_imp_kyocera=excluded.lect_imp_kyocera,
        lect_imp_kyo_c=excluded.lect_imp_kyo_c,
        notas=excluded.notas
    `).run(p);
    return { ok: true };
  }

  function get_corte(fecha) {
    return db.prepare(`
      SELECT recargas, ciber, rfc, actas, color_variable, otros,
             retiro_caja, caja_inicial, caja_real, COALESCE(notas,'') as notas
      FROM cortes WHERE fecha=?
    `).get(fecha) || null;
  }

  function get_lectura(fecha) {
    return db.prepare(`
      SELECT lect_copia_kyocera, lect_imp_kyocera, lect_imp_kyo_c
      FROM contadores WHERE fecha=?
    `).get(fecha) || null;
  }

  function get_lectura_anterior(fecha) {
    return db.prepare(`
      SELECT fecha, lect_copia_kyocera, lect_imp_kyocera, lect_imp_kyo_c
      FROM contadores
      WHERE fecha < ?
      ORDER BY fecha DESC
      LIMIT 1
    `).get(fecha) || null;
  }

  function add_gasto({ fecha, categoria, monto, nota }) {
    db.prepare(`INSERT INTO gastos (fecha, categoria, monto, nota) VALUES (?, ?, ?, ?)`)
      .run(fecha, categoria, Number(monto), nota || "");
    return { ok: true };
  }

  function delete_gasto(id) {
    db.prepare(`DELETE FROM gastos WHERE id=?`).run(Number(id));
    return { ok: true };
  }

  function list_gastos(fecha) {
    return db.prepare(`
      SELECT id, categoria, monto, COALESCE(nota,'') as nota
      FROM gastos
      WHERE fecha=?
      ORDER BY id DESC
    `).all(fecha);
  }

  function total_gastos(fecha) {
    const r = db.prepare(`SELECT SUM(monto) as s FROM gastos WHERE fecha=?`).get(fecha);
    return Number(r?.s || 0);
  }

  function detalle_dia(fecha) {
    const hoy = get_lectura(fecha) || { lect_copia_kyocera: 0, lect_imp_kyocera: 0, lect_imp_kyo_c: 0 };
    const prev = get_lectura_anterior(fecha);
    const prev_fecha = prev?.fecha || "(sin anterior)";

    const prev_copia = prev?.lect_copia_kyocera || 0;
    const prev_imp_k = prev?.lect_imp_kyocera || 0;
    const prev_imp_b = prev?.lect_imp_kyo_c || 0;

    const d_copia = Math.max(0, Number(hoy.lect_copia_kyocera) - Number(prev_copia));
    const d_imp_k = Math.max(0, Number(hoy.lect_imp_kyocera) - Number(prev_imp_k));
    const d_imp_ky_c = Math.max(0, Number(hoy.lect_imp_kyo_c) - Number(prev_imp_b));

    const venta_copia = d_copia * PRECIO_COPIA_KYOCERA;
    const venta_imp_k = d_imp_k * PRECIO_IMP_KYOCERA;
    const venta_imp_ky_c = d_imp_ky_c * PRECIO_IMP_KYO_COLOR;

    const corte = get_corte(fecha) || {
      recargas: 0, ciber: 0, rfc: 0, actas: 0, color_variable: 0, otros: 0,
      retiro_caja: 0, caja_inicial: 0, caja_real: 0, notas: ""
    };

    const ingresos_manual =
      Number(corte.recargas) + Number(corte.ciber) + Number(corte.rfc) +
      Number(corte.actas) + Number(corte.color_variable) + Number(corte.otros);

    const ingresos_cont = venta_copia + venta_imp_k + venta_imp_ky_c;
    const ingresos_total = ingresos_manual + ingresos_cont;

    const gastos = total_gastos(fecha);

    const caja_teorica = Number(corte.caja_inicial) + ingresos_total - gastos - Number(corte.retiro_caja);
    const dif_caja = Number(corte.caja_real) - caja_teorica;

    return {
      fecha,
      prev_fecha,
      difs: [d_copia, d_imp_k, d_imp_ky_c],
      ventas_cont: [venta_copia, venta_imp_k, venta_imp_ky_c],
      manual_ing: [corte.recargas, corte.ciber, corte.rfc, corte.actas, corte.color_variable, corte.otros],
      gastos_total: gastos,
      gastos_detalle: list_gastos(fecha),
      caja: [corte.retiro_caja, corte.caja_inicial, corte.caja_real, caja_teorica, dif_caja],
      notas: corte.notas,
      ingresos: [ingresos_manual, ingresos_cont, ingresos_total]
    };
  }

  return {
    init_db_and_migrate,
    upsert_corte,
    upsert_contadores,
    get_corte,
    get_lectura,
    add_gasto,
    delete_gasto,
    list_gastos,
    total_gastos,
    detalle_dia
  };
}

module.exports = { createDbApi, DB_NAME };