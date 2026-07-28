import { useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, View, Text, Pressable } from "react-native";
import Svg, {
  Rect,
  Path,
  Circle,
  Ellipse,
  G,
  Polyline,
  Defs,
  LinearGradient,
  Stop,
  Line,
  Text as SvgText,
} from "react-native-svg";
import {
  AlertOctagon,
  AlertTriangle,
  CircleCheck,
  CircleGauge,
  Fuel,
  Gauge,
  MapPinOff,
  Timer,
  Wrench,
} from "lucide-react-native";

/* ============================================================================
 *  PALETTE
 * ==========================================================================*/
const ACC = "#C9A96A";
const INK = "#E6E9EB";
const MUT = "#8A929A";
const S_COURSE = "#C9A96A";
const S_APPRO = "#7FB2E5";
const S_DISPO = "#6FBF8B";
const S_HORS = "#6B737B";
const RED = "#D9635B";
const AMB = "#D9A85B";
const GRN = "#6FBF8B";
const MONO = "IBM Plex Mono, ui-monospace, Menlo, monospace";

type StatusKey = "course" | "approche" | "dispo" | "hors";
const ST: Record<StatusKey, { label: string; color: string; bg: string }> = {
  course: { label: "En course", color: S_COURSE, bg: "rgba(201,169,106,.12)" },
  approche: { label: "En approche", color: S_APPRO, bg: "rgba(127,178,229,.12)" },
  dispo: { label: "Disponible", color: S_DISPO, bg: "rgba(111,191,139,.12)" },
  hors: { label: "Hors service", color: S_HORS, bg: "rgba(107,115,123,.14)" },
};

/* ============================================================================
 *  TRAJETS + FLOTTE
 * ==========================================================================*/
const ROUTES: Record<string, [number, number][]> = {
  r1: [[822, 148], [700, 196], [566, 262], [430, 336], [300, 410], [176, 478], [96, 528]],
  r2: [[706, 470], [624, 428], [540, 384], [452, 340], [372, 304], [300, 282]],
  r3: [[858, 540], [784, 486], [706, 424], [624, 364], [544, 306], [470, 262]],
  r4: [[292, 180], [398, 150], [520, 138], [642, 158], [744, 200], [820, 248]],
  r5: [[404, 478], [492, 446], [586, 418], [678, 396], [762, 372]],
  r6: [[188, 300], [236, 286], [286, 276]],
};

type Vehicle = {
  id: string; plate: string; model: string;
  driver: string; driverId: string; nfc: string;
  status: StatusKey; route: keyof typeof ROUTES;
  t: number; spd: number; fuel: number; cap: number;
  odo: number; hours: number; vin: string;
  booking: string; client: string; pickup: string; dropoff: string;
  eta: number | null;
  dtc: string[]; oil: number; tires: [number, number, number, number]; dayL: number;
};

const FLEET_SEED: Vehicle[] = [
  { id: "v1", plate: "L52 KHR", model: "Mercedes-Benz S 580 4MATIC", driver: "Yannick Pelletier", driverId: "NFC-0417", nfc: "07 h 12",
    status: "course", route: "r1", t: 0.34, spd: 62, fuel: 58, cap: 76, odo: 84210, hours: 3184, vin: "…7F42",
    booking: "BK-2026-0731", client: "Groupe Laverdure", pickup: "Ritz-Carlton, 1228 rue Sherbrooke O.", dropoff: "Aéroport Montréal-Trudeau, 975 boul. Roméo-Vachon N.",
    eta: 11, dtc: [], oil: 4120, tires: [238, 241, 236, 234], dayL: 18.4 },
  { id: "v2", plate: "H84 LRT", model: "BMW 760i xDrive", driver: "Marie-Ève Gagnon", driverId: "NFC-0392", nfc: "06 h 48",
    status: "approche", route: "r3", t: 0.52, spd: 41, fuel: 34, cap: 82, odo: 61870, hours: 2410, vin: "…2C18",
    booking: "BK-2026-0736", client: "Fiducie Beauchamp", pickup: "Casino de Montréal, 1 av. du Casino", dropoff: "Hôtel Le Mount Stephen, 1440 rue Drummond",
    eta: 4, dtc: [], oil: 1180, tires: [242, 239, 231, 228], dayL: 22.1 },
  { id: "v3", plate: "K19 QNV", model: "Cadillac Escalade ESV Platinum", driver: "Sébastien Lavoie", driverId: "NFC-0455", nfc: "08 h 03",
    status: "course", route: "r2", t: 0.18, spd: 54, fuel: 71, cap: 108, odo: 39640, hours: 1622, vin: "…9B05",
    booking: "BK-2026-0729", client: "Nordvest Capital", pickup: "Gare Centrale, 895 rue de la Gauchetière O.", dropoff: "1 Place Ville Marie",
    eta: 17, dtc: ["P0420"], oil: 620, tires: [244, 246, 240, 243], dayL: 31.8 },
  { id: "v4", plate: "F73 XBD", model: "Mercedes-Maybach GLS 600", driver: "Jean-François Bergeron", driverId: "NFC-0361", nfc: "07 h 55",
    status: "approche", route: "r4", t: 0.62, spd: 37, fuel: 17, cap: 90, odo: 52305, hours: 2088, vin: "…4D77",
    booking: "BK-2026-0740", client: "Maison Duquette", pickup: "1440 rue Sainte-Catherine O.", dropoff: "Le Windsor, 1170 rue Peel",
    eta: 6, dtc: [], oil: 2960, tires: [236, 233, 229, 241], dayL: 26.5 },
  { id: "v5", plate: "C46 TPM", model: "Audi A8 L 60 TFSI", driver: "Chloé Thériault", driverId: "NFC-0428", nfc: "09 h 21",
    status: "dispo", route: "r5", t: 0.44, spd: 0, fuel: 88, cap: 82, odo: 28914, hours: 1104, vin: "…6E31",
    booking: "—", client: "Aucune réservation", pickup: "En attente · secteur Griffintown", dropoff: "—",
    eta: null, dtc: [], oil: 5480, tires: [240, 240, 238, 239], dayL: 9.2 },
  { id: "v6", plate: "B08 WRJ", model: "Lincoln Navigator L Black Label", driver: "Alexandre Fortin", driverId: "NFC-0303", nfc: "06 h 30",
    status: "hors", route: "r6", t: 0.5, spd: 0, fuel: 46, cap: 106, odo: 97452, hours: 3902, vin: "…1A64",
    booking: "—", client: "Immobilisé — atelier Westmount", pickup: "Atelier partenaire, 4855 rue Sherbrooke O.", dropoff: "—",
    eta: null, dtc: ["P0171", "P0301"], oil: -180, tires: [228, 231, 196, 235], dayL: 3.4 },
];

