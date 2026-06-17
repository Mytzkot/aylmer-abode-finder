import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Plus, Trash2, CheckCircle2 } from "lucide-react";
import { AmenityIcons } from "@/components/AmenityIcons";
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
  head: () => ({
    meta: [
      { title: "Apply for a Furnished Room — Zorba Rentals" },
      { name: "description", content: "Apply online for a furnished monthly room in Aylmer-Gatineau. No credit check, first month only to move in." },
      { property: "og:title", content: "Apply for a Furnished Room — Zorba Rentals" },
      { property: "og:description", content: "No credit check. First month only to move in." },
      { property: "og:url", content: "/apply" },
    ],
    links: [{ rel: "canonical", href: "/apply" }],
  }),
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

const PHONE_ALLOWED = /[^0-9 +\-()]/g;
const PHONE_VALID = /^[+0-9 ()\-.]{7,20}$/;
const EMAIL_VALID = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function ApplyPage() {
  const { property: prefilledProperty } = useSearch({ from: "/apply/" });
  const { t, lang, dir } = useLang();
  const l = L[lang === "ar" ? "ar" : lang === "fr" ? "fr" : "en"];
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isStudent, setIsStudent] = useState(false);
  const [firstTimeRenter, setFirstTimeRenter] = useState(false);
  const [occupants, setOccupants] = useState<Occupant[]>([]);
  const [form, setForm] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [studentDocPath, setStudentDocPath] = useState<string | null>(null);
  const [studentDocName, setStudentDocName] = useState<string | null>(null);
  const [studentDocUploading, setStudentDocUploading] = useState(false);

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

  const setField = (k: string, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => { const c = { ...e }; delete c[k]; return c; });
  };
  const onText = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setField(k, e.target.value);
  const onPhone = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setField(k, e.target.value.replace(PHONE_ALLOWED, ""));
  const onNumber = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setField(k, e.target.value.replace(/[^0-9.]/g, ""));

  const af = t.applyForm;
  const f = t.fields;

  const toggleStudent = (checked: boolean) => {
    setIsStudent(checked);
    if (checked) {
      // International students typically have no Canadian landlord — auto-relax those.
      setFirstTimeRenter(true);
      setErrors((er) => {
        const c = { ...er };
        delete c.current_landlord_name;
        delete c.current_landlord_phone;
        return c;
      });
    }
  };

  const uploadStudentDoc = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error(af.studentDocTooLarge);
      return;
    }
    if (!isSupabaseConfigured) {
      toast.warning("Backend not connected — file cannot be uploaded.");
      return;
    }
    setStudentDocUploading(true);
    try {
      const ext = (file.name.split(".").pop() || "").toLowerCase();
      const allowedExt = ["pdf", "jpg", "jpeg", "png", "webp", "heic"];
      const safeExt = allowedExt.includes(ext) ? ext : "pdf";
      const path = `applications/${crypto.randomUUID()}.${safeExt}`;
      const { error } = await supabase.storage
        .from("application-docs")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (error) throw error;
      setStudentDocPath(path);
      setStudentDocName(file.name);
      toast.success(af.studentDocUploaded);
    } catch (err) {
      console.error("Student doc upload failed:", err);
      toast.error(af.studentDocFailed);
    } finally {
      setStudentDocUploading(false);
    }
  };

  const validate = (): Record<string, string> => {
    const req = (k: string) => !((form[k] ?? "").toString().trim());
    const e: Record<string, string> = {};
    const required = [
      "surname", "first_name", "telephone", "email", "present_address",
      "reason_for_moving", "date_of_birth", "desired_move_in_date",
      "monthly_income", "source_of_income", "present_occupation",
      "emergency_name", "emergency_phone",
    ];
    for (const k of required) if (req(k)) e[k] = af.required;
    if (!firstTimeRenter) {
      if (req("current_landlord_name")) e.current_landlord_name = af.required;
      if (req("current_landlord_phone")) e.current_landlord_phone = af.required;
    }
    if (isStudent) {
      for (const k of ["name_of_school", "program_of_study", "study_start_date", "country_of_origin"]) {
        if (req(k)) e[k] = af.required;
      }
    }
    if (form.email && !EMAIL_VALID.test(form.email.trim())) e.email = af.invalidEmail;
    for (const k of ["telephone", "current_landlord_phone", "emergency_phone", "reference_1_phone", "reference_2_phone"]) {
      const v = (form[k] ?? "").trim();
      if (!v) continue;
      if (k === "current_landlord_phone" && firstTimeRenter) continue;
      if (!PHONE_VALID.test(v)) e[k] = af.invalidPhone;
    }
    if (form.monthly_income) {
      const n = Number(form.monthly_income);
      if (!Number.isFinite(n) || n < 0) e.monthly_income = af.invalidIncome;
    }
    return e;
  };


  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      toast.error(af.fixErrors);
      // scroll to first error
      const firstKey = Object.keys(errs)[0];
      setTimeout(() => {
        const el = document.querySelector(`[data-field="${firstKey}"]`) as HTMLElement | null;
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
        (el?.querySelector("input,textarea,select") as HTMLElement | null)?.focus?.();
      }, 50);
      return;
    }
    setSubmitting(true);

    const locationLabel = LOCATION_OPTIONS.find((o) => o.value === locationSel)?.label_en || "Any location";
    const budgetLabel = budgetSel === "any" ? "any budget" : `$${budgetSel}/month`;
    const exactRoomId = matchedRooms.length === 1 ? matchedRooms[0].id : null;

    const payload = {
      surname: form.surname?.trim(),
      first_name: form.first_name?.trim(),
      telephone: form.telephone?.trim(),
      email: form.email?.trim(),
      present_address: form.present_address?.trim(),
      reason_for_moving: form.reason_for_moving?.trim(),
      date_of_birth: form.date_of_birth || null,
      desired_move_in_date: form.desired_move_in_date || null,
      first_time_renter: firstTimeRenter,
      current_landlord_name: firstTimeRenter ? null : form.current_landlord_name?.trim() || null,
      current_landlord_phone: firstTimeRenter ? null : form.current_landlord_phone?.trim() || null,
      monthly_income: form.monthly_income ? Number(form.monthly_income) : null,
      source_of_income: form.source_of_income?.trim() || null,
      present_occupation: form.present_occupation?.trim() || null,
      employer_name: form.employer_name?.trim() || null,
      employer_address: form.employer_address?.trim() || null,
      employment_duration: form.employment_duration?.trim() || null,
      employer_phone: form.employer_phone?.trim() || null,
      school_name: isStudent ? (form.name_of_school?.trim() || null) : null,
      program_of_study: isStudent ? (form.program_of_study?.trim() || null) : null,
      study_start_date: isStudent ? (form.study_start_date || null) : null,
      country_of_origin: isStudent ? (form.country_of_origin?.trim() || null) : null,
      student_document_path: isStudent ? studentDocPath : null,

      emergency_contact_name: form.emergency_name?.trim() || null,
      emergency_contact_phone: form.emergency_phone?.trim() || null,
      reference_1_name: form.reference_1_name?.trim() || null,
      reference_1_phone: form.reference_1_phone?.trim() || null,
      reference_2_name: form.reference_2_name?.trim() || null,
      reference_2_phone: form.reference_2_phone?.trim() || null,
      stay_type: "Monthly",
      is_student: isStudent,
      additional_occupants: occupants.slice(0, 10),
      room_id: exactRoomId,
      additional_information: `${(form.additional_information || "").trim()}\n[Preferred: ${locationLabel} around ${budgetLabel} — match best fit]`.trim().slice(0, 2000),
    };

    if (!isSupabaseConfigured) {
      toast.warning("Backend not connected — application logged locally only.");
      setDone(true); setSubmitting(false); return;
    }
    const { error } = await supabase.from("applications").insert(payload as never);
    setSubmitting(false);
    if (error) { console.error("Application submit error:", error); toast.error("We couldn't submit your application. Please try again."); return; }
    setDone(true);
  };

  if (done) {
    const propLabel = LOCATION_OPTIONS.find((o) => o.value === locationSel);
    const propText = propLabel ? (lang === "fr" ? propLabel.label_fr : propLabel.label_en) : "";
    const thanksEN = "Thanks! We got your application and will contact you soon.";
    const thanksFR = "Merci ! Nous avons bien reçu votre demande et nous vous contacterons bientôt.";
    const showBoth = lang !== "en" && lang !== "fr";
    return (
      <div className="min-h-screen flex flex-col" dir={dir}>
        <main className="flex-1 mx-auto max-w-md px-4 py-16 text-center">
          <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-4" />
          {showBoth ? (
            <>
              <p className="text-lg font-semibold text-ink mb-2">{thanksEN}</p>
              <p className="text-lg font-semibold text-ink mb-2" lang="fr">{thanksFR}</p>
            </>
          ) : (
            <p className="text-lg font-semibold text-ink mb-2" lang={lang}>
              {lang === "fr" ? thanksFR : thanksEN}
            </p>
          )}
          {propText && <p className="text-xs text-ink/60 mt-4 mb-6">→ {propText}</p>}
          <Link to="/" className="mt-6 inline-flex rounded-xl bg-primary text-primary-foreground px-5 py-3 font-semibold">{l.back}</Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-cream" dir={dir}>
      <main className="flex-1 mx-auto max-w-2xl w-full px-4 py-8 text-start">
        <h1 className="font-display text-3xl md:text-4xl text-ink mb-2">{t.apply.title}</h1>
        <p className="text-sm text-ink/60 mb-6">{l.intro}</p>

        <div className="mb-6"><AmenityIcons /></div>

        <form onSubmit={submit} noValidate className="space-y-6">
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

          {/* Student section (near the top — relevant to most international applicants) */}
          <Section title={t.apply.student}>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isStudent}
                onChange={(e) => toggleStudent(e.target.checked)}
                className="w-5 h-5 accent-primary"
              />
              <span className="font-medium">{t.apply.isStudent}</span>
            </label>

            {isStudent && (
              <div className="space-y-3 pt-2">
                <p className="text-xs text-ink/60 bg-accent/40 rounded-lg px-3 py-2">{af.studentNote}</p>
                <Two>
                  <Field
                    label={af.studentSchool}
                    name="name_of_school"
                    required
                    value={form.name_of_school || ""}
                    onChange={onText("name_of_school")}
                    error={errors.name_of_school}
                    placeholder={af.studentSchoolHint}
                  />
                  <Field
                    label={af.studentProgram}
                    name="program_of_study"
                    required
                    value={form.program_of_study || ""}
                    onChange={onText("program_of_study")}
                    error={errors.program_of_study}
                  />
                </Two>
                <Two>
                  <Field
                    label={af.studyStartDate}
                    name="study_start_date"
                    type="date"
                    required
                    value={form.study_start_date || ""}
                    onChange={onText("study_start_date")}
                    error={errors.study_start_date}
                  />
                  <Field
                    label={af.countryOfOrigin}
                    name="country_of_origin"
                    required
                    value={form.country_of_origin || ""}
                    onChange={onText("country_of_origin")}
                    error={errors.country_of_origin}
                    autoComplete="country-name"
                  />
                </Two>

                <div data-field="student_document">
                  <span className="text-sm font-medium mb-1 block">{af.studentDoc}</span>
                  <input
                    type="file"
                    accept="application/pdf,image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadStudentDoc(file);
                      e.target.value = "";
                    }}
                    disabled={studentDocUploading}
                    className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-secondary file:px-3 file:py-2 file:font-medium hover:file:bg-accent disabled:opacity-50"
                  />
                  <p className="text-xs text-ink/50 mt-1">
                    {studentDocUploading
                      ? af.studentDocUploading
                      : studentDocName
                        ? `✓ ${af.studentDocUploaded} — ${studentDocName}`
                        : af.studentDocHint}
                  </p>
                </div>
              </div>
            )}
          </Section>


          {/* Desired move-in date */}
          <Section title={af.desiredMoveIn}>
            <Field
              label={af.desiredMoveIn}
              name="desired_move_in_date"
              type="date"
              required
              value={form.desired_move_in_date || ""}
              onChange={onText("desired_move_in_date")}
              error={errors.desired_move_in_date}
              min={new Date().toISOString().slice(0, 10)}
            />
            <p className="text-xs text-ink/60">{af.minStayNote}</p>
          </Section>

          <Section title={t.apply.personal}>
            <Two>
              <Field label={f.surname} name="surname" required value={form.surname || ""} onChange={onText("surname")} error={errors.surname} autoComplete="family-name" />
              <Field label={f.first_name} name="first_name" required value={form.first_name || ""} onChange={onText("first_name")} error={errors.first_name} autoComplete="given-name" />
            </Two>
            <Two>
              <Field label={f.telephone} name="telephone" type="tel" inputMode="tel" required value={form.telephone || ""} onChange={onPhone("telephone")} error={errors.telephone} hint={af.phoneHint} autoComplete="tel" />
              <Field label={f.email} name="email" type="email" required value={form.email || ""} onChange={onText("email")} error={errors.email} autoComplete="email" />
            </Two>

            <AddressAutocomplete
              label={f.present_address}
              value={form.present_address || ""}
              onChange={(v) => setField("present_address", v)}
              error={errors.present_address}
              placeholder={af.addressPlaceholder}
              searchingLabel={af.addressSearching}
              noResultsLabel={af.addressNoResults}
            />

            <Field label={f.reason_for_moving} name="reason_for_moving" required value={form.reason_for_moving || ""} onChange={onText("reason_for_moving")} error={errors.reason_for_moving} />

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={firstTimeRenter}
                onChange={(e) => {
                  setFirstTimeRenter(e.target.checked);
                  if (e.target.checked) {
                    setErrors((er) => { const c = { ...er }; delete c.current_landlord_name; delete c.current_landlord_phone; return c; });
                  }
                }}
                className="w-5 h-5 accent-primary"
              />
              <span className="font-medium text-sm">{af.firstTimeRenter}</span>
            </label>

            <Two>
              <Field
                label={f.current_landlord_name}
                name="current_landlord_name"
                required={!firstTimeRenter}
                disabled={firstTimeRenter}
                value={form.current_landlord_name || ""}
                onChange={onText("current_landlord_name")}
                error={errors.current_landlord_name}
              />
              <Field
                label={f.current_landlord_phone}
                name="current_landlord_phone"
                type="tel"
                inputMode="tel"
                required={!firstTimeRenter}
                disabled={firstTimeRenter}
                value={form.current_landlord_phone || ""}
                onChange={onPhone("current_landlord_phone")}
                error={errors.current_landlord_phone}
              />
            </Two>

            <Field label={f.date_of_birth} name="date_of_birth" type="date" required value={form.date_of_birth || ""} onChange={onText("date_of_birth")} error={errors.date_of_birth} max={new Date().toISOString().slice(0, 10)} />
          </Section>

          <Section title={t.apply.employment}>
            <Two>
              <Field label={f.monthly_income} name="monthly_income" type="number" inputMode="numeric" required value={form.monthly_income || ""} onChange={onNumber("monthly_income")} error={errors.monthly_income} min={0} />
              <Field label={f.source_of_income} name="source_of_income" required value={form.source_of_income || ""} onChange={onText("source_of_income")} error={errors.source_of_income} />
            </Two>
            <Field label={f.present_occupation} name="present_occupation" required value={form.present_occupation || ""} onChange={onText("present_occupation")} error={errors.present_occupation} />
            <Two>
              <Field label={f.employer_name} name="employer_name" value={form.employer_name || ""} onChange={onText("employer_name")} />
              <Field label={f.employment_duration} name="employment_duration" value={form.employment_duration || ""} onChange={onText("employment_duration")} />
            </Two>
            <Field label={f.employer_address} name="employer_address" value={form.employer_address || ""} onChange={onText("employer_address")} />
          </Section>




          <Section title={t.apply.emergency}>
            <Two>
              <Field label={f.emergency_name} name="emergency_name" required value={form.emergency_name || ""} onChange={onText("emergency_name")} error={errors.emergency_name} />
              <Field label={f.emergency_phone} name="emergency_phone" type="tel" inputMode="tel" required value={form.emergency_phone || ""} onChange={onPhone("emergency_phone")} error={errors.emergency_phone} />
            </Two>
          </Section>

          <Section title={t.apply.references}>
            <Two>
              <Field label={f.reference_1_name} name="reference_1_name" value={form.reference_1_name || ""} onChange={onText("reference_1_name")} />
              <Field label={f.reference_1_phone} name="reference_1_phone" type="tel" inputMode="tel" value={form.reference_1_phone || ""} onChange={onPhone("reference_1_phone")} error={errors.reference_1_phone} />
            </Two>
            <Two>
              <Field label={f.reference_2_name} name="reference_2_name" value={form.reference_2_name || ""} onChange={onText("reference_2_name")} />
              <Field label={f.reference_2_phone} name="reference_2_phone" type="tel" inputMode="tel" value={form.reference_2_phone || ""} onChange={onPhone("reference_2_phone")} error={errors.reference_2_phone} />
            </Two>
          </Section>

          <Section title={t.apply.occupants}>
            {occupants.map((o, i) => (
              <div key={i} className="grid grid-cols-7 gap-2 items-end">
                <div className="col-span-3"><Field label={f.occupant_name} name={`occ_n_${i}`} value={o.name} onChange={(e) => { const c = [...occupants]; c[i].name = e.target.value; setOccupants(c); }} /></div>
                <div className="col-span-2"><Field label={f.occupant_relation} name={`occ_r_${i}`} value={o.relation} onChange={(e) => { const c = [...occupants]; c[i].relation = e.target.value; setOccupants(c); }} /></div>
                <div className="col-span-1"><Field label={f.occupant_age} name={`occ_a_${i}`} value={o.age} onChange={(e) => { const c = [...occupants]; c[i].age = e.target.value; setOccupants(c); }} /></div>
                <button type="button" onClick={() => setOccupants(occupants.filter((_, j) => j !== i))} className="touch-min col-span-1 mb-0.5 inline-flex justify-center rounded-lg bg-destructive/10 text-destructive p-2"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
            <button type="button" onClick={() => setOccupants([...occupants, { name: "", relation: "", age: "" }])} className="touch-min inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-2 text-sm font-medium hover:bg-accent">
              <Plus className="w-4 h-4" /> {t.apply.addOccupant}
            </button>
          </Section>

          <Section title={t.apply.additional}>
            <textarea value={form.additional_information || ""} onChange={onText("additional_information")} rows={4} className="w-full px-3 py-2.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary" />
          </Section>

          <button disabled={submitting} className="touch-min w-full rounded-xl bg-primary text-primary-foreground font-bold py-3.5 text-base hover:opacity-90 disabled:opacity-50">
            {submitting ? "..." : t.apply.submit}
          </button>
        </form>
      </main>
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

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  error?: string;
  hint?: string;
}

function Field({ label, name, error, hint, required, ...rest }: FieldProps) {
  return (
    <label className="block" data-field={name}>
      <span className="text-sm font-medium mb-1 block">
        {label}{required && <span className="text-destructive"> *</span>}
      </span>
      <input
        {...rest}
        name={name}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-err` : undefined}
        className={`w-full px-3 py-2.5 rounded-lg border bg-background text-base focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 ${error ? "border-destructive" : "border-input"}`}
      />
      {error ? (
        <p id={`${name}-err`} className="text-xs text-destructive mt-1">{error}</p>
      ) : hint ? (
        <p className="text-xs text-ink/50 mt-1">{hint}</p>
      ) : null}
    </label>
  );
}

// ---------------------------------------------------------------------------
// Address autocomplete using OpenStreetMap Nominatim (free, no API key).
// Falls back gracefully to a plain text field if the network call fails.
// ---------------------------------------------------------------------------
interface NominatimResult { place_id: number; display_name: string }

function AddressAutocomplete({
  label, value, onChange, error, placeholder, searchingLabel, noResultsLabel,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder: string;
  searchingLabel: string;
  noResultsLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<NominatimResult[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const handleChange = (v: string) => {
    onChange(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (v.trim().length < 4) { setResults([]); setOpen(false); return; }
    setLoading(true);
    setOpen(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=0&limit=6&countrycodes=ca&q=${encodeURIComponent(v)}`;
        const res = await fetch(url, { headers: { "Accept": "application/json" } });
        const data: NominatimResult[] = await res.json();
        setResults(Array.isArray(data) ? data : []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);
  };

  return (
    <div className="block relative" ref={wrapRef} data-field="present_address">
      <span className="text-sm font-medium mb-1 block">
        {label}<span className="text-destructive"> *</span>
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => { if (results.length) setOpen(true); }}
        placeholder={placeholder}
        autoComplete="street-address"
        aria-invalid={!!error}
        className={`w-full px-3 py-2.5 rounded-lg border bg-background text-base focus:outline-none focus:ring-2 focus:ring-primary ${error ? "border-destructive" : "border-input"}`}
      />
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
      {open && (
        <div className="absolute z-20 mt-1 w-full bg-card border border-border rounded-lg shadow-lg max-h-64 overflow-auto">
          {loading && <div className="px-3 py-2 text-sm text-ink/60">{searchingLabel}</div>}
          {!loading && results.length === 0 && (
            <div className="px-3 py-2 text-sm text-ink/60">{noResultsLabel}</div>
          )}
          {!loading && results.map((r) => (
            <button
              key={r.place_id}
              type="button"
              onClick={() => { onChange(r.display_name); setOpen(false); setResults([]); }}
              className="block w-full text-start px-3 py-2 text-sm hover:bg-accent border-b border-border last:border-b-0"
            >
              {r.display_name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
