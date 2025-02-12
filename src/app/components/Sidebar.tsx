import Link from "next/link";

function Sidebar() {
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
                        <Link href="/about" className="block py-2 px-4 rounded text-black">
                            About
                        </Link>
                    </li>
                    <li>
                        <Link href="/contact" className="block py-2 px-4 rounded text-black">
                            Contact
                        </Link>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default Sidebar;
