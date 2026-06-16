import { useState } from "react";
import { MessageCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { T, useTranslated } from "@/i18n/LanguageProvider";
import { CONTACT } from "@/data/properties";

const LOCATIONS = [
  "102 Chemin d'Amour",
  "58 Rue Conrad-Valéra",
  "260 Avenue de la Colline",
];

export function TenantMessageForm() {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fullNamePh = useTranslated("Your full name");
  const phonePh = useTranslated("Phone number");
  const emailPh = useTranslated("Email address");
  const roomPh = useTranslated("Room number (e.g. 3)");
  const msgPh = useTranslated("How can we help you?");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const full_name = String(fd.get("full_name") || "").trim();
    const phone = String(fd.get("phone") || "").trim();
    const email = String(fd.get("email") || "").trim();
    const location = String(fd.get("location") || "").trim();
    const room_number = String(fd.get("room_number") || "").trim();
    const message = String(fd.get("message") || "").trim();

    if (!full_name || !email || !location || !message) {
      setError("Please fill in name, email, location and message.");
      setSubmitting(false);
      return;
    }

    const { error: insErr } = await supabase
      .from("tenant_messages")
      .insert({ full_name, phone, email, location, room_number, message });

    if (insErr) {
      console.error("Tenant message submit error:", insErr);
      setError("We couldn't send your message. Please try again.");
      setSubmitting(false);
      return;
    }

    // Open pre-filled WhatsApp in a new tab
    const waText =
      `Hi Zorba — tenant message:%0A` +
      `Name: ${encodeURIComponent(full_name)}%0A` +
      `Location: ${encodeURIComponent(location)}%0A` +
      `Room: ${encodeURIComponent(room_number || "—")}%0A` +
      `Phone: ${encodeURIComponent(phone || "—")}%0A` +
      `Message: ${encodeURIComponent(message)}`;
    window.open(`https://wa.me/13432025460?text=${waText}`, "_blank", "noopener,noreferrer");

    setDone(true);
    setSubmitting(false);
  }

  if (done) {
    return (
      <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-6 text-center">
        <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
        <h3 className="font-display text-2xl text-ink">
          <T>Thank you, we'll get back to you shortly</T>
        </h3>
        <p className="text-ink/70 mt-2">
          <T>Your message was sent. We also opened WhatsApp so you can send it directly with one tap.</T>
        </p>
        <a
          href={CONTACT.whatsapp}
          target="_blank"
          rel="noreferrer"
          className="btn-pill bg-[#25D366] text-white hover:brightness-110 px-5 py-2.5 mt-4 inline-flex font-bold"
        >
          <MessageCircle className="w-4 h-4" /> WhatsApp
        </a>
      </div>
    );
  }

  const inputCls =
    "w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-ink placeholder:text-ink/40 focus:outline-none focus:border-coral";

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <input name="full_name" required placeholder={fullNamePh} className={inputCls} />
      <div className="grid sm:grid-cols-2 gap-3">
        <input name="phone" type="tel" placeholder={phonePh} className={inputCls} />
        <input name="email" type="email" required placeholder={emailPh} className={inputCls} />
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <select name="location" required defaultValue="" className={inputCls}>
          <option value="" disabled>
            <T>Select location</T>
          </option>
          {LOCATIONS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
        <input name="room_number" placeholder={roomPh} className={inputCls} />
      </div>
      <textarea name="message" required rows={5} placeholder={msgPh} className={inputCls} />
      {error && <p className="text-sm text-red-600 font-semibold">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="btn-pill btn-coral px-6 py-3 w-full justify-center font-bold disabled:opacity-60"
      >
        {submitting ? <T>Sending…</T> : <T>Send Message</T>}
      </button>
      <p className="text-xs text-ink/60 text-center">
        <T>Submitting will also open WhatsApp pre-filled so you can send it directly.</T>
      </p>
    </form>
  );
}
