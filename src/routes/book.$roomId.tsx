import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingContactBar } from "@/components/FloatingContactBar";
import { AmenityIcons } from "@/components/AmenityIcons";
import { useLang } from "@/i18n/LanguageProvider";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/book/$roomId")({ component: BookPage });

function BookPage() {
  const { roomId } = Route.useParams();
  const { t } = useLang();
  const [stayType, setStayType] = useState<"Daily" | "Weekly">("Daily");
  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    if (!isSupabaseConfigured) {
      toast.warning("Supabase not connected — request logged locally only.");
      setDone(true);
      setSubmitting(false);
      return;
    }
    const [first_name, ...rest] = name.split(" ");
    const { error } = await supabase.from("applications").insert({
      first_name: first_name || name,
      surname: rest.join(" ") || "—",
      telephone: phone,
      email,
      stay_type: stayType,
      additional_information: `Booking request — Room: ${roomId} · Check-in: ${checkin} · Check-out: ${checkout}`,
      // TODO: also store room_id once schema is confirmed
    });
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
          <h1 className="text-2xl font-bold mb-2">Request received</h1>
          <p className="text-muted-foreground mb-6">{t.book.success}</p>
          {/* TODO: Stripe payment intent placeholder */}
          <Link to="/" className="inline-flex rounded-lg bg-primary text-primary-foreground px-5 py-3 font-semibold">Back to home</Link>
        </main>
        <Footer />
        <FloatingContactBar />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 mx-auto max-w-xl w-full px-4 py-8 space-y-6">
        <div>
          <h1 className="font-display text-3xl md:text-4xl text-ink mb-1">{t.book.title}</h1>
          <p className="text-sm text-muted-foreground">Room: <span className="font-mono">{roomId}</span></p>
        </div>

        <AmenityIcons />

        <form onSubmit={submit} className="space-y-4 bg-card border border-border rounded-2xl p-5">
          <div className="grid grid-cols-2 gap-2">
            {(["Daily", "Weekly"] as const).map(s => (
              <button type="button" key={s} onClick={() => setStayType(s)}
                className={`btn-pill ${stayType === s ? "btn-ink" : "btn-cream"}`}>
                {s} {s === "Daily" ? "$80" : "$400"}
              </button>
            ))}
          </div>

          <Field label={t.book.checkin}><input required type="date" value={checkin} onChange={e => setCheckin(e.target.value)} className={inputCls} /></Field>
          <Field label={t.book.checkout}><input required type="date" value={checkout} onChange={e => setCheckout(e.target.value)} className={inputCls} /></Field>
          <Field label="Full Name"><input required value={name} onChange={e => setName(e.target.value)} className={inputCls} /></Field>
          <Field label="Phone"><input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} className={inputCls} /></Field>
          <Field label="Email"><input required type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputCls} /></Field>

          <button disabled={submitting} className="btn-pill btn-coral w-full text-base py-4 disabled:opacity-50">
            {submitting ? "..." : t.book.submit}
          </button>
          {/* TODO: Stripe checkout integration goes here */}
        </form>
      </main>
      <Footer />
      <FloatingContactBar />
    </div>
  );
}

const inputCls = "w-full px-3 py-2.5 rounded-lg border border-input bg-background text-base focus:outline-none focus:ring-2 focus:ring-primary";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium mb-1 block">{label}</span>
      {children}
    </label>
  );
}
