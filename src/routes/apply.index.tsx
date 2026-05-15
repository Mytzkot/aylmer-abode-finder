import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2, CheckCircle2 } from "lucide-react";
import { Header } from "@/components/Header";
import { AmenityIcons } from "@/components/AmenityIcons";
import { Footer } from "@/components/Footer";
import { FloatingContactBar } from "@/components/FloatingContactBar";
import { useLang } from "@/i18n/LanguageProvider";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { PROPERTIES } from "@/data/properties";
import { toast } from "sonner";

export const Route = createFileRoute("/apply/")({
  validateSearch: (s: Record<string, unknown>) => ({
    property: typeof s.property === "string" ? s.property : undefined,
    room: typeof s.room === "string" ? s.room : undefined,
  }),
  component: ApplyPage,
});

interface Occupant { name: string; relation: string; age: string }
interface RoomRow { id: string; name: string | null; current_status: string | null; property_id: string | null; rate_monthly: number | null; base_rate: number | null }

const LOCATION_OPTIONS = [
  { value: "any", label_en: "Any location", label_fr: "N'importe quel emplacement" },
  ...PROPERTIES.map((p) => ({ value: p.id, label_en: p.address, label_fr: p.address })),
];

const BUDGET_OPTIONS = [
  { value: "any", label_en: "Any budget", label_fr: "N'importe quel budget" },
  { value: "750", label_en: "Around $750", label_fr: "Environ 750 $" },
  { value: "800", label_en: "Around $800", label_fr: "Environ 800 $" },
  { value: "850", label_en: "Around $850", label_fr: "Environ 850 $" },
  { value: "900", label_en: "Around $900", label_fr: "Environ 900 $" },
  { value: "950", label_en: "Around $950", label_fr: "Environ 950 $" },
  { value: "1200", label_en: "Around $1200", label_fr: "Environ 1200 $" },
];

const L = {
  en: { intro: "Pick a location and your budget, then fill out your details.", chooseProp: "Choose your location & budget", whichLoc: "Which location are you applying for?", whichBudget: "What's your budget per month?", helper: "We'll match you with the best available room in your budget", noMatch: "No exact match — we'll contact you with the closest options.", matches: (n: number, loc: string, b: string) => `${n} ${n === 1 ? "room" : "rooms"} match your selection in ${loc} around $${b}/month`, matchesAny: (n: number, b: string) => `${n} ${n === 1 ? "room" : "rooms"} match your selection around $${b}/month`, matchesLoc: (n: number, loc: string) => `${n} ${n === 1 ? "room" : "rooms"} available in ${loc}`, back: "Back to home", thanksLine2: "We received your application and will contact you within 24 hours." },
  fr: { intro: "Choisissez un emplacement et votre budget, puis remplissez vos coordonnées.", chooseProp: "Choisissez votre emplacement et budget", whichLoc: "Quel emplacement vous intéresse ?", whichBudget: "Quel est votre budget mensuel ?", helper: "Nous vous attribuerons la meilleure chambre disponible selon votre budget", noMatch: "Aucune correspondance exacte — nous vous contacterons avec les options les plus proches.", matches: (n: number, loc: string, b: string) => `${n} chambre(s) correspondent à votre sélection à ${loc} autour de ${b} $/mois`, matchesAny: (n: number, b: string) => `${n} chambre(s) correspondent à votre sélection autour de ${b} $/mois`, matchesLoc: (n: number, loc: string) => `${n} chambre(s) disponible(s) à ${loc}`, back: "Retour à l'accueil", thanksLine2: "Nous avons reçu votre demande et vous contacterons sous 24 heures." },
  ar: { intro: "اختر الموقع والميزانية ثم أكمل بياناتك.", chooseProp: "اختر الموقع والميزانية", whichLoc: "أي موقع تتقدّم له؟", whichBudget: "ما ميزانيتك الشهرية؟", helper: "سنوفر لك أفضل غرفة متاحة ضمن ميزانيتك", noMatch: "لا توجد مطابقة دقيقة — سنتواصل معك بأقرب الخيارات.", matches: (n: number, loc: string, b: string) => `${n} غرفة تطابق اختيارك في ${loc} حوالي ${b} دولار/شهر`, matchesAny: (n: number, b: string) => `${n} غرفة تطابق اختيارك حوالي ${b} دولار/شهر`, matchesLoc: (n: number, loc: string) => `${n} غرفة متاحة في ${loc}`, back: "العودة إلى الرئيسية", thanksLine2: "لقد استلمنا طلبك وسنتواصل معك خلال 24 ساعة." },
};

