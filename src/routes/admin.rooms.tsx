import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/lib/supabase";
import { syncSquareCatalog } from "@/lib/square.functions";
import { toast } from "sonner";
import { Trash2, Upload } from "lucide-react";

export const Route = createFileRoute("/admin/rooms")({ component: RoomsPage });

interface Room {
  id: string;
  name?: string;
  current_status?: string;
  base_rate?: number;
  image_urls?: string[] | null;
  externally_managed?: boolean | null;
  manual_available?: boolean | null;
}

const STATUSES = ["Available", "Rented", "Maintenance"] as const;
// 10-year signed URL — refresh by re-uploading if Supabase storage signing key rotates.
const SIGNED_URL_TTL_SECONDS = 60 * 60 * 24 * 365 * 10;

function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const sync = useServerFn(syncSquareCatalog);

  const load = async () => {
    const { data, error } = await supabase
      .from("rooms")
      .select("id, name, current_status, base_rate, image_urls, externally_managed, manual_available")
      .order("name");
    if (error) {
      console.error(error);
      toast.error("Could not load rooms.");
    }
    setRooms((data as Room[]) || []);
  };
  useEffect(() => {
    load();
  }, []);

  const setStatus = async (r: Room, status: string) => {
    const { error } = await supabase.from("rooms").update({ current_status: status }).eq("id", r.id);
    if (error) {
      console.error(error);
      toast.error("Could not update status.");
      return;
    }
    setRooms(rooms.map((x) => (x.id === r.id ? { ...x, current_status: status } : x)));
  };

  const setManualAvailable = async (r: Room, value: boolean) => {
    const { error } = await supabase.from("rooms").update({ manual_available: value }).eq("id", r.id);
    if (error) {
      console.error(error);
      toast.error("Could not update availability.");
      return;
    }
    setRooms(rooms.map((x) => (x.id === r.id ? { ...x, manual_available: value } : x)));
    toast.success(value ? "Marked as available on public site." : "Marked as not available on public site.");
  };

  const handleFiles = async (room: Room, files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadingId(room.id);
    const newUrls: string[] = [];
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) {
          toast.error(`Skipped ${file.name}: not an image.`);
          continue;
        }
        const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const path = `${room.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("room-images")
          .upload(path, file, { cacheControl: "31536000", upsert: false, contentType: file.type });
        if (upErr) {
          console.error(upErr);
          toast.error(`Upload failed for ${file.name}.`);
          continue;
        }
        const { data: signed, error: sErr } = await supabase.storage
          .from("room-images")
          .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);
        if (sErr || !signed?.signedUrl) {
          console.error(sErr);
          toast.error(`Could not generate link for ${file.name}.`);
          continue;
        }
        newUrls.push(signed.signedUrl);
      }
      if (newUrls.length > 0) {
        const merged = [...(room.image_urls || []), ...newUrls];
        const { error: updErr } = await supabase
          .from("rooms")
          .update({ image_urls: merged })
          .eq("id", room.id);
        if (updErr) {
          console.error(updErr);
          toast.error("Saved files but could not link them to the room.");
        } else {
          setRooms((rs) => rs.map((x) => (x.id === room.id ? { ...x, image_urls: merged } : x)));
          toast.success(`Added ${newUrls.length} photo${newUrls.length === 1 ? "" : "s"}.`);
        }
      }
    } finally {
      setUploadingId(null);
    }
  };

  const removeImage = async (room: Room, url: string) => {
    const remaining = (room.image_urls || []).filter((u) => u !== url);
    const { error } = await supabase.from("rooms").update({ image_urls: remaining }).eq("id", room.id);
    if (error) {
      console.error(error);
      toast.error("Could not remove photo.");
      return;
    }
    setRooms((rs) => rs.map((x) => (x.id === room.id ? { ...x, image_urls: remaining } : x)));
    // Best-effort: delete the underlying object if it's one of ours.
    const match = url.match(/\/room-images\/([^?]+)/);
    if (match?.[1]) {
      const path = decodeURIComponent(match[1]);
      await supabase.storage.from("room-images").remove([path]).catch(() => undefined);
    }
  };

  const runSync = async () => {
    setSyncing(true);
    try {
      const res = await sync();
      toast.success(`Synced ${res.upserted} rooms from ${res.items} Square items`);
      if (res.errors?.length) toast.error(res.errors.join("\n"));
      await load();
    } catch (e: unknown) {
      console.error(e);
      toast.error("Sync failed. Please try again.");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Rooms</h1>
        <button
          onClick={runSync}
          disabled={syncing}
          className="px-4 py-2 rounded-lg bg-foreground text-background text-sm font-semibold disabled:opacity-50"
        >
          {syncing ? "Syncing…" : "Sync from Square"}
        </button>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Upload one or more photos per room. The first photo becomes the room's cover image on the public site.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rooms.map((r) => (
          <RoomCard
            key={r.id}
            room={r}
            uploading={uploadingId === r.id}
            onStatus={(s) => setStatus(r, s)}
            onFiles={(fs) => handleFiles(r, fs)}
            onRemove={(url) => removeImage(r, url)}
          />
        ))}
        {rooms.length === 0 && <p className="text-sm text-muted-foreground">No rooms found.</p>}
      </div>
    </div>
  );
}

function RoomCard({
  room,
  uploading,
  onStatus,
  onFiles,
  onRemove,
}: {
  room: Room;
  uploading: boolean;
  onStatus: (s: string) => void;
  onFiles: (fs: FileList | null) => void;
  onRemove: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const s = room.current_status || "Available";
  const tone =
    s.toLowerCase() === "available"
      ? "bg-success text-white"
      : s.toLowerCase() === "rented"
        ? "bg-foreground text-background"
        : "bg-destructive/10 text-destructive";
  const images = room.image_urls || [];

  return (
    <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
      <div>
        <div className="font-bold">{room.name || room.id}</div>
      </div>

      <div className="flex items-center justify-between">
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${tone}`}>{s}</span>
        <span className="text-sm font-semibold">${room.base_rate ?? "—"}</span>
      </div>

      <select
        value={s}
        onChange={(e) => onStatus(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
      >
        {STATUSES.map((st) => (
          <option key={st} value={st}>
            {st}
          </option>
        ))}
      </select>

      <div>
        <div className="text-xs font-semibold text-muted-foreground mb-2">
          Photos ({images.length})
        </div>
        {images.length > 0 ? (
          <div className="grid grid-cols-3 gap-2 mb-2">
            {images.map((url, i) => (
              <div key={`${url}-${i}`} className="relative group aspect-square rounded-lg overflow-hidden bg-muted">
                <img src={url} alt={`Room photo ${i + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => onRemove(url)}
                  className="absolute top-1 right-1 w-7 h-7 rounded-full bg-black/70 text-white opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
                  aria-label="Remove photo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                {i === 0 && (
                  <span className="absolute bottom-1 left-1 text-[10px] bg-black/70 text-white px-1.5 py-0.5 rounded">
                    Cover
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-muted-foreground italic mb-2">No photos yet.</div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            onFiles(e.target.files);
            if (inputRef.current) inputRef.current.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-dashed border-input bg-background text-sm font-medium hover:bg-muted disabled:opacity-50"
        >
          <Upload className="w-4 h-4" />
          {uploading ? "Uploading…" : "Upload photos"}
        </button>
      </div>
    </div>
  );
}
