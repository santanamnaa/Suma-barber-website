"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase/client";

export default function LocationsAdminPage() {
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<{ type: "add" | "edit" | "delete" | null, data?: any }>({ type: null });
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  async function fetchLocations() {
    setLoading(true);
    let query = supabase.from("locations").select("*", { count: "exact" }).order("created_at", { ascending: false });
    if (search) query = query.ilike("name", `%${search}%`);
    const { data, error } = await query.range((page-1)*pageSize, page*pageSize-1);
    setLocations(data || []);
    setLoading(false);
  }

  useEffect(() => { fetchLocations(); }, [search, page]);

  function openAdd() {
    setForm({});
    setModal({ type: "add" });
  }
  function openEdit(l: any) {
    setForm(l);
    setModal({ type: "edit", data: l });
  }
  function openDelete(l: any) {
    setModal({ type: "delete", data: l });
  }
  async function handleSave() {
    setSaving(true);
    if (modal.type === "add") {
      await supabase.from("locations").insert([{ ...form }]);
    } else if (modal.type === "edit") {
      await supabase.from("locations").update({ ...form }).eq("id", form.id);
    }
    setSaving(false);
    setModal({ type: null });
    fetchLocations();
  }
  async function handleDelete() {
    setSaving(true);
    await supabase.from("locations").delete().eq("id", modal.data.id);
    setSaving(false);
    setModal({ type: null });
    fetchLocations();
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-2 sm:px-6 md:px-8">
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle>Manajemen Lokasi</CardTitle>
          <div className="flex gap-2 items-center w-full md:w-auto">
            <Input
              placeholder="Cari nama lokasi..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full md:w-64"
            />
            <Button onClick={openAdd}>+ Tambah Lokasi</Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="w-full h-20 flex items-center justify-center animate-pulse text-gray-400">Memuat data...</div>
          ) : locations.length === 0 ? (
            <div className="w-full h-20 flex items-center justify-center text-gray-400">Tidak ada lokasi</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Area</TableHead>
                  <TableHead>Alamat</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locations.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell>{l.name}</TableCell>
                    <TableCell>{l.area}</TableCell>
                    <TableCell>{l.address}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => openEdit(l)}>Edit</Button>
                      <Button size="sm" variant="destructive" className="ml-2" onClick={() => openDelete(l)}>Hapus</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {/* Pagination */}
          <div className="flex justify-end mt-4 gap-2">
            <Button size="sm" variant="outline" onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}>Sebelumnya</Button>
            <span className="px-2 py-1 text-sm">Halaman {page}</span>
            <Button size="sm" variant="outline" onClick={() => setPage(p => p+1)} disabled={locations.length < pageSize}>Berikutnya</Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal Add/Edit */}
      {(modal.type === "add" || modal.type === "edit") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-black" onClick={() => setModal({ type: null })}>✕</button>
            <h2 className="text-xl font-bold mb-4 text-black">{modal.type === "add" ? "Tambah Lokasi" : "Edit Lokasi"}</h2>
            <form onSubmit={e => { e.preventDefault(); handleSave(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nama</label>
                <input className="w-full border rounded px-3 py-2" value={form.name || ""} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Area</label>
                <input className="w-full border rounded px-3 py-2" value={form.area || ""} onChange={e => setForm({ ...form, area: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Alamat</label>
                <input className="w-full border rounded px-3 py-2" value={form.address || ""} onChange={e => setForm({ ...form, address: e.target.value })} required />
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
            <h2 className="text-xl font-bold mb-4 text-black">Hapus Lokasi</h2>
            <p className="mb-4 text-gray-700">Yakin ingin menghapus lokasi <b>{modal.data.name}</b>?</p>
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