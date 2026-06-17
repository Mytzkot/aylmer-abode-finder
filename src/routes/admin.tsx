import { createFileRoute, Link, Outlet, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ClipboardList, Users, DoorOpen, LogOut, Eye, LayoutGrid, BookOpen, CalendarDays, Home } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useServerFn } from "@tanstack/react-start";
import { getVisitorCount } from "@/lib/visitor-counter.functions";
import { toast } from "sonner";
import logo from "@/assets/zorba-logo.png";

export const Route = createFileRoute("/admin")({ component: AdminLayout });

function AdminLayout() {
  const [user, setUser] = useState<any | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [visitors, setVisitors] = useState<number | null>(null);
  const path = useRouterState({ select: s => s.location.pathname });
  const navigate = useNavigate();
  const fetchVisitors = useServerFn(getVisitorCount);

  useEffect(() => {
    if (!isSupabaseConfigured) { setLoading(false); return; }
    supabase.auth.getSession().then(({ data }) => { setUser(data.session?.user ?? null); setLoading(false); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  // Verify admin role server-side via user_roles; non-admins are signed out.
  useEffect(() => {
    if (!user) { setIsAdmin(null); return; }
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (cancelled) return;
      if (error || !data) {
        setIsAdmin(false);
        await supabase.auth.signOut();
        toast.error("This account does not have admin access.");
        navigate({ to: "/" });
      } else {
        setIsAdmin(true);
      }
    })();
    return () => { cancelled = true; };
  }, [user, navigate]);

  useEffect(() => {
    if (user && isAdmin) fetchVisitors().then(r => setVisitors(r.count)).catch(() => {});
  }, [user, isAdmin, fetchVisitors]);

  useEffect(() => {
    if (user && isAdmin && path === "/admin") navigate({ to: "/admin/applications" });
  }, [user, isAdmin, path, navigate]);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) {
      console.error("Admin sign-in error:", error);
      toast.error("Invalid email or password.");
    }
  };

  const signOut = async () => { await supabase.auth.signOut(); };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (!isSupabaseConfigured) {
    return <div className="min-h-screen flex items-center justify-center px-4 text-center text-sm text-muted-foreground">
      Supabase not connected. Add credentials in <code className="bg-secondary px-1 rounded">src/lib/supabase.ts</code> to enable admin.
    </div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen grid place-items-center px-4 bg-background">
        <form onSubmit={signIn} className="w-full max-w-sm bg-card rounded-2xl border border-border p-6 space-y-4 shadow">
          <div className="flex flex-col items-center gap-2 mb-2">
            <img src={logo} alt="ZORBA RENTALS" className="h-14 w-auto" />
            <h1 className="text-xl font-bold text-ink">Admin Login</h1>
          </div>
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email" required className="w-full px-3 py-2.5 rounded-xl border border-input bg-background" />
          <input value={pass} onChange={e => setPass(e.target.value)} placeholder="Password" type="password" required className="w-full px-3 py-2.5 rounded-xl border border-input bg-background" />
          <button className="touch-min btn-pill btn-brand w-full">Sign In</button>
        </form>
      </div>
    );
  }

  // Block UI until admin role is verified; non-admins are signed out + redirected above.
  if (isAdmin !== true) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">Verifying access…</div>;
  }

  const navItems = [
    { to: "/admin/applications", label: "Apps", icon: ClipboardList },
    { to: "/admin/tenants", label: "Tenants", icon: Users },
    { to: "/admin/rooms", label: "Rooms", icon: DoorOpen },
    { to: "/admin/board", label: "Board", icon: LayoutGrid },
    { to: "/admin/calendar", label: "Calendar", icon: CalendarDays },
    { to: "/admin/ledger", label: "Ledger", icon: BookOpen },
  ];



  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      <aside className="hidden md:flex md:w-60 md:flex-col border-r border-border bg-card p-4">
        <Link to="/" className="flex items-center gap-2 mb-6">
          <img src={logo} alt="ZORBA RENTALS" className="h-10 w-auto" />
          <span className="text-xs font-bold tracking-wider text-ink/60 uppercase">Admin</span>
        </Link>
        <nav className="flex-1 space-y-1">
          {navItems.map(n => (
            <Link key={n.to} to={n.to}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium ${path.startsWith(n.to) ? "bg-brand text-white" : "hover:bg-cream"}`}>
              <n.icon className="w-4 h-4" /> {n.label}
            </Link>
          ))}
        </nav>
        <div className="mt-4 mb-2 px-3 py-2 rounded-xl bg-cream/60 border border-border text-xs">
          <div className="flex items-center gap-1.5 text-ink/60 font-semibold uppercase tracking-wider mb-0.5">
            <Eye className="w-3.5 h-3.5" /> Site visitors
          </div>
          <div className="text-lg font-bold text-ink">
            {visitors !== null ? visitors.toLocaleString() : "—"}
          </div>
        </div>
        <button onClick={signOut} className="touch-min flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-cream text-ink/60">
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </aside>

      <header className="md:hidden sticky top-0 z-10 bg-card border-b border-border px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="ZORBA RENTALS" className="h-9 w-auto" />
          <span className="text-xs font-bold tracking-wider text-ink/60 uppercase">Admin</span>
        </Link>
        <button onClick={signOut} className="touch-min p-2 rounded-xl hover:bg-cream"><LogOut className="w-5 h-5" /></button>
      </header>

      <main className="flex-1 pb-20 md:pb-0"><Outlet /></main>

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-card border-t border-border grid grid-cols-6">
        {navItems.map(n => (
          <Link key={n.to} to={n.to} className={`touch-min flex flex-col items-center justify-center py-2 text-xs font-medium ${path.startsWith(n.to) ? "text-primary" : "text-muted-foreground"}`}>
            <n.icon className="w-5 h-5 mb-0.5" /> {n.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
