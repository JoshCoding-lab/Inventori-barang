'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
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
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    getKategori()
    getBarang()
  }, [])

  async function getKategori() {
    const { data, error } = await supabase.from('kategori').select('*')
    if (error) console.error('Error getKategori:', error)
    else setKategori(data)
  }

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

  async function handleTambah(e) {
    e.preventDefault()
    if (!namaBarang || !stok || !harga || !kategoriId) {
      alert('Lengkapi semua data!')
      return
    }

    setIsSubmitting(true)
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
      resetForm()
      getBarang(filterKategori, searchQuery)
    }
    setIsSubmitting(false)
  }

  async function handleEdit(id) {
    const item = barang.find((b) => b.id === id)
    setEditId(id)
    setNamaBarang(item.nama_barang)
    setStok(item.stok)
    setHarga(item.harga)
    setKategoriId(item.id_kategori)
  }

  async function handleUpdate(e) {
    e.preventDefault()
    setIsSubmitting(true)
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
      resetForm()
      getBarang(filterKategori, searchQuery)
    }
    setIsSubmitting(false)
  }

  function resetForm() {
    setEditId(null)
    setNamaBarang('')
    setStok('')
    setHarga('')
    setKategoriId('')
  }

  async function handleHapus(id) {
    const confirmDelete = confirm('Yakin mau hapus barang ini?')
    if (!confirmDelete) return

    const { error } = await supabase.from('barang').delete().eq('id', id)
    if (error) console.error(error)
    else getBarang(filterKategori, searchQuery)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Inventori</h1>
              <p className="text-gray-600 mt-2">Kelola data barang dan stok dengan mudah</p>
            </div>
            <button
              onClick={handleLogout}
              className="mt-4 sm:mt-0 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Form Section */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {editId ? 'Edit Barang' : 'Tambah Barang Baru'}
                </h2>
              </div>

              <form onSubmit={editId ? handleUpdate : handleTambah} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Barang
                    </label>
                    <input
                      type="text"
                      placeholder="Masukkan nama barang"
                      value={namaBarang}
                      onChange={(e) => setNamaBarang(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kategori
                    </label>
                    <select
                      value={kategoriId}
                      onChange={(e) => setKategoriId(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                      required
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stok
                    </label>
                    <input
                      type="number"
                      placeholder="Jumlah stok"
                      value={stok}
                      onChange={(e) => setStok(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Harga (Rp)
                    </label>
                    <input
                      type="number"
                      placeholder="Harga barang"
                      value={harga}
                      onChange={(e) => setHarga(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white transition-colors duration-200 ${
                      editId
                        ? 'bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-400'
                        : 'bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Memproses...
                      </>
                    ) : editId ? (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Simpan Perubahan
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Tambah Barang
                      </>
                    )}
                  </button>

                  {editId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors duration-200"
                    >
                      Batal
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <div className="flex items-center gap-3 mb-4 sm:mb-0">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Daftar Barang</h2>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    value={filterKategori}
                    onChange={(e) => {
                      const val = e.target.value
                      setFilterKategori(val)
                      getBarang(val, searchQuery)
                    }}
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                  >
                    <option value="">Semua Kategori</option>
                    {kategori.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.nama_kategori}
                      </option>
                    ))}
                  </select>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Cari barang..."
                      value={searchQuery}
                      onChange={(e) => {
                        const val = e.target.value
                        setSearchQuery(val)
                        getBarang(filterKategori, val)
                      }}
                      className="pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 w-full"
                    />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">Nama Barang</th>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">Kategori</th>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">Stok</th>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">Harga</th>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {barang.map((b) => (
                      <tr key={b.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-4 py-4 text-sm text-gray-900 font-medium">{b.nama_barang}</td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                            {b.kategori_nama}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            b.stok > 10 
                              ? 'bg-green-100 text-green-800'
                              : b.stok > 0
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {b.stok} unit
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900 font-medium">
                          Rp {b.harga.toLocaleString('id-ID')}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(b.id)}
                              className="flex items-center gap-1 px-3 py-2 text-sm bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors duration-200"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit
                            </button>
                            <button
                              onClick={() => handleHapus(b.id)}
                              className="flex items-center gap-1 px-3 py-2 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors duration-200"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {barang.length === 0 && (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="text-gray-500 text-lg">Tidak ada data barang</p>
                    <p className="text-gray-400 text-sm mt-1">Mulai dengan menambahkan barang baru</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Stats & Chart */}
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ringkasan Inventori</h3>
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Total Barang</p>
                      <p className="text-2xl font-bold text-blue-700">{barang.length}</p>
                    </div>
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 font-medium">Total Stok</p>
                      <p className="text-2xl font-bold text-green-700">
                        {barang.reduce((sum, item) => sum + item.stok, 0)} unit
                      </p>
                    </div>
                    <div className="p-2 bg-green-100 rounded-lg">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Grafik Stok Barang</h3>
              </div>

              {barang.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barang}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="nama_barang" 
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        fontSize={12}
                      />
                      <YAxis fontSize={12} />
                      <Tooltip 
                        formatter={(value) => [`${value} unit`, 'Stok']}
                        labelFormatter={(label) => `Barang: ${label}`}
                      />
                      <Legend />
                      <Bar 
                        dataKey="stok" 
                        name="Jumlah Stok" 
                        fill="#3b82f6"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p className="text-gray-500">Belum ada data untuk ditampilkan</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}