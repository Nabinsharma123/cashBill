import { NavTab } from "@/constants/enums";
import { Building2, FileText, Package, PlusCircle, Users } from "lucide-react";
import React from "react";

export { NavTab };

interface AppLayoutProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  activeTab,
  onTabChange,
  children,
}) => {
  const navItems = [
    {
      id: NavTab.CREATE_INVOICE,
      label: "Create Invoice",
      icon: PlusCircle,
    },
    {
      id: NavTab.INVOICE_HISTORY,
      label: "Invoice History",
      icon: FileText,
    },
    {
      id: NavTab.COMPANIES,
      label: "Companies",
      icon: Building2,
    },
    {
      id: NavTab.PARTIES,
      label: "Parties",
      icon: Users,
    },
    {
      id: NavTab.PRODUCTS,
      label: "Products",
      icon: Package,
    },
  ];

  return (
    <div className="flex h-full w-full bg-background overflow-hidden">
      {/* Sidebar (hidden during printing) */}
      <aside className="no-print w-64 border-r border-border bg-card flex flex-col justify-between shrink-0 select-none">
        <div>
          {/* Logo / App Header */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-md   text-primary-foreground flex items-center justify-center ">
                <img src="/public/icon.png" />
              </div>
              <div>
                <div className="font-bold text-base leading-none tracking-tight">
                  CashBill
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all text-left border ${
                    isActive
                      ? "border-primary bg-primary text-primary-foreground shadow-[0_1px_1px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,0.2)]"
                      : "border-transparent text-muted-foreground hover:bg-accent hover:text-foreground hover:border-border"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`}
                  />
                  <div className="truncate">
                    <div>{item.label}</div>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden min-h-0">
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 min-h-0">
          {children}
        </div>
      </main>
    </div>
  );
};