/* ============================================================================
 *  PÉRIODES + ALERTES
 * ==========================================================================*/
type PeriodKey = "heure" | "jour" | "semaine" | "mois" | "trimestre" | "annee";
const PERIODS: { key: PeriodKey; label: string; mult: number; km: number; dead: number; sub: string }[] = [
  { key: "heure", label: "Heure", mult: 1, km: 118, dead: 0.31, sub: "dernière heure" },
  { key: "jour", label: "Jour", mult: 11.4, km: 1342, dead: 0.28, sub: "depuis 00 h 00" },
  { key: "semaine", label: "Semaine", mult: 74, km: 8710, dead: 0.26, sub: "7 derniers jours" },
  { key: "mois", label: "Mois", mult: 312, km: 36740, dead: 0.27, sub: "juillet 2026" },
  { key: "trimestre", label: "Trimestre", mult: 946, km: 111280, dead: 0.29, sub: "T3 2026" },
  { key: "annee", label: "Année", mult: 3820, km: 449600, dead: 0.28, sub: "2026 à ce jour" },
];

type AlertKind = "engine" | "fuel" | "maint" | "speed" | "brake" | "geo" | "idle" | "tire";
type Severity = "crit" | "warn" | "info";
const ALERT_POOL: { k: AlertKind; text: string; sev: Severity }[] = [
  { k: "engine", text: "Code moteur actif — diagnostic requis (P0301)", sev: "crit" },
  { k: "fuel", text: "Niveau d'essence sous 20 % — ravitaillement conseillé", sev: "warn" },
  { k: "maint", text: "Entretien dû — intervalle de vidange dépassé", sev: "warn" },
  { k: "speed", text: "Excès de vitesse — 94 km/h dans une zone de 70", sev: "crit" },
  { k: "brake", text: "Freinage brusque détecté — boul. René-Lévesque", sev: "warn" },
  { k: "geo", text: "Arrêt prolongé hors géofence — 14 min, secteur Sud-Ouest", sev: "info" },
  { k: "idle", text: "Marche au ralenti prolongée — 9 min moteur tournant", sev: "info" },
  { k: "tire", text: "Pression pneu arrière gauche basse — 196 kPa", sev: "warn" },
];
const SEV: Record<Severity, { fg: string; bg: string }> = {
  crit: { fg: RED, bg: "rgba(217,99,91,.13)" },
  warn: { fg: AMB, bg: "rgba(217,168,91,.13)" },
  info: { fg: S_APPRO, bg: "rgba(127,178,229,.12)" },
};

type IconCmp = React.ComponentType<{ size?: number; color?: string }>;
const ALERT_ICON: Record<AlertKind, IconCmp> = {
  engine: AlertOctagon,
  fuel: Fuel,
  maint: Wrench,
  speed: Gauge,
  brake: AlertTriangle,
  geo: MapPinOff,
  idle: Timer,
  tire: CircleGauge,
};

/* ============================================================================
 *  HELPERS
 * ==========================================================================*/
const fmt = (n: number, d = 0) =>
  n.toLocaleString("fr-CA", { minimumFractionDigits: d, maximumFractionDigits: d });
const hhmm = (m: number) =>
  String(Math.floor(m / 60) % 24).padStart(2, "0") + " h " +
  String(Math.floor(m) % 60).padStart(2, "0");

