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
  }),
  component: ApplyPage,
});

interface Occupant { name: string; relation: string; age: string }
interface RoomRow { id: string; name: string | null; current_status: string | null; property_id: string | null }

const PROPERTY_OPTIONS = [
  ...PROPERTIES.map((p) => ({ value: p.id, label: p.address })),
  { value: "flexible", label: "I'm flexible / Je suis flexible / أنا مرن" },
];

const L = {
  en: { intro: "Pick a property below and fill out your details.", chooseProp: "Choose your property", whichProp: "Which property are you applying for?", whichRoom: "Which room?", selectProp: "— Select property —", anyRoom: "Any available room", errPickProp: "Please select a property.", back: "Back to home" },
  fr: { intro: "Choisissez une propriété ci-dessous et remplissez vos coordonnées.", chooseProp: "Choisissez votre propriété", whichProp: "Pour quelle propriété postulez-vous ?", whichRoom: "Quelle chambre ?", selectProp: "— Sélectionnez la propriété —", anyRoom: "Toute chambre disponible", errPickProp: "Veuillez choisir une propriété.", back: "Retour à l'accueil" },
  ar: { intro: "اختر عقارًا أدناه وأكمل بياناتك.", chooseProp: "اختر العقار", whichProp: "لأي عقار تتقدّم بطلبك؟", whichRoom: "أي غرفة؟", selectProp: "— اختر العقار —", anyRoom: "أي غرفة متاحة", errPickProp: "يرجى اختيار عقار.", back: "العودة إلى الرئيسية" },
};

function ApplyPage() {
  const { property: prefilledProperty } = useSearch({ from: "/apply/" });
  const { t, lang } = useLang();
  const l = L[lang];
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isStudent, setIsStudent] = useState(false);
  const [occupants, setOccupants] = useState<Occupant[]>([]);
  const [form, setForm] = useState<Record<string, any>>({});
  const [propertySel, setPropertySel] = useState<string>(prefilledProperty || "");
  const [roomSel, setRoomSel] = useState<string>("any");
  const [allRooms, setAllRooms] = useState<RoomRow[]>([]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    (async () => {
      const { data } = await supabase.from("rooms").select("id,name,current_status,property_id");
      if (data) setAllRooms(data as RoomRow[]);
    })();
  }, []);

  // Filter rooms by selected property (match against name keyword)
  const propertyKeyword: Record<string, string> = {
    "102-amour": "102",
    "58-conrad": "58",
    "260-colline": "260",
  };
  const filteredRooms = propertySel && propertyKeyword[propertySel]
    ? allRooms.filter((r) => (r.name || "").includes(propertyKeyword[propertySel]))
    : [];

  const upd = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertySel) { toast.error(l.errPickProp); return; }
    setSubmitting(true);

    const propertyLabel = PROPERTY_OPTIONS.find((p) => p.value === propertySel)?.label || "";
    const roomLabel = roomSel === "any"
      ? l.anyRoom
      : filteredRooms.find((r) => r.id === roomSel)?.name || "";

    const payload = {
      ...form,
      stay_type: "Monthly",
      is_student: isStudent,
      additional_occupants: occupants,
      room_id: roomSel !== "any" ? roomSel : null,
      additional_information: `${form.additional_information || ""}\n[Property: ${propertyLabel}]\n[Room: ${roomLabel}]`.trim(),
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
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 mx-auto max-w-md px-4 py-16 text-center">
          <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">{t.apply.thanks}</h1>
          <Link to="/" className="mt-6 inline-flex rounded-lg bg-primary text-primary-foreground px-5 py-3 font-semibold">{l.back}</Link>
        </main>
        <Footer />
        <FloatingContactBar />
      </div>
    );
  }

  const f = t.fields;

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Header />
      <main className="flex-1 mx-auto max-w-2xl w-full px-4 py-8">
        <h1 className="font-display text-3xl md:text-4xl text-ink mb-2">{t.apply.title}</h1>
        <p className="text-sm text-ink/60 mb-6">Pick a property below and fill out your details.</p>

        <div className="mb-6"><AmenityIcons /></div>

        <form onSubmit={submit} className="space-y-6">
          {/* Property + Room selection */}
          <fieldset className="bg-card border-2 border-brand/40 rounded-2xl p-5 space-y-4">
        <p className="text-sm text-ink/60 mb-6">{l.intro}</p>

        <div className="mb-6"><AmenityIcons /></div>

        <form onSubmit={submit} className="space-y-6">
          {/* Property + Room selection */}
          <fieldset className="bg-card border-2 border-brand/40 rounded-2xl p-5 space-y-4">
            <legend className="px-2 font-bold text-base">{l.chooseProp}</legend>

            <label className="block">
              <span className="text-sm font-semibold mb-1 block">
                {l.whichProp} <span className="text-destructive">*</span>
              </span>
              <select
                required
                value={propertySel}
                onChange={(e) => { setPropertySel(e.target.value); setRoomSel("any"); }}
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-base focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">{l.selectProp}</option>
                {PROPERTY_OPTIONS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-semibold mb-1 block">
                {l.whichRoom} <span className="text-destructive">*</span>
              </span>
              <select
                required
                value={roomSel}
                onChange={(e) => setRoomSel(e.target.value)}
                disabled={!propertySel}
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-base focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              >
                <option value="any">{l.anyRoom}</option>
                {filteredRooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name || r.id.slice(0, 8)} {r.current_status ? `· ${r.current_status}` : ""}
                  </option>
                ))}
              </select>
            </label>
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
                <Two>
                  <label className="flex items-center gap-2 mt-6"><input type="checkbox" onChange={e => setForm(s => ({ ...s, is_international_student: e.target.checked }))} className="w-5 h-5 accent-primary" /><span>{f.is_international_student}</span></label>
                  <Input label={f.country_of_origin} onChange={upd("country_of_origin")} />
                </Two>
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
