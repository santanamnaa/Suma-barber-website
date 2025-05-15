"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase/client";

export default function LocationServicesAdminPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<{ type: "add" | "edit" | "delete" | null, data?: any }>({ type: null });
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [locations, setLocations] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const pageSize = 10;

  async function fetchAll() {
    setLoading(true);
    // Join location_services with locations and services
    let query = supabase
      .from("location_services")
      .select(`*, locations(name), services(name)`)
      .order("created_at", { ascending: false });
    if (search) query = query.ilike("locations.name", `%${search}%`);
    const { data, error } = await query;
    setData(data || []);
    setLoading(false);
  }

  async function fetchDropdowns() {
    const { data: locs } = await supabase.from("locations").select("id, name").order("name");
    const { data: svcs } = await supabase.from("services").select("id, name").order("name");
    setLocations(locs || []);
    setServices(svcs || []);
  }

  useEffect(() => { fetchAll(); fetchDropdowns(); }, []);
  useEffect(() => { fetchAll(); }, [search, page]);

  function openAdd() {
    setForm({});
    setModal({ type: "add" });
  }
  function openEdit(row: any) {
    setForm({ ...row, location_id: row.location_id, service_id: row.service_id });
    setModal({ type: "edit", data: row });
  }
  function openDelete(row: any) {
    setModal({ type: "delete", data: row });
  }
  async function handleSave() {
    setSaving(true);
    if (modal.type === "add") {
      await supabase.from("location_services").insert([{ ...form }]);
    } else if (modal.type === "edit") {
      await supabase.from("location_services").update({ ...form }).eq("id", form.id);
    }
    setSaving(false);
    setModal({ type: null });
    fetchAll();
  }
  async function handleDelete() {
    setSaving(true);
    await supabase.from("location_services").delete().eq("id", modal.data.id);
    setSaving(false);
    setModal({ type: null });
    fetchAll();
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-2 sm:px-6 md:px-8">
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle>Manajemen Layanan di Lokasi</CardTitle>
          <div className="flex gap-2 items-center w-full md:w-auto">
            <Input
              placeholder="Cari nama lokasi..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full md:w-64"
            />
            <Button onClick={openAdd}>+ Tambah Layanan di Lokasi</Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="w-full h-20 flex items-center justify-center animate-pulse text-gray-400">Memuat data...</div>
          ) : data.length === 0 ? (
            <div className="w-full h-20 flex items-center justify-center text-gray-400">Tidak ada data</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lokasi</TableHead>
                  <TableHead>Layanan</TableHead>
                  <TableHead>Harga</TableHead>
                  <TableHead>Durasi (menit)</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.locations?.name || '-'}</TableCell>
                    <TableCell>{row.services?.name || '-'}</TableCell>
                    <TableCell>{row.price ? row.price.toLocaleString("id-ID") : '-'}</TableCell>
                    <TableCell>{row.duration || '-'}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => openEdit(row)}>Edit</Button>
                      <Button size="sm" variant="destructive" className="ml-2" onClick={() => openDelete(row)}>Hapus</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal Add/Edit */}
      {(modal.type === "add" || modal.type === "edit") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-black" onClick={() => setModal({ type: null })}>✕</button>
            <h2 className="text-xl font-bold mb-4 text-black">{modal.type === "add" ? "Tambah Layanan di Lokasi" : "Edit Layanan di Lokasi"}</h2>
            <form onSubmit={e => { e.preventDefault(); handleSave(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Lokasi</label>
                <select className="w-full border rounded px-3 py-2" value={form.location_id || ""} onChange={e => setForm({ ...form, location_id: e.target.value })} required>
                  <option value="">Pilih Lokasi</option>
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Layanan</label>
                <select className="w-full border rounded px-3 py-2" value={form.service_id || ""} onChange={e => setForm({ ...form, service_id: e.target.value })} required>
                  <option value="">Pilih Layanan</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Harga (IDR)</label>
                <input type="number" className="w-full border rounded px-3 py-2" value={form.price || 0} onChange={e => setForm({ ...form, price: Number(e.target.value) })} required min={0} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Durasi (menit)</label>
                <input type="number" className="w-full border rounded px-3 py-2" value={form.duration || 0} onChange={e => setForm({ ...form, duration: Number(e.target.value) })} required min={1} />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button type="button" variant="outline" onClick={() => setModal({ type: null })}>Batal</Button>
                <Button type="submit" disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal Delete */}
      {modal.type === "delete" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-black" onClick={() => setModal({ type: null })}>✕</button>
            <h2 className="text-xl font-bold mb-4 text-black">Hapus Layanan di Lokasi</h2>
            <p className="mb-4 text-gray-700">Yakin ingin menghapus layanan <b>{modal.data.services?.name}</b> di lokasi <b>{modal.data.locations?.name}</b>?</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setModal({ type: null })}>Batal</Button>
              <Button variant="destructive" onClick={handleDelete} disabled={saving}>{saving ? "Menghapus..." : "Hapus"}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 