function posOf(v: Vehicle) {
  const pts = ROUTES[v.route];
  const seg = Math.min(pts.length - 2, Math.floor(v.t * (pts.length - 1)));
  const local = v.t * (pts.length - 1) - seg;
  const a = pts[seg];
  const b = pts[seg + 1];
  return {
    x: a[0] + (b[0] - a[0]) * local,
    y: a[1] + (b[1] - a[1]) * local,
    rot: (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI + 90,
  };
}

type Enriched = {
  v: Vehicle;
  st: (typeof ST)[StatusKey];
  fuelPct: number;
  fuelColor: string;
  flags: { kind: "engine" | "wrench" | "fuel"; fg: string; bg: string }[];
  litres: number;
  color: string;
  initials: string;
  costKm: number;
};

/* ============================================================================
 *  COMPOSANT PRINCIPAL
 * ==========================================================================*/
export default function SuiviFlotteScreen() {
  const [veh, setVeh] = useState<Vehicle[]>(() => FLEET_SEED.map((v) => ({ ...v })));
  const [sel, setSel] = useState<string>("v1");
  const [period, setPeriod] = useState<PeriodKey>("jour");
  const [filter, setFilter] = useState<StatusKey | "tous">("tous");
  const [sortK, setSortK] = useState<"statut" | "essence" | "vitesse">("statut");
  const [tick, setTick] = useState(0);
  const [minutes, setMinutes] = useState(9 * 60 + 47);
  const [age, setAge] = useState(0);
  const [alerts, setAlerts] = useState<{ id: string; k: AlertKind; text: string; sev: Severity; plate: string; time: string }[]>([]);

  useEffect(() => {
    const iv = setInterval(() => {
      setTick((t) => t + 1);
      setMinutes((m) => m + 0.55);
      setAge(0);
      setVeh((s) =>
        s.map((v) => {
          if (v.status === "hors") return v;
          const pts = ROUTES[v.route];
          const idle = v.status === "dispo";
          const step = idle
            ? 0
            : (0.9 + Math.sin((tick + (v.odo % 7)) / 3) * 0.35) / (pts.length * 9);
          let t = v.t + step;
          if (t > 1) t = 0;
          const jitter = Math.sin((tick + (v.hours % 11)) / 2.4);
          const spd = idle ? 0 : Math.max(8, Math.round(v.spd + jitter * 9));
          return {
            ...v,
            t,
            spd,
            fuel: Math.max(4, v.fuel - (idle ? 0.004 : 0.021)),
            dayL: v.dayL + (idle ? 0.004 : 0.02),
          };
        }),
      );
    }, 2000);
    return () => clearInterval(iv);
  }, [tick]);

  useEffect(() => {
    const iv = setInterval(() => setAge((a) => a + 1), 1000);
    return () => clearInterval(iv);
  }, []);

  const to = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const queue = (delay: number) => {
      to.current = setTimeout(() => {
        const pool = ALERT_POOL[Math.floor(Math.random() * ALERT_POOL.length)];
        const vv = veh[Math.floor(Math.random() * veh.length)];
        setAlerts((prev) =>
          [{ ...pool, id: "a" + Date.now(), plate: vv.plate, time: hhmm(minutes) }, ...prev].slice(0, 14),
        );
        queue(20_000 + Math.random() * 10_000);
      }, delay);
    };
    queue(6000);
    return () => {
      if (to.current) clearTimeout(to.current);
    };
  }, [veh, minutes]);

  const derived = useMemo(() => {
    const p = PERIODS.find((x) => x.key === period) ?? PERIODS[1];

    const enriched: Enriched[] = veh.map((v, i) => {
      const st = ST[v.status];
      const fuelPct = Math.round(v.fuel);
      const fuelColor = fuelPct < 20 ? RED : fuelPct < 35 ? AMB : "#C6CCD2";
      const flags: { kind: "engine" | "wrench" | "fuel"; fg: string; bg: string }[] = [];
      if (v.dtc.length) flags.push({ kind: "engine", fg: RED, bg: "rgba(217,99,91,.14)" });
      if (v.oil <= 0) flags.push({ kind: "wrench", fg: AMB, bg: "rgba(217,168,91,.14)" });
      if (fuelPct < 20) flags.push({ kind: "fuel", fg: AMB, bg: "rgba(217,168,91,.14)" });
      const litres = +(v.dayL * p.mult / 11.4).toFixed(1);
      return {
        v, st, fuelPct, fuelColor, flags, litres,
        color: v.status === "course" ? ACC : st.color,
        initials: v.driver.split(" ").map((w) => w[0]).join("").slice(0, 2),
        costKm: +(litres * 1.79 / Math.max(1, (p.km / 6) * (0.82 + i * 0.06))).toFixed(2),
      };
    });

    const counts = {
      tous: enriched.length,
      course: enriched.filter((e) => e.v.status === "course").length,
      approche: enriched.filter((e) => e.v.status === "approche").length,
      dispo: enriched.filter((e) => e.v.status === "dispo").length,
      hors: enriched.filter((e) => e.v.status === "hors").length,
    };

    const order = { course: 0, approche: 1, dispo: 2, hors: 3 } as const;
    let list = enriched.filter((e) => filter === "tous" || e.v.status === filter);
    list = list.slice().sort((a, b) =>
      sortK === "essence" ? a.fuelPct - b.fuelPct
        : sortK === "vitesse" ? b.v.spd - a.v.spd
          : order[a.v.status] - order[b.v.status],
    );

    const sv = enriched.find((e) => e.v.id === sel) ?? enriched[0];

    const litresTot = +enriched.reduce((s, e) => s + e.litres, 0).toFixed(p.mult < 2 ? 1 : 0);
    const cost = litresTot * 1.79;
    const km = p.km;
    const deadKm = Math.round(km * p.dead);

    const maxL = Math.max(...enriched.map((e) => e.litres));
    const maxC = Math.max(...enriched.map((e) => e.costKm));

    return { p, enriched, counts, list, sv, litresTot, cost, km, deadKm, maxL, maxC };
  }, [veh, period, filter, sortK, sel]);

  const { p, enriched, counts, list, sv, litresTot, cost, km, deadKm, maxL, maxC } = derived;

  return (
    <View style={{ flex: 1, backgroundColor: "#0E1113" }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ minWidth: 1460 }}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, minWidth: 1460, backgroundColor: "#0E1113" }}>
          {/* ==================== EN-TÊTE ==================== */}
          <View style={{ backgroundColor: "#12161A", borderBottomWidth: 1, borderBottomColor: "#22282D" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 18, paddingHorizontal: 20, height: 54, borderBottomWidth: 1, borderBottomColor: "#1B2126" }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <View style={{
                  width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: ACC,
                  alignItems: "center", justifyContent: "center",
                }}>
                  <Text style={{ color: ACC, fontSize: 11, fontFamily: MONO, fontWeight: "500" }}>M</Text>
                </View>
                <View style={{ flexDirection: "column" }}>
                  <Text style={{ color: INK, fontSize: 13.5, fontWeight: "600", letterSpacing: 0.13 }}>MÉRIDIEN</Text>
                  <Text style={{ color: "#7B838B", fontSize: 9.5, fontFamily: MONO, letterSpacing: 1.3, textTransform: "uppercase" }}>
                    Suivi de flotte
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingLeft: 18, borderLeftWidth: 1, borderLeftColor: "#22282D", height: 30 }}>
                <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: S_DISPO }} />
                <Text style={{ color: MUT, fontSize: 11.5, fontFamily: MONO }}>Flux Geotab GO10 · 840 ms</Text>
              </View>

              <View style={{ marginLeft: "auto", flexDirection: "row", alignItems: "center", gap: 14 }}>
                <View style={{ flexDirection: "row", backgroundColor: "#171C21", borderWidth: 1, borderColor: "#22282D", borderRadius: 8, padding: 2 }}>
                  {PERIODS.map((pp) => {
                    const on = pp.key === period;
                    return (
                      <Pressable
                        key={pp.key}
                        onPress={() => setPeriod(pp.key)}
                        style={{
                          paddingHorizontal: 11, paddingVertical: 6, borderRadius: 6,
                          backgroundColor: on ? ACC : "transparent",
                        }}
                      >
                        <Text style={{ color: on ? "#0E1113" : MUT, fontSize: 12, fontWeight: "500" }}>{pp.label}</Text>
                      </Pressable>
                    );
                  })}
                </View>
                <Text style={{ color: MUT, fontSize: 12, fontFamily: MONO }}>{hhmm(minutes)}</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 9, paddingLeft: 14, borderLeftWidth: 1, borderLeftColor: "#22282D", height: 30 }}>
                  <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: "#1D2429", alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ color: ACC, fontSize: 10.5, fontFamily: MONO, fontWeight: "500" }}>SR</Text>
                  </View>
                  <View style={{ flexDirection: "column" }}>
                    <Text style={{ color: INK, fontSize: 12, fontWeight: "500" }}>Sophie Rivard</Text>
                    <Text style={{ color: "#7B838B", fontSize: 10.5 }}>Répartitrice · quart de jour</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* KPI band */}
            <View style={{ flexDirection: "row", backgroundColor: "#1E242A" }}>
              {[
                { label: "Véhicules actifs", value: (counts.course + counts.approche) + "/6", unit: "", sub: `${counts.dispo} disponible · ${counts.hors} hors service`, color: INK },
                { label: "Litres consommés", value: fmt(litresTot, p.mult < 2 ? 1 : 0), unit: "L", sub: p.sub, color: INK },
                { label: "Coût carburant", value: fmt(cost, cost < 500 ? 2 : 0) + " $", unit: "CAD", sub: "1,79 $ / L · ordinaire", color: ACC },
                { label: "Km parcourus", value: fmt(km), unit: "km", sub: fmt(km / 6, 0) + " km par véhicule", color: INK },
                { label: "Km à vide", value: fmt(deadKm), unit: "km", sub: Math.round(p.dead * 100) + " % à vide · " + fmt(km - deadKm) + " km facturables", color: p.dead > 0.28 ? AMB : INK },
                { label: "Coût moyen au km", value: (cost / km).toFixed(2).replace(".", ",") + " $", unit: "/ km", sub: "carburant seulement", color: INK },
              ].map((k, i) => (
                <View key={k.label} style={{ flex: 1, backgroundColor: "#12161A", paddingHorizontal: 18, paddingTop: 13, paddingBottom: 15, marginLeft: i === 0 ? 0 : 1, gap: 9 }}>
                  <Text style={{ color: "#727A82", fontSize: 9.5, fontFamily: MONO, letterSpacing: 1.14, textTransform: "uppercase", fontWeight: "500" }}>{k.label}</Text>
                  <View style={{ flexDirection: "row", alignItems: "baseline", gap: 7 }}>
                    <Text style={{ color: k.color, fontSize: 22, fontFamily: MONO, fontWeight: "500", letterSpacing: -0.44 }}>{k.value}</Text>
                    {k.unit ? <Text style={{ color: "#7B838B", fontSize: 11 }}>{k.unit}</Text> : null}
                  </View>
                  <Text style={{ color: "#8A929A", fontSize: 11 }} numberOfLines={1}>{k.sub}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* ==================== 3 COLONNES ==================== */}
          <View style={{ flexDirection: "row", height: 672 }}>
            {/* COL 1 : LISTE */}
            <View style={{ width: 306, backgroundColor: "#12161A", borderRightWidth: 1, borderRightColor: "#22282D" }}>
              <View style={{ padding: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: "#1B2126" }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={{ color: INK, fontSize: 12.5, fontWeight: "600" }}>Flotte</Text>
                  <Text style={{ marginLeft: "auto", color: "#7B838B", fontSize: 11, fontFamily: MONO }}>{enriched.length} véhicules</Text>
                </View>

                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 5, marginTop: 11 }}>
                  {([
                    { key: "tous", label: "Tous", dot: "#4A525A" },
                    { key: "course", label: ST.course.label, dot: ACC },
                    { key: "approche", label: ST.approche.label, dot: S_APPRO },
                    { key: "dispo", label: ST.dispo.label, dot: S_DISPO },
                    { key: "hors", label: ST.hors.label, dot: S_HORS },
                  ] as const).map((f) => {
                    const on = filter === f.key;
                    return (
                      <Pressable
                        key={f.key}
                        onPress={() => setFilter(f.key as any)}
                        style={{
                          flexDirection: "row", alignItems: "center", gap: 6,
                          paddingHorizontal: 9, paddingVertical: 5,
                          borderWidth: 1, borderColor: on ? "#333A41" : "#22282D", borderRadius: 6,
                          backgroundColor: on ? "#1F2429" : "transparent",
                        }}
                      >
                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: f.dot }} />
                        <Text style={{ color: on ? INK : MUT, fontSize: 11, fontWeight: "500" }}>{f.label}</Text>
                        <Text style={{ color: on ? INK : MUT, fontSize: 10, fontFamily: MONO, opacity: 0.65 }}>
                          {counts[f.key as keyof typeof counts]}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 11 }}>
                  <Text style={{ color: "#727A82", fontSize: 9.5, fontFamily: MONO, letterSpacing: 0.95, textTransform: "uppercase", fontWeight: "500" }}>Trier</Text>
                  {([{ k: "statut", l: "Statut" }, { k: "essence", l: "Essence" }, { k: "vitesse", l: "Vitesse" }] as const).map((s) => {
                    const on = sortK === s.k;
                    return (
                      <Pressable
                        key={s.k}
                        onPress={() => setSortK(s.k)}
                        style={{
                          paddingHorizontal: 7, paddingVertical: 4, borderRadius: 5,
                          backgroundColor: on ? "#1F2429" : "transparent",
                        }}
                      >
                        <Text style={{ color: on ? INK : "#727A82", fontSize: 9.5, letterSpacing: 0.57, textTransform: "uppercase" }}>{s.l}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <ScrollView style={{ flex: 1 }}>
                {list.map((e) => (
                  <Pressable
                    key={e.v.id}
                    onPress={() => setSel(e.v.id)}
                    style={{
                      paddingHorizontal: 16, paddingVertical: 13,
                      borderBottomWidth: 1, borderBottomColor: "#191E23",
                      backgroundColor: sel === e.v.id ? "#1A1F24" : "transparent",
                      borderLeftWidth: 2, borderLeftColor: sel === e.v.id ? e.color : "transparent",
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <Text style={{ color: INK, fontSize: 12.5, fontFamily: MONO, fontWeight: "500" }}>{e.v.plate}</Text>
                      <View style={{
                        flexDirection: "row", alignItems: "center", gap: 5,
                        paddingHorizontal: 7, paddingVertical: 3, borderRadius: 20,
                        backgroundColor: e.st.bg,
                      }}>
                        <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: e.color }} />
                        <Text style={{ color: e.color, fontSize: 10.5, fontWeight: "500" }}>{e.st.label}</Text>
                      </View>
                      <View style={{ marginLeft: "auto", flexDirection: "row", gap: 4 }}>
                        {e.flags.map((fl, i) => {
                          const Icon = fl.kind === "engine" ? AlertOctagon : fl.kind === "wrench" ? Wrench : Fuel;
                          return (
                            <View
                              key={i}
                              style={{ width: 16, height: 16, borderRadius: 4, backgroundColor: fl.bg, alignItems: "center", justifyContent: "center" }}
                            >
                              <Icon size={10} color={fl.fg} />
                            </View>
                          );
                        })}
                      </View>
                    </View>

                    <Text style={{ color: MUT, fontSize: 12, marginTop: 7 }} numberOfLines={1}>{e.v.model}</Text>

                    <View style={{ flexDirection: "row", alignItems: "center", gap: 7, marginTop: 8 }}>
                      <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: "#1D2429", alignItems: "center", justifyContent: "center" }}>
                        <Text style={{ color: "#8A929A", fontSize: 8.5, fontFamily: MONO, fontWeight: "500" }}>{e.initials}</Text>
                      </View>
                      <Text style={{ color: "#8A929A", fontSize: 11.5, flex: 1 }} numberOfLines={1}>{e.v.driver}</Text>
                    </View>

                    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 10 }}>
                      <Text style={{ width: 60, color: "#C6CCD2", fontSize: 11.5, fontFamily: MONO }}>
                        {e.v.status === "hors" ? "immobilisé" : fmt(e.v.spd) + " km/h"}
                      </Text>
                      <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 7 }}>
                        <View style={{ flex: 1, height: 3, borderRadius: 2, backgroundColor: "#242A30", overflow: "hidden" }}>
                          <View style={{ height: "100%", borderRadius: 2, width: `${e.fuelPct}%`, backgroundColor: e.fuelColor }} />
                        </View>
                        <Text style={{ width: 30, textAlign: "right", color: e.fuelColor, fontSize: 11, fontFamily: MONO }}>{e.fuelPct} %</Text>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* COL 2 : MAP + CHART */}
            <View style={{ flex: 1, minWidth: 700 }}>
              <MapPanel enriched={enriched} sel={sel} onSelect={setSel} age={age} counts={counts} />
              <ChartPanel enriched={enriched} sel={sel} maxL={maxL} maxC={maxC} periodLabel={p.sub} />
            </View>

            {/* COL 3 : DETAIL + ALERTS */}
            <View style={{ width: 352, backgroundColor: "#12161A", borderLeftWidth: 1, borderLeftColor: "#22282D" }}>
              <DetailPanel e={sv} />
              <AlertsPanel alerts={alerts} />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

/* ============================================================================
 *  MAP
 * ==========================================================================*/
function MapPanel({
  enriched, sel, onSelect, age, counts,
}: {
  enriched: Enriched[]; sel: string; onSelect: (id: string) => void;
  age: number; counts: { course: number; approche: number; dispo: number; hors: number; tous: number };
}) {
  const svRoute = enriched.find((e) => e.v.id === sel);
  const endPt = svRoute ? ROUTES[svRoute.v.route][ROUTES[svRoute.v.route].length - 1] : null;

  return (
    <View style={{ flex: 1, minHeight: 440, backgroundColor: "#0B0E10", position: "relative", overflow: "hidden" }}>
      <Svg viewBox="0 0 1000 620" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
        <Defs>
          <LinearGradient id="water" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#122530" />
            <Stop offset="1" stopColor="#0F1D26" />
          </LinearGradient>
        </Defs>

        <Rect x="0" y="0" width="1000" height="620" fill="#13181C" />

        {/* Grille pivotée -19° */}
        <G rotation={-19} origin="500,310">
          <Rect x="-320" y="-220" width="1660" height="1080" fill="#151A1F" />
          <G stroke="#1B2126" strokeWidth="9" strokeLinecap="square">
            {[-40, 60, 160, 260, 360, 460, 560, 660, 760].map((y) => (
              <Line key={"h" + y} x1="-320" y1={y} x2="1340" y2={y} />
            ))}
            {[-160, -60, 40, 140, 240, 340, 440, 540, 640, 740, 840, 940, 1040, 1140, 1240].map((x) => (
              <Line key={"v" + x} x1={x} y1="-220" x2={x} y2="860" />
            ))}
          </G>
          <G stroke="#232A31" strokeWidth="18" strokeLinecap="square">
            <Line x1="-320" y1="110" x2="1340" y2="110" />
            <Line x1="-320" y1="410" x2="1340" y2="410" />
            <Line x1="390" y1="-220" x2="390" y2="860" />
            <Line x1="890" y1="-220" x2="890" y2="860" />
          </G>
          <G stroke="#2C343B" strokeWidth="26" strokeLinecap="square">
            <Line x1="-320" y1="310" x2="1340" y2="310" />
            <Line x1="640" y1="-220" x2="640" y2="860" />
          </G>
          <Ellipse cx="215" cy="150" rx="150" ry="95" fill="#161F1B" />
          <Ellipse cx="215" cy="150" rx="150" ry="95" fill="none" stroke="#1B241F" strokeWidth="2" />
          <Rect x="705" y="205" width="90" height="70" fill="#161F1B" />
        </G>

        {/* Fleuve St-Laurent */}
        <Path
          d="M 0 620 L 0 560 C 180 545 340 560 470 600 C 560 628 620 640 700 640 L 1000 640 L 1000 300 C 900 330 800 400 720 470 C 640 540 520 590 400 604 C 260 620 120 622 0 620 Z"
          fill="url(#water)"
        />
        <Path d="M 0 560 C 180 545 340 560 470 600 C 560 628 620 640 700 640" fill="none" stroke="#1C3340" strokeWidth="2" />
        <Path d="M 1000 300 C 900 330 800 400 720 470 C 640 540 520 590 400 604" fill="none" stroke="#1C3340" strokeWidth="2" />
        <Path d="M 745 585 L 800 545 L 880 560 L 905 610 L 830 630 L 755 615 Z" fill="#151E1B" stroke="#1C3340" strokeWidth="1.5" />

        {/* Deux ponts */}
        <G stroke="#2C343B" strokeWidth="7" fill="none" strokeLinecap="round">
          <Path d="M 618 640 C 640 600 660 570 700 545" />
          <Path d="M 470 620 C 500 580 520 545 545 505" />
        </G>

        {/* Étiquettes */}
        <G fontSize="10.5" fill="#5E676F">
          <SvgText x="128" y="112" rotation={-19} origin="128,112">BOUL. SAINT-LAURENT</SvgText>
          <SvgText x="118" y="316" rotation={-19} origin="118,316">RUE SHERBROOKE O.</SvgText>
          <SvgText x="470" y="252" rotation={-19} origin="470,252">BOUL. RENÉ-LÉVESQUE</SvgText>
          <SvgText x="595" y="150" rotation={71} origin="595,150">AV. DU PARC</SvgText>
          <SvgText x="843" y="205" rotation={71} origin="843,205">RUE PAPINEAU</SvgText>
          <SvgText x="118" y="188" rotation={-19} origin="118,188" fill="#4C5B54">PARC DU MONT-ROYAL</SvgText>
          <SvgText x="742" y="418" fill="#3E5A66">FLEUVE SAINT-LAURENT</SvgText>
          <SvgText x="792" y="592" fill="#4C5B54" fontSize="9.5">ÎLE STE-HÉLÈNE</SvgText>
        </G>

        {/* Trajets */}
        {enriched
          .filter((e) => e.v.status !== "hors" && e.v.status !== "dispo")
          .map((e) => {
            const isSel = e.v.id === sel;
            return (
              <Polyline
                key={"tr" + e.v.id}
                points={ROUTES[e.v.route].map((pt) => pt.join(",")).join(" ")}
                fill="none"
                stroke={isSel ? e.color : "#39424A"}
                strokeWidth={isSel ? 2 : 1.2}
                strokeDasharray={isSel ? undefined : "4 5"}
                opacity={0.5}
                strokeLinecap="round"
              />
            );
          })}

        {/* Pickup pour véhicule sélectionné */}
        {svRoute && endPt && (
          <G x={endPt[0]} y={endPt[1]}>
            <Circle cx="0" cy="0" r="4.5" fill="none" stroke={svRoute.color} strokeWidth="1.4" />
            <Circle cx="0" cy="0" r="1.6" fill={svRoute.color} />
          </G>
        )}

        {/* Marqueurs véhicules */}
        {enriched.map((e) => {
          const pos = posOf(e.v);
          const on = e.v.id === sel;
          const c = e.color;
          return (
            <G key={e.v.id} x={pos.x} y={pos.y} onPress={() => onSelect(e.v.id)}>
              {on && <Circle cx="0" cy="0" r="22" fill={c} opacity="0.07" />}
              {on && <Circle cx="0" cy="0" r="15" fill="none" stroke={c} strokeWidth="1" opacity="0.5" />}
              <Circle cx="0" cy="0" r="10" fill="#0E1113" stroke={c} strokeWidth={on ? 2 : 1.4} opacity="0.95" />
              {e.v.status === "hors" ? (
                <Rect x="-3" y="-3" width="6" height="6" rx="1" fill={c} />
              ) : (
                <Path d="M0 -5.6 L4.2 4.4 L0 2.1 L-4.2 4.4 Z" fill={c} rotation={pos.rot} origin="0,0" />
              )}
              <G x={15} y={-13}>
                <Rect x="0" y="0" width="62" height="18" rx="4" fill="rgba(14,17,19,0.82)" stroke={on ? c : "#22282D"} strokeWidth="1" />
                <SvgText x="8" y="12.5" fill={on ? INK : MUT} fontSize="10">{e.v.plate}</SvgText>
              </G>
            </G>
          );
        })}
      </Svg>

      {/* Légende (bas-gauche) */}
      <View style={{
        position: "absolute", left: 14, bottom: 14,
        flexDirection: "row", alignItems: "center", gap: 14,
        paddingHorizontal: 13, paddingVertical: 9,
        backgroundColor: "rgba(16,20,23,0.86)",
        borderWidth: 1, borderColor: "#22282D", borderRadius: 9,
      }}>
        {[
          { label: "En course", dot: ACC, count: counts.course },
          { label: "En approche", dot: S_APPRO, count: counts.approche },
          { label: "Disponible", dot: S_DISPO, count: counts.dispo },
          { label: "Hors service", dot: S_HORS, count: counts.hors },
        ].map((l) => (
          <View key={l.label} style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
            <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: l.dot }} />
            <Text style={{ color: MUT, fontSize: 11 }}>{l.label}</Text>
            <Text style={{ color: "#6B737B", fontSize: 10.5, fontFamily: MONO }}>{l.count}</Text>
          </View>
        ))}
      </View>

      {/* Fraîcheur (haut-droite) */}
      <View style={{
        position: "absolute", right: 14, top: 14,
        flexDirection: "row", alignItems: "center", gap: 9,
        paddingHorizontal: 12, paddingVertical: 8,
        backgroundColor: "rgba(16,20,23,0.86)",
        borderWidth: 1, borderColor: "#22282D", borderRadius: 9,
      }}>
        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: ACC }} />
        <Text style={{ color: MUT, fontSize: 11, fontFamily: MONO }}>Positions · maj {age} s</Text>
      </View>
    </View>
  );
}

