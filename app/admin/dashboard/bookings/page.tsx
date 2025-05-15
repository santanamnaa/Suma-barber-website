"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase/client";

function formatRupiah(amount: number) {
  return amount.toLocaleString("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 });
}

export default function BookingsAdminPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<{ type: "add" | "edit" | "delete" | null, data?: any }>({ type: null });
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [locations, setLocations] = useState<any[]>([]);
  const [locationServices, setLocationServices] = useState<any[]>([]);
  const [filteredServices, setFilteredServices] = useState<any[]>([]);
  const pageSize = 10;

  async function fetchBookings() {
    setLoading(true);
    let query = supabase
      .from("bookings")
      .select("*, locations(name), booking_services(*, location_services(*, services(name)))")
      .order("created_at", { ascending: false });
    if (search) query = query.ilike("customer_name", `%${search}%`);
    const { data, error } = await query.range((page-1)*pageSize, page*pageSize-1);
    setBookings(data || []);
    setLoading(false);
  }

  async function fetchDropdowns() {
    const { data: locs } = await supabase.from("locations").select("id, name").order("name");
    const { data: locSvcs } = await supabase
      .from("location_services")
      .select("*, services(name)")
      .order("created_at", { ascending: false });
    setLocations(locs || []);
    setLocationServices(locSvcs || []);
  }

  useEffect(() => { fetchBookings(); fetchDropdowns(); }, []);
  useEffect(() => { fetchBookings(); }, [search, page]);

  // Filter layanan di lokasi sesuai lokasi yang dipilih
  useEffect(() => {
    if (form.location_id) {
      setFilteredServices(locationServices.filter((ls) => ls.location_id === form.location_id));
    } else {
      setFilteredServices([]);
    }
  }, [form.location_id, locationServices]);

  // Auto-fill harga & durasi saat layanan dipilih
  useEffect(() => {
    if (form.location_service_id) {
      const svc = locationServices.find((ls) => ls.id === form.location_service_id);
      if (svc) {
        setForm((f: any) => ({ ...f, total_price: svc.price, total_duration: svc.duration }));
      }
    }
  }, [form.location_service_id, locationServices]);

  function openAdd() {
    setForm({});
    setModal({ type: "add" });
  }
  function openEdit(b: any) {
    // Find the first booking_service for this booking
    const bs = b.booking_services?.[0];
    setForm({
      ...b,
      location_id: b.location_id,
      location_service_id: bs?.location_service_id,
      total_price: b.total_price,
      total_duration: b.total_duration,
    });
    setModal({ type: "edit", data: b });
  }
  function openDelete(b: any) {
    setModal({ type: "delete", data: b });
  }
  async function handleSave() {
    setSaving(true);
    if (modal.type === "add") {
      // Insert booking, then insert booking_service
      const { data: booking, error } = await supabase.from("bookings").insert([
        {
          customer_name: form.customer_name,
          customer_email: form.customer_email,
          customer_phone: form.customer_phone,
          booking_date: form.booking_date,
          booking_time: form.booking_time,
          total_price: form.total_price,
          total_duration: form.total_duration,
          status: form.status || "scheduled",
          location_id: form.location_id,
        },
      ]).select().maybeSingle();
      if (booking && form.location_service_id) {
        await supabase.from("booking_services").insert([
          {
            booking_id: booking.id,
            location_service_id: form.location_service_id,
          },
        ]);
      }
    } else if (modal.type === "edit") {
      await supabase.from("bookings").update({
        customer_name: form.customer_name,
        customer_email: form.customer_email,
        customer_phone: form.customer_phone,
        booking_date: form.booking_date,
        booking_time: form.booking_time,
        total_price: form.total_price,
        total_duration: form.total_duration,
        status: form.status,
        location_id: form.location_id,
      }).eq("id", form.id);
      // Update booking_service
      if (form.location_service_id) {
        const bs = modal.data.booking_services?.[0];
        if (bs) {
          await supabase.from("booking_services").update({
            location_service_id: form.location_service_id,
          }).eq("id", bs.id);
        } else {
          await supabase.from("booking_services").insert([
            {
              booking_id: form.id,
              location_service_id: form.location_service_id,
            },
          ]);
        }
      }
    }
    setSaving(false);
    setModal({ type: null });
    fetchBookings();
  }
  async function handleDelete() {
    setSaving(true);
    // Delete booking_services first
    const bs = modal.data.booking_services?.[0];
    if (bs) {
      await supabase.from("booking_services").delete().eq("id", bs.id);
    }
    await supabase.from("bookings").delete().eq("id", modal.data.id);
    setSaving(false);
    setModal({ type: null });
    fetchBookings();
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-2 sm:px-6 md:px-8">
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle>Manajemen Booking</CardTitle>
          <div className="flex gap-2 items-center w-full md:w-auto">
            <Input
              placeholder="Cari nama pelanggan..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full md:w-64"
            />
            <Button onClick={openAdd}>+ Tambah Booking</Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="w-full h-20 flex items-center justify-center animate-pulse text-gray-400">Memuat data...</div>
          ) : bookings.length === 0 ? (
            <div className="w-full h-20 flex items-center justify-center text-gray-400">Tidak ada booking</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Lokasi</TableHead>
                  <TableHead>Layanan</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Jam</TableHead>
                  <TableHead>Harga</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((b) => {
                  const bs = b.booking_services?.[0];
                  return (
                    <TableRow key={b.id}>
                      <TableCell>{b.customer_name}</TableCell>
                      <TableCell>{b.locations?.name || '-'}</TableCell>
                      <TableCell>{bs?.location_services?.services?.name || '-'}</TableCell>
                      <TableCell>{b.booking_date}</TableCell>
                      <TableCell>{b.booking_time}</TableCell>
                      <TableCell>{formatRupiah(b.total_price)}</TableCell>
                      <TableCell>{b.status}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => openEdit(b)}>Edit</Button>
                        <Button size="sm" variant="destructive" className="ml-2" onClick={() => openDelete(b)}>Hapus</Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
          {/* Pagination */}
          <div className="flex justify-end mt-4 gap-2">
            <Button size="sm" variant="outline" onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}>Sebelumnya</Button>
            <span className="px-2 py-1 text-sm">Halaman {page}</span>
            <Button size="sm" variant="outline" onClick={() => setPage(p => p+1)} disabled={bookings.length < pageSize}>Berikutnya</Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal Add/Edit */}
      {(modal.type === "add" || modal.type === "edit") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-black" onClick={() => setModal({ type: null })}>✕</button>
            <h2 className="text-xl font-bold mb-4 text-black">{modal.type === "add" ? "Tambah Booking" : "Edit Booking"}</h2>
            <form onSubmit={e => { e.preventDefault(); handleSave(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nama</label>
                <input className="w-full border rounded px-3 py-2" value={form.customer_name || ""} onChange={e => setForm({ ...form, customer_name: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input className="w-full border rounded px-3 py-2" value={form.customer_email || ""} onChange={e => setForm({ ...form, customer_email: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Telepon</label>
                <input className="w-full border rounded px-3 py-2" value={form.customer_phone || ""} onChange={e => setForm({ ...form, customer_phone: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Lokasi</label>
                <select className="w-full border rounded px-3 py-2" value={form.location_id || ""} onChange={e => setForm({ ...form, location_id: e.target.value, location_service_id: "" })} required>
                  <option value="">Pilih Lokasi</option>
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Layanan</label>
                <select className="w-full border rounded px-3 py-2" value={form.location_service_id || ""} onChange={e => setForm({ ...form, location_service_id: e.target.value })} required>
                  <option value="">Pilih Layanan</option>
                  {filteredServices.map((ls) => (
                    <option key={ls.id} value={ls.id}>{ls.services?.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Harga</label>
                <input className="w-full border rounded px-3 py-2 bg-gray-100" value={form.total_price || 0} readOnly />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Durasi (menit)</label>
                <input className="w-full border rounded px-3 py-2 bg-gray-100" value={form.total_duration || 0} readOnly />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tanggal</label>
                <input type="date" className="w-full border rounded px-3 py-2" value={form.booking_date || ""} onChange={e => setForm({ ...form, booking_date: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Jam</label>
                <input className="w-full border rounded px-3 py-2" value={form.booking_time || ""} onChange={e => setForm({ ...form, booking_time: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select className="w-full border rounded px-3 py-2" value={form.status || "scheduled"} onChange={e => setForm({ ...form, status: e.target.value })}>
                  <option value="scheduled">Dijadwalkan</option>
                  <option value="completed">Selesai</option>
                  <option value="cancelled">Dibatalkan</option>
                  <option value="no-show">Tidak Hadir</option>
                </select>
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
            <h2 className="text-xl font-bold mb-4 text-black">Hapus Booking</h2>
            <p className="mb-4 text-gray-700">Yakin ingin menghapus booking <b>{modal.data.customer_name}</b> pada tanggal <b>{modal.data.booking_date}</b>?</p>
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