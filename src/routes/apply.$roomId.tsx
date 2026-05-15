import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, CheckCircle2 } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingContactBar } from "@/components/FloatingContactBar";
import { useLang } from "@/i18n/LanguageProvider";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { toast } from "sonner";

export const Route = createFileRoute("/apply/$roomId")({ component: ApplyPage });

interface Occupant { name: string; relation: string; age: string }

function ApplyPage() {
  const { roomId } = Route.useParams();
  const { t } = useLang();
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isStudent, setIsStudent] = useState(false);
  const [occupants, setOccupants] = useState<Occupant[]>([]);
  const [form, setForm] = useState<Record<string, any>>({});

  const upd = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = {
      ...form,
      stay_type: "Monthly",
      is_student: isStudent,
      additional_occupants: occupants,
      additional_information: `${form.additional_information || ""}\n[Room interest: ${roomId}]`.trim(),
      monthly_income: form.monthly_income ? Number(form.monthly_income) : null,
    };
    if (!isSupabaseConfigured) {
      toast.warning("Supabase not connected — application logged locally only.");
      setDone(true); setSubmitting(false); return;
    }
    const { error } = await supabase.from("applications").insert(payload);
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    // TODO: trigger email confirmation here
    setDone(true);
  };

  if (done) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 mx-auto max-w-md px-4 py-16 text-center">
          <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">{t.apply.thanks}</h1>
          <Link to="/" className="mt-6 inline-flex rounded-lg bg-primary text-primary-foreground px-5 py-3 font-semibold">Back to home</Link>
        </main>
        <Footer />
        <FloatingContactBar />
      </div>
    );
  }

  const f = t.fields;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 mx-auto max-w-2xl w-full px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-1">{t.apply.title}</h1>
        <p className="text-sm text-muted-foreground mb-6">Room: <span className="font-mono">{roomId}</span></p>

        <form onSubmit={submit} className="space-y-6">
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