/* ============================================================================
 *  CHART
 * ==========================================================================*/
function ChartPanel({
  enriched, sel, maxL, maxC, periodLabel,
}: { enriched: Enriched[]; sel: string; maxL: number; maxC: number; periodLabel: string }) {
  const bars = enriched.map((e) => ({
    plate: e.v.plate,
    litres: fmt(e.litres, e.litres < 100 ? 1 : 0) + " L",
    hPct: (e.litres / maxL) * 86,
    color: e.v.id === sel ? ACC : "#3E5A66",
    cost: e.costKm.toFixed(2).replace(".", ",") + " $",
  }));
  const costLine = enriched
    .map((e, i) => `${(i + 0.5) * (600 / enriched.length)},${(1 - e.costKm / (maxC * 1.25)) * 92 + 3}`)
    .join(" ");

  return (
    <View style={{
      height: 222, backgroundColor: "#12161A",
      borderTopWidth: 1, borderTopColor: "#22282D",
      paddingHorizontal: 18, paddingTop: 14, paddingBottom: 16,
    }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
        <Text style={{ color: INK, fontSize: 12.5, fontWeight: "600" }}>Carburant par véhicule</Text>
        <Text style={{ color: "#7B838B", fontSize: 11, fontFamily: MONO }}>{periodLabel}</Text>
        <View style={{ marginLeft: "auto", flexDirection: "row", alignItems: "center", gap: 14 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <View style={{ width: 9, height: 3, borderRadius: 2, backgroundColor: "#3E5A66" }} />
            <Text style={{ color: "#8A929A", fontSize: 11 }}>Litres consommés</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <View style={{ width: 9, height: 2, backgroundColor: ACC }} />
            <Text style={{ color: "#8A929A", fontSize: 11 }}>Coût au km</Text>
          </View>
        </View>
      </View>

      <View style={{ flex: 1, position: "relative", marginTop: 14 }}>
        {/* Filets horizontaux */}
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, justifyContent: "space-between" }} pointerEvents="none">
          <View style={{ height: 1, backgroundColor: "#1E242A" }} />
          <View style={{ height: 1, backgroundColor: "#1B2126" }} />
          <View style={{ height: 1, backgroundColor: "#1B2126" }} />
          <View style={{ height: 1, backgroundColor: "#1E242A" }} />
        </View>

        {/* Barres */}
        <View style={{ position: "absolute", top: 0, left: 6, right: 6, bottom: 0, flexDirection: "row", alignItems: "flex-end", gap: 22 }}>
          {bars.map((b, i) => (
            <View key={i} style={{ flex: 1, flexDirection: "column", alignItems: "center", gap: 7 }}>
              <Text style={{ color: "#8A929A", fontSize: 10.5, fontFamily: MONO }}>{b.litres}</Text>
              <View style={{ width: "100%", height: `${b.hPct}%`, borderTopLeftRadius: 3, borderTopRightRadius: 3, backgroundColor: b.color }} />
            </View>
          ))}
        </View>

        {/* Courbe coût/km */}
        <Svg viewBox="0 0 600 100" preserveAspectRatio="none" width="100%" height="100%" style={{ position: "absolute", top: 0, left: 0 }} pointerEvents="none">
          <Polyline fill="none" stroke={ACC} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" points={costLine} />
        </Svg>
      </View>

      <View style={{ flexDirection: "row", gap: 22, paddingHorizontal: 6, paddingTop: 10 }}>
        {bars.map((b, i) => (
          <View key={i} style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ color: "#C6CCD2", fontSize: 11, fontFamily: MONO, fontWeight: "500" }}>{b.plate}</Text>
            <Text style={{ color: "#6B737B", fontSize: 10.5, marginTop: 5 }}>{b.cost} / km</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/* ============================================================================
 *  DETAIL
 * ==========================================================================*/
function DetailPanel({ e }: { e: Enriched }) {
  const sv = e.v;
  const tires = ["AV G", "AV D", "AR G", "AR D"].map((pos, i) => {
    const kpa = sv.tires[i];
    const low = kpa < 210;
    const warn = kpa < 232;
    return {
      pos, kpa,
      fg: low ? RED : warn ? AMB : "#C6CCD2",
      border: low ? "rgba(217,99,91,0.4)" : "#22282D",
      bg: low ? "rgba(217,99,91,0.07)" : "transparent",
    };
  });
  const dtcLabel = sv.dtc.length
    ? `${sv.dtc.length} code${sv.dtc.length > 1 ? "s" : ""} moteur actif${sv.dtc.length > 1 ? "s" : ""}`
    : "Aucun code moteur actif";
  const dtcCodes = sv.dtc.length ? sv.dtc.join(" · ") : "DTC vide";
  const dtcFg = sv.dtc.length ? RED : GRN;
  const dtcBg = sv.dtc.length ? "rgba(217,99,91,0.07)" : "transparent";
  const DtcIcon = sv.dtc.length ? AlertOctagon : CircleCheck;
  const oilFg = sv.oil > 0 ? (sv.oil < 1000 ? AMB : "#C6CCD2") : RED;
  const oilText = sv.oil > 0 ? `dans ${fmt(sv.oil)} km` : `dépassée de ${fmt(-sv.oil)} km`;
  const etaBg = sv.eta ? (sv.eta <= 5 ? "rgba(201,169,106,0.14)" : "rgba(127,178,229,0.12)") : "rgba(107,115,123,0.14)";
  const etaFg = sv.eta ? (sv.eta <= 5 ? ACC : S_APPRO) : "#8A929A";
  const etaLabel = sv.eta ? `ETA ${sv.eta} min` : "Sans course";

  return (
    <ScrollView style={{ flex: 3, borderBottomWidth: 1, borderBottomColor: "#22282D" }}>
      <View style={{ padding: 18, paddingTop: 15 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 9 }}>
          <Text style={{ color: INK, fontSize: 13.5, fontFamily: MONO, fontWeight: "500" }}>{sv.plate}</Text>
          <View style={{
            flexDirection: "row", alignItems: "center", gap: 6,
            paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20,
            backgroundColor: e.st.bg,
          }}>
            <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: e.color }} />
            <Text style={{ color: e.color, fontSize: 10.5, fontWeight: "500" }}>{e.st.label}</Text>
          </View>
          <Text style={{ marginLeft: "auto", color: "#6B737B", fontSize: 10.5, fontFamily: MONO }}>{sv.vin}</Text>
        </View>
        <Text style={{ color: MUT, fontSize: 12.5, marginTop: 8 }}>{sv.model}</Text>

        {/* KPIs 2x2 */}
        <View style={{ marginTop: 15, borderWidth: 1, borderColor: "#22282D", borderRadius: 9, overflow: "hidden", backgroundColor: "#1E242A" }}>
          {[[0, 1], [2, 3]].map((row, ri) => {
            const cells = [
              { label: "Vitesse", value: sv.status === "hors" ? "0" : fmt(sv.spd), unit: "km/h", color: INK, big: true },
              { label: "Essence", value: String(e.fuelPct), unit: `% · ${fmt(sv.fuel / 100 * sv.cap, 1)} L`, color: e.fuelColor, big: true },
              { label: "Odomètre", value: fmt(sv.odo), unit: "km", color: INK, big: false },
              { label: "Heures moteur", value: fmt(sv.hours), unit: "h", color: INK, big: false },
            ];
            return (
              <View key={ri} style={{ flexDirection: "row", marginTop: ri === 0 ? 0 : 1 }}>
                {row.map((ci, idx) => {
                  const c = cells[ci];
                  return (
                    <View key={c.label} style={{ flex: 1, backgroundColor: "#161B20", padding: 13, marginLeft: idx === 0 ? 0 : 1 }}>
                      <Text style={{ color: "#727A82", fontSize: 9.5, fontFamily: MONO, letterSpacing: 1.05, textTransform: "uppercase", fontWeight: "500" }}>{c.label}</Text>
                      <View style={{ flexDirection: "row", alignItems: "baseline", gap: 5, marginTop: 9 }}>
                        <Text style={{ color: c.color, fontSize: c.big ? 21 : 15, fontFamily: MONO, fontWeight: "500" }}>{c.value}</Text>
                        <Text style={{ color: "#7B838B", fontSize: 10.5 }}>{c.unit}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            );
          })}
        </View>

        {/* Chauffeur */}
        <View style={{
          flexDirection: "row", alignItems: "center", gap: 11,
          borderWidth: 1, borderColor: "#22282D", borderRadius: 9,
          padding: 13, marginTop: 12,
        }}>
          <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: "#1D2429", alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: ACC, fontSize: 11, fontFamily: MONO, fontWeight: "500" }}>{e.initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: INK, fontSize: 12.5, fontWeight: "500" }}>{sv.driver}</Text>
            <Text style={{ color: "#7B838B", fontSize: 10.5, fontFamily: MONO, marginTop: 6 }}>Tap NFC {sv.nfc} · {sv.driverId}</Text>
          </View>
          <View style={{ paddingHorizontal: 7, paddingVertical: 4, backgroundColor: "rgba(111,191,139,0.1)", borderRadius: 5 }}>
            <Text style={{ color: S_DISPO, fontSize: 10.5, fontWeight: "500" }}>Identifié</Text>
          </View>
        </View>

        {/* Réservation */}
        <Text style={{ color: "#727A82", fontSize: 9.5, fontFamily: MONO, letterSpacing: 1.05, textTransform: "uppercase", fontWeight: "500", marginTop: 18, marginBottom: 10 }}>
          Réservation liée
        </Text>
        <View style={{ borderWidth: 1, borderColor: "#22282D", borderRadius: 9, padding: 13 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 9 }}>
            <Text style={{ color: ACC, fontSize: 11.5, fontFamily: MONO, fontWeight: "500" }}>{sv.booking}</Text>
            <View style={{ marginLeft: "auto", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, backgroundColor: etaBg }}>
              <Text style={{ color: etaFg, fontSize: 10.5, fontWeight: "500" }}>{etaLabel}</Text>
            </View>
          </View>
          <View style={{ marginTop: 12, gap: 9 }}>
            {[
              { l: "Client", v: sv.client },
              { l: "Prise en charge", v: sv.pickup },
              { l: "Destination", v: sv.dropoff },
            ].map((r) => (
              <View key={r.l} style={{ flexDirection: "row", gap: 10 }}>
                <Text style={{ color: "#727A82", fontSize: 12, width: 62 }}>{r.l}</Text>
                <Text style={{ color: "#D3D8DC", fontSize: 12, flex: 1, lineHeight: 17 }}>{r.v}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Santé */}
        <Text style={{ color: "#727A82", fontSize: 9.5, fontFamily: MONO, letterSpacing: 1.05, textTransform: "uppercase", fontWeight: "500", marginTop: 18, marginBottom: 10 }}>
          Santé du véhicule
        </Text>
        <View style={{ borderWidth: 1, borderColor: "#22282D", borderRadius: 9, overflow: "hidden" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, padding: 13, borderBottomWidth: 1, borderBottomColor: "#1B2126", backgroundColor: dtcBg }}>
            <DtcIcon size={14} color={dtcFg} />
            <Text style={{ color: dtcFg, fontSize: 12, fontWeight: "500" }}>{dtcLabel}</Text>
            <Text style={{ marginLeft: "auto", color: "#8A929A", fontSize: 11, fontFamily: MONO }}>{dtcCodes}</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", padding: 13, borderBottomWidth: 1, borderBottomColor: "#1B2126" }}>
            <Text style={{ color: MUT, fontSize: 12 }}>Prochaine vidange</Text>
            <Text style={{ marginLeft: "auto", color: oilFg, fontSize: 11.5, fontFamily: MONO }}>{oilText}</Text>
          </View>
          <View style={{ padding: 13 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={{ color: MUT, fontSize: 12 }}>Pression des pneus</Text>
              <Text style={{ marginLeft: "auto", color: "#6B737B", fontSize: 10.5, fontFamily: MONO }}>kPa · cible 240</Text>
            </View>
            <View style={{ marginTop: 11, gap: 8 }}>
              {[[0, 1], [2, 3]].map((row, ri) => (
                <View key={ri} style={{ flexDirection: "row", gap: 8 }}>
                  {row.map((idx) => {
                    const t = tires[idx];
                    return (
                      <View key={t.pos} style={{
                        flex: 1, flexDirection: "row", alignItems: "center", gap: 8,
                        borderWidth: 1, borderColor: t.border, borderRadius: 7,
                        paddingHorizontal: 10, paddingVertical: 8, backgroundColor: t.bg,
                      }}>
                        <Text style={{ color: "#727A82", fontSize: 9.5, fontFamily: MONO, letterSpacing: 0.76 }}>{t.pos}</Text>
                        <Text style={{ marginLeft: "auto", color: t.fg, fontSize: 12, fontFamily: MONO, fontWeight: "500" }}>{fmt(t.kpa)}</Text>
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Carburant du jour */}
        <View style={{ flexDirection: "row", marginTop: 12, backgroundColor: "#1E242A", borderWidth: 1, borderColor: "#22282D", borderRadius: 9, overflow: "hidden" }}>
          <View style={{ flex: 1, backgroundColor: "#161B20", padding: 13 }}>
            <Text style={{ color: "#727A82", fontSize: 9.5, fontFamily: MONO, letterSpacing: 1.05, textTransform: "uppercase", fontWeight: "500" }}>Carburant du jour</Text>
            <View style={{ flexDirection: "row", alignItems: "baseline", gap: 5, marginTop: 9 }}>
              <Text style={{ color: INK, fontSize: 16, fontFamily: MONO, fontWeight: "500" }}>{fmt(sv.dayL, 1)}</Text>
              <Text style={{ color: "#7B838B", fontSize: 10.5 }}>L</Text>
            </View>
          </View>
          <View style={{ flex: 1, backgroundColor: "#161B20", padding: 13, marginLeft: 1 }}>
            <Text style={{ color: "#727A82", fontSize: 9.5, fontFamily: MONO, letterSpacing: 1.05, textTransform: "uppercase", fontWeight: "500" }}>Coût estimé</Text>
            <View style={{ flexDirection: "row", alignItems: "baseline", gap: 5, marginTop: 9 }}>
              <Text style={{ color: ACC, fontSize: 16, fontFamily: MONO, fontWeight: "500" }}>{fmt(sv.dayL * 1.79, 2)}</Text>
              <Text style={{ color: "#7B838B", fontSize: 10.5 }}>CAD</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

/* ============================================================================
 *  ALERTS
 * ==========================================================================*/
function AlertsPanel({
  alerts,
}: { alerts: { id: string; k: AlertKind; text: string; sev: Severity; plate: string; time: string }[] }) {
  return (
    <View style={{ flex: 2, minHeight: 180 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 9, paddingHorizontal: 18, paddingTop: 13, paddingBottom: 11, borderBottomWidth: 1, borderBottomColor: "#1B2126" }}>
        <Text style={{ color: INK, fontSize: 12.5, fontWeight: "600" }}>Alertes</Text>
        <Text style={{ color: "#7B838B", fontSize: 10.5, fontFamily: MONO }}>temps réel</Text>
        <View style={{ marginLeft: "auto", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, backgroundColor: "rgba(217,99,91,0.12)" }}>
          <Text style={{ color: RED, fontSize: 10.5, fontWeight: "500" }}>
            {alerts.length ? `${alerts.length} actives` : "flux ouvert"}
          </Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }}>
        {alerts.map((a) => {
          const Icon = ALERT_ICON[a.k];
          const sev = SEV[a.sev];
          return (
            <View key={a.id} style={{ flexDirection: "row", gap: 11, paddingHorizontal: 18, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#191E23" }}>
              <View style={{ width: 22, height: 22, borderRadius: 6, backgroundColor: sev.bg, alignItems: "center", justifyContent: "center", marginTop: 1 }}>
                <Icon size={12} color={sev.fg} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#D3D8DC", fontSize: 12, lineHeight: 17 }}>{a.text}</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 }}>
                  <Text style={{ color: sev.fg, fontSize: 10.5, fontFamily: MONO, fontWeight: "500" }}>{a.plate}</Text>
                  <Text style={{ color: "#6B737B", fontSize: 10.5, fontFamily: MONO }}>{a.time}</Text>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
