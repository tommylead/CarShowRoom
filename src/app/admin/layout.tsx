import Link from "next/link";
import { FaCar, FaUsers, FaShoppingCart, FaChartBar } from "react-icons/fa";

const menuItems = [
  {
    href: "/admin",
    icon: FaChartBar,
    text: "Dashboard",
  },
  {
    href: "/admin/cars",
    icon: FaCar,
    text: "Quản lý xe",
  },
  {
    href: "/admin/users",
    icon: FaUsers,
    text: "Quản lý người dùng",
  },
  {
    href: "/admin/orders",
    icon: FaShoppingCart,
    text: "Quản lý đơn hàng",
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow">
        <div className="flex h-16 items-center justify-center border-b">
          <Link href="/admin" className="text-xl font-bold text-primary-600">
            Admin Dashboard
          </Link>
        </div>
        <nav className="mt-6 px-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center space-x-2 rounded-lg px-4 py-2.5 text-gray-700 hover:bg-primary-50 hover:text-primary-600"
                >
                  <item.icon className="text-lg" />
                  <span>{item.text}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50">
        <div className="h-16 border-b bg-white shadow">
          {/* Add header content here */}
        </div>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
} 