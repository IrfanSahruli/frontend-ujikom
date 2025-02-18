import Link from "next/link";

function Sidebar({ setKategoriFilter }) {
    return (
        <div className="h-screen w-[303px] bg-[#ffffff] text-white flex flex-col sticky top-0 border-e">
            {/* Logo */}
            <div className="p-4 text-2xl font-bold border-b text-center">
                <p className="text-black">Kick<span className="text-yellow-600">Talk</span></p>
            </div>

            {/* Menu */}
            <nav className="flex-1">
                <ul className="p-4 space-y-4">
                    <li>
                        <Link href="/User/HomePage" className="block py-2 px-4 rounded text-black">
                            Home
                        </Link>
                    </li>
                    <li>
                        <Link href="/User/Notifikasi" className="block py-2 px-4 rounded text-black">
                            Notifikasi
                        </Link>
                    </li>
                    <li>
                        <Link href="/contact" className="block py-2 px-4 rounded text-black">
                            Contact
                        </Link>
                    </li>
                </ul>
            </nav>

            {/* Kategori Filter */}
            <div className="p-4 border-t">
                <h2 className="text-lg font-semibold text-black mb-2">Kategori</h2>
                <button onClick={() => setKategoriFilter('')} className="block w-full text-left py-2 px-4 border rounded mb-2 text-black">
                    Semua
                </button>
                <button onClick={() => setKategoriFilter('sepak bola')} className="block w-full text-left py-2 px-4 border rounded mb-2 text-black">
                    Sepak Bola
                </button>
                <button onClick={() => setKategoriFilter('futsal')} className="block w-full text-left py-2 px-4 border rounded mb-2 text-black">
                    Futsal
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
