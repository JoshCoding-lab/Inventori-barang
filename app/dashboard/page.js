'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const router = useRouter()
  const [barang, setBarang] = useState([])
  const [kategori, setKategori] = useState([])
  const [namaBarang, setNamaBarang] = useState('')
  const [stok, setStok] = useState('')
  const [harga, setHarga] = useState('')
  const [kategoriId, setKategoriId] = useState('')
  const [filterKategori, setFilterKategori] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [editId, setEditId] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getKategori()
    getBarang()
  }, [])

  // Ambil daftar kategori
  async function getKategori() {
    const { data, error } = await supabase.from('kategori').select('*')
    if (error) console.error('Error getKategori:', error)
    else setKategori(data)
  }

  // Ambil daftar barang (dengan filter & pencarian)
  async function getBarang(filter = '', search = '') {
    let query = supabase
      .from('barang')
      .select('id, nama_barang, stok, harga, id_kategori, kategori (nama_kategori)')

    if (filter) query = query.eq('id_kategori', filter)
    if (search) query = query.ilike('nama_barang', `%${search}%`)

    const { data, error } = await query

    if (error) console.error('Error getBarang:', error)
    else {
      const formatted = data.map((b) => ({
        ...b,
        kategori_nama: b.kategori?.nama_kategori || '-',
      }))
      setBarang(formatted)
    }
    setLoading(false)
  }

  // Tambah barang baru
  async function handleTambah(e) {
    e.preventDefault()
    if (!namaBarang || !stok || !harga || !kategoriId) return alert('Lengkapi semua data!')

    const { error } = await supabase.from('barang').insert([
      {
        nama_barang: namaBarang,
        stok: parseInt(stok),
        harga: parseFloat(harga),
        id_kategori: parseInt(kategoriId),
      },
    ])

    if (error) console.error(error)
    else {
      setNamaBarang('')
      setStok('')
      setHarga('')
      setKategoriId('')
      getBarang(filterKategori, searchQuery)
    }
  }

  // Edit barang
  async function handleEdit(id) {
    const item = barang.find((b) => b.id === id)
    setEditId(id)
    setNamaBarang(item.nama_barang)
    setStok(item.stok)
    setHarga(item.harga)
    setKategoriId(item.id_kategori)
  }

  // Simpan perubahan setelah edit
  async function handleUpdate(e) {
    e.preventDefault()
    const { error } = await supabase
      .from('barang')
      .update({
        nama_barang: namaBarang,
        stok: parseInt(stok),
        harga: parseFloat(harga),
        id_kategori: parseInt(kategoriId),
      })
      .eq('id', editId)

    if (error) console.error(error)
    else {
      setEditId(null)
      setNamaBarang('')
      setStok('')
      setHarga('')
      setKategoriId('')
      getBarang(filterKategori, searchQuery)
    }
  }

  // Hapus barang
  async function handleHapus(id) {
    const confirmDelete = confirm('Yakin mau hapus barang ini?')
    if (!confirmDelete) return

    const { error } = await supabase.from('barang').delete().eq('id', id)
    if (error) console.error(error)
    else getBarang(filterKategori, searchQuery)
  }

  // Logout
  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return <p className="text-center mt-10">Loading...</p>

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard Inventori</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      {/* Form Tambah / Edit Barang */}
      <form
        onSubmit={editId ? handleUpdate : handleTambah}
        className="mb-6 bg-white p-6 rounded-xl shadow-md border"
      >
        <h2 className="text-lg font-semibold mb-4 text-gray-700">
          {editId ? 'Edit Barang' : 'Tambah Barang'}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Nama Barang
            </label>
            <input
              type="text"
              placeholder="Contoh: Laptop"
              value={namaBarang}
              onChange={(e) => setNamaBarang(e.target.value)}
              className="border w-full p-2 rounded focus:ring-2 focus:ring-blue-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Kategori
            </label>
            <select
              value={kategoriId}
              onChange={(e) => setKategoriId(e.target.value)}
              className="border w-full p-2 rounded focus:ring-2 focus:ring-blue-300"
            >
              <option value="">Pilih Kategori</option>
              {kategori.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.nama_kategori}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Stok
            </label>
            <input
              type="number"
              placeholder="Contoh: 10"
              value={stok}
              onChange={(e) => setStok(e.target.value)}
              className="border w-full p-2 rounded focus:ring-2 focus:ring-blue-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Harga
            </label>
            <input
              type="number"
              placeholder="Contoh: 1500000"
              value={harga}
              onChange={(e) => setHarga(e.target.value)}
              className="border w-full p-2 rounded focus:ring-2 focus:ring-blue-300"
            />
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <button
            type="submit"
            className={`px-5 py-2 text-white font-semibold rounded ${
              editId
                ? 'bg-yellow-500 hover:bg-yellow-600'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {editId ? 'Simpan Perubahan' : 'Tambah Barang'}
          </button>
        </div>
      </form>

      {/* Filter & Pencarian */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 mb-4">
        <div>
          <label className="text-gray-600 font-medium mr-2">Filter Kategori:</label>
          <select
            value={filterKategori}
            onChange={(e) => {
              const val = e.target.value
              setFilterKategori(val)
              getBarang(val, searchQuery)
            }}
            className="border p-2 rounded focus:ring-2 focus:ring-blue-300"
          >
            <option value="">Semua</option>
            {kategori.map((k) => (
              <option key={k.id} value={k.id}>
                {k.nama_kategori}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-gray-600 font-medium">Cari Barang:</label>
          <input
            type="text"
            placeholder="Ketik nama barang..."
            value={searchQuery}
            onChange={(e) => {
              const val = e.target.value
              setSearchQuery(val)
              getBarang(filterKategori, val)
            }}
            className="border p-2 rounded w-60 focus:ring-2 focus:ring-blue-300"
          />
        </div>
      </div>

      {/* Tabel Barang */}
      <table className="w-full bg-white shadow rounded-lg">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-3 text-left">Nama Barang</th>
            <th className="p-3 text-left">Kategori</th>
            <th className="p-3 text-left">Stok</th>
            <th className="p-3 text-left">Harga</th>
            <th className="p-3 text-left">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {barang.map((b) => (
            <tr key={b.id} className="border-t">
              <td className="p-3">{b.nama_barang}</td>
              <td className="p-3">{b.kategori_nama}</td>
              <td className="p-3">{b.stok}</td>
              <td className="p-3">Rp {b.harga.toLocaleString()}</td>
              <td className="p-3 flex gap-2">
                <button
                  onClick={() => handleEdit(b.id)}
                  className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleHapus(b.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                >
                  Hapus
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Grafik Stok Barang */}
<div className="bg-white mt-10 p-6 rounded-xl shadow-md border">
  <h2 className="text-xl font-semibold mb-4 text-gray-700">Grafik Stok Barang</h2>
  {barang.length > 0 ? (
    <div className="w-full overflow-x-auto">
      <BarChart
        width={700}
        height={350}
        data={barang}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="nama_barang" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="stok" fill="#3b82f6" name="Jumlah Stok" />
      </BarChart>
    </div>
  ) : (
    <p className="text-gray-500">Belum ada data barang untuk ditampilkan.</p>
  )}
</div>

    </div>
  )
}
