import Sidebar from "../components/layout/sidenav";

export default function DashboardLayout({ children }) {
    return (
      <div className="flex">
        <Sidebar />
        <main className="flex-1">{children}</main>
      </div>
    );
  }
