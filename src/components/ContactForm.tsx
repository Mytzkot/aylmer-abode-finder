import { useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";

export function ContactForm() {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });

  const upd = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // TODO: wire to email/Supabase contact_messages table later
    await new Promise((r) => setTimeout(r, 600));
    toast.success("Thanks! We'll get back to you shortly. / Merci ! Nous vous répondrons sous peu.");
    setForm({ name: "", email: "", phone: "", message: "" });
    setSubmitting(false);
  };

  return (
    <form onSubmit={submit} className="grid gap-4 bg-card rounded-3xl p-6 md:p-8 border border-border/50 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name / Nom" value={form.name} onChange={upd("name")} required />
        <Field label="Email" type="email" value={form.email} onChange={upd("email")} required />
      </div>
      <Field label="Phone / Téléphone" type="tel" value={form.phone} onChange={upd("phone")} />
      <label className="block">
        <span className="text-sm font-semibold text-ink mb-1.5 block">Message</span>
        <textarea
          value={form.message}
          onChange={upd("message")}
          rows={5}
          required
          className="w-full px-4 py-3 rounded-2xl border border-border bg-cream/40 text-base text-ink focus:outline-none focus:ring-2 focus:ring-cyan-pop"
        />
      </label>
      <button
        disabled={submitting}
        className="touch-min btn-pill btn-coral text-base px-7 py-3.5 justify-self-start disabled:opacity-50"
      >
        <Send className="w-4 h-4" /> {submitting ? "Sending..." : "Send Message / Envoyer"}
      </button>
    </form>
  );
}

function Field({
  label,
  ...rest
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-ink mb-1.5 block">{label}</span>
      <input
        {...rest}
        className="w-full px-4 py-3 rounded-2xl border border-border bg-cream/40 text-base text-ink focus:outline-none focus:ring-2 focus:ring-cyan-pop"
      />
    </label>
  );
}
