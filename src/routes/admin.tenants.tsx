import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/tenants")({ component: TenantsPage });

interface Tenant { id: string; first_name?: string; surname?: string; email?: string; telephone?: string; payment_status?: string; room_id?: string; [k: string]: any }

function TenantsPage() {
  const [rows, setRows] = useState<Tenant[]>([]);

  const load = async () => {
    const { data, error } = await supabase.from("tenants").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows((data as Tenant[]) || []);
  };
  useEffect(() => { load(); }, []);

  const togglePaid = async (t: Tenant) => {
    const next = (t.payment_status || "unpaid").toLowerCase() === "paid" ? "unpaid" : "paid";
    const { error } = await supabase.from("tenants").update({ payment_status: next }).eq("id", t.id);
    if (error) { toast.error(error.message); return; }
    setRows(rows.map(r => r.id === t.id ? { ...r, payment_status: next } : r));
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Tenants</h1>
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary">
            <tr><th className="text-start p-3">Name</th><th className="text-start p-3 hidden sm:table-cell">Contact</th><th className="text-start p-3">Status</th></tr>
          </thead>
          <tbody>
            {rows.map(t => {
              const paid = (t.payment_status || "unpaid").toLowerCase() === "paid";
              return (
                <tr key={t.id} className="border-t border-border">
                  <td className="p-3 font-medium">{t.first_name} {t.surname}</td>
                  <td className="p-3 text-muted-foreground hidden sm:table-cell">{t.email || t.telephone}</td>
                  <td className="p-3">
                    <button onClick={() => togglePaid(t)}
                      className={`touch-min px-3 py-1.5 rounded-full text-xs font-bold ${paid ? "bg-success text-white" : "bg-destructive/10 text-destructive"}`}>
                      {paid ? "Paid" : "Unpaid"}
                    </button>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && <tr><td colSpan={3} className="p-6 text-center text-muted-foreground">No tenants yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