function ApplyPage() {
  const { property: prefilledProperty } = useSearch({ from: "/apply/" });
  const { t, lang, dir } = useLang();
  const l = L[lang === "ar" ? "ar" : lang === "fr" ? "fr" : "en"];
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isStudent, setIsStudent] = useState(false);
  const [occupants, setOccupants] = useState<Occupant[]>([]);
  const [form, setForm] = useState<Record<string, any>>({});
  const [locationSel, setLocationSel] = useState<string>(prefilledProperty || "any");
  const [budgetSel, setBudgetSel] = useState<string>("any");
  const [allRooms, setAllRooms] = useState<RoomRow[]>([]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    (async () => {
      const { data } = await supabase
        .from("rooms")
        .select("id,name,current_status,property_id,rate_monthly,base_rate");
      if (data) setAllRooms(data as RoomRow[]);
    })();
  }, []);

  // Match rooms by selected location + budget (within $50)
  const propertyIdBySlug: Record<string, string | undefined> = {};
  // We don't know property UUIDs here without a separate fetch; rely on property_id directly when available.
  // Filter purely by property_id when set, otherwise by name keyword fallback.
  const propertyKeyword: Record<string, string> = {
    "102-amour": "102",
    "58-conrad": "58",
    "260-colline": "260",
  };

  const matchedRooms = allRooms.filter((r) => {
    if (locationSel !== "any") {
      const kw = propertyKeyword[locationSel];
      const nameMatch = kw ? (r.name || "").includes(kw) : false;
      if (!nameMatch && r.property_id !== locationSel) return false;
    }
    if (budgetSel !== "any") {
      const target = Number(budgetSel);
      const price = r.rate_monthly ?? r.base_rate;
      if (price == null) return false;
      if (Math.abs(Number(price) - target) > 50) return false;
    }
    return true;
  });

  const locLabel = LOCATION_OPTIONS.find((o) => o.value === locationSel);
  const locText = locLabel ? (lang === "fr" ? locLabel.label_fr : locLabel.label_en) : "";

  const previewMsg = (() => {
    if (locationSel === "any" && budgetSel === "any") return "";
    const n = matchedRooms.length;
    if (n === 0) return l.noMatch;
    if (locationSel !== "any" && budgetSel !== "any") return l.matches(n, locText, budgetSel);
    if (budgetSel !== "any") return l.matchesAny(n, budgetSel);
    return l.matchesLoc(n, locText);
  })();

  const upd = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const locationLabel = LOCATION_OPTIONS.find((o) => o.value === locationSel)?.label_en || "Any location";
    const budgetLabel = budgetSel === "any" ? "any budget" : `$${budgetSel}/month`;
    const exactRoomId = matchedRooms.length === 1 ? matchedRooms[0].id : null;

    const payload = {
      ...form,
      stay_type: "Monthly",
      is_student: isStudent,
      additional_occupants: occupants,
      room_id: exactRoomId,
      additional_information: `${form.additional_information || ""}\n[Preferred: ${locationLabel} around ${budgetLabel} — match best fit]`.trim(),
      monthly_income: form.monthly_income ? Number(form.monthly_income) : null,
    };

    if (!isSupabaseConfigured) {
      toast.warning("Backend not connected — application logged locally only.");
      setDone(true); setSubmitting(false); return;
    }
    const { error } = await supabase.from("applications").insert(payload as never);
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    setDone(true);
  };

  if (done) {
    const propLabel = LOCATION_OPTIONS.find((o) => o.value === locationSel);
    const propText = propLabel ? (lang === "fr" ? propLabel.label_fr : propLabel.label_en) : "";
    return (
      <div className="min-h-screen flex flex-col" dir={dir}>
        <Header />
        <main className="flex-1 mx-auto max-w-md px-4 py-16 text-center">
          <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">{t.apply.thanks}</h1>
          <p className="text-sm text-ink/70 mb-2">{l.thanksLine2}</p>
          {propText && <p className="text-xs text-ink/60 mb-6">→ {propText}</p>}
          <Link to="/" className="mt-6 inline-flex rounded-xl bg-primary text-primary-foreground px-5 py-3 font-semibold">{l.back}</Link>
        </main>
        <Footer />
        <FloatingContactBar />
      </div>
    );
  }

  const f = t.fields;

  return (
    <div className="min-h-screen flex flex-col bg-cream" dir={dir}>
      <Header />
      <main className="flex-1 mx-auto max-w-2xl w-full px-4 py-8 text-start">
        <h1 className="font-display text-3xl md:text-4xl text-ink mb-2">{t.apply.title}</h1>
        <p className="text-sm text-ink/60 mb-6">{l.intro}</p>

        <div className="mb-6"><AmenityIcons /></div>

        <form onSubmit={submit} className="space-y-6">
          {/* Location + Budget selection */}
          <fieldset className="bg-card border-2 border-brand/40 rounded-2xl p-5 space-y-4">
            <legend className="px-2 font-bold text-base">{l.chooseProp}</legend>

            <div className="grid sm:grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm font-semibold mb-1 block">{l.whichLoc}</span>
                <select
                  value={locationSel}
                  onChange={(e) => setLocationSel(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-base focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {LOCATION_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {lang === "fr" ? o.label_fr : o.label_en}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-semibold mb-1 block">{l.whichBudget}</span>
                <select
                  value={budgetSel}
                  onChange={(e) => setBudgetSel(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-base focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {BUDGET_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {lang === "fr" ? o.label_fr : o.label_en}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {previewMsg && (
              <p className={`text-sm rounded-lg px-3 py-2 ${matchedRooms.length === 0 ? "bg-destructive/10 text-destructive" : "bg-accent text-ink"}`}>
                {previewMsg}
              </p>
            )}

            <p className="text-xs text-ink/60">{l.helper}</p>
          </fieldset>


          <Section title={t.apply.personal}>
            <Two><Input label={f.surname} onChange={upd("surname")} required /><Input label={f.first_name} onChange={upd("first_name")} required /></Two>
            <Two><Input label={f.telephone} type="tel" onChange={upd("telephone")} required /><Input label={f.email} type="email" onChange={upd("email")} required /></Two>
            <Input label={f.present_address} onChange={upd("present_address")} />
            <Input label={f.reason_for_moving} onChange={upd("reason_for_moving")} />
            <Two><Input label={f.current_landlord_name} onChange={upd("current_landlord_name")} /><Input label={f.current_landlord_phone} type="tel" onChange={upd("current_landlord_phone")} /></Two>
            <Input label={f.date_of_birth} type="date" onChange={upd("date_of_birth")} />
          </Section>

          <Section title={t.apply.employment}>
            <Two><Input label={f.monthly_income} type="number" onChange={upd("monthly_income")} /><Input label={f.source_of_income} onChange={upd("source_of_income")} /></Two>
            <Input label={f.present_occupation} onChange={upd("present_occupation")} />
            <Two><Input label={f.employer_name} onChange={upd("employer_name")} /><Input label={f.employment_duration} onChange={upd("employment_duration")} /></Two>
            <Input label={f.employer_address} onChange={upd("employer_address")} />
          </Section>

          <Section title={t.apply.student}>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isStudent} onChange={e => setIsStudent(e.target.checked)} className="w-5 h-5 accent-primary" />
              <span className="font-medium">{t.apply.isStudent}</span>
            </label>
            {isStudent && (
              <>
                <Two><Input label={f.name_of_school} onChange={upd("name_of_school")} /><Input label={f.program_of_study} onChange={upd("program_of_study")} /></Two>
                <label className="flex items-center gap-2 mt-2"><input type="checkbox" checked={!!form.is_international_student} onChange={e => setForm(s => ({ ...s, is_international_student: e.target.checked }))} className="w-5 h-5 accent-primary" /><span>{f.is_international_student}</span></label>
                {form.is_international_student && (
                  <Input label={lang === "fr" ? "Pays d'origine" : lang === "ar" ? "بلد الإقامة" : "Home country / Pays d'origine"} onChange={upd("country_of_origin")} />
                )}
              </>
            )}
          </Section>

          <Section title={t.apply.emergency}>
            <Two><Input label={f.emergency_name} onChange={upd("emergency_name")} /><Input label={f.emergency_phone} type="tel" onChange={upd("emergency_phone")} /></Two>
          </Section>

          <Section title={t.apply.references}>
            <Two><Input label={f.reference_1_name} onChange={upd("reference_1_name")} /><Input label={f.reference_1_phone} type="tel" onChange={upd("reference_1_phone")} /></Two>
            <Two><Input label={f.reference_2_name} onChange={upd("reference_2_name")} /><Input label={f.reference_2_phone} type="tel" onChange={upd("reference_2_phone")} /></Two>
          </Section>

          <Section title={t.apply.occupants}>
            {occupants.map((o, i) => (
              <div key={i} className="grid grid-cols-7 gap-2 items-end">
                <div className="col-span-3"><Input label={f.occupant_name} value={o.name} onChange={e => { const c = [...occupants]; c[i].name = e.target.value; setOccupants(c); }} /></div>
                <div className="col-span-2"><Input label={f.occupant_relation} value={o.relation} onChange={e => { const c = [...occupants]; c[i].relation = e.target.value; setOccupants(c); }} /></div>
                <div className="col-span-1"><Input label={f.occupant_age} value={o.age} onChange={e => { const c = [...occupants]; c[i].age = e.target.value; setOccupants(c); }} /></div>
                <button type="button" onClick={() => setOccupants(occupants.filter((_, j) => j !== i))} className="touch-min col-span-1 mb-0.5 inline-flex justify-center rounded-lg bg-destructive/10 text-destructive p-2"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
            <button type="button" onClick={() => setOccupants([...occupants, { name: "", relation: "", age: "" }])} className="touch-min inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-2 text-sm font-medium hover:bg-accent">
              <Plus className="w-4 h-4" /> {t.apply.addOccupant}
            </button>
          </Section>

          <Section title={t.apply.additional}>
            <textarea onChange={upd("additional_information")} rows={4} className="w-full px-3 py-2.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary" />
          </Section>

          <button disabled={submitting} className="touch-min w-full rounded-xl bg-primary text-primary-foreground font-bold py-3.5 text-base hover:opacity-90 disabled:opacity-50">
            {submitting ? "..." : t.apply.submit}
          </button>
        </form>
      </main>
      <Footer />
      <FloatingContactBar />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="bg-card border border-border rounded-2xl p-5 space-y-3">
      <legend className="px-2 font-bold text-base">{title}</legend>
      {children}
    </fieldset>
  );
}

function Two({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>;
}

function Input({ label, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-sm font-medium mb-1 block">{label}</span>
      <input {...rest} className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-base focus:outline-none focus:ring-2 focus:ring-primary" />
    </label>
  );
}
