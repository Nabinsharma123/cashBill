import {
  Building2,
  Database,
  FileText,
  Package,
  PlusCircle,
  Receipt,
  Users,
} from "lucide-react";
import React from "react";

// export type NavTab = "create-invoice" | "invoice-history" | "companies" | "parties" | "products";
export enum NavTab {
  CREATE_INVOICE = "create-invoice",
  INVOICE_HISTORY = "invoice-history",
  COMPANIES = "companies",
  PARTIES = "parties",
  PRODUCTS = "products",
}

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
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Sidebar (hidden during printing) */}
      <aside className="no-print w-64 border-r bg-card/60 flex flex-col justify-between shrink-0 select-none">
        <div>
          {/* Logo / App Header */}
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow">
                <Receipt className="h-5 w-5" />
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
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors text-left ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
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

        {/* Database Status & Footer */}
        <div className="p-4 border-t bg-muted/20 text-xs text-muted-foreground flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-3.5 w-3.5 text-emerald-500" />
            <span className="font-mono text-[11px]">SQLite WAL DB</span>
          </div>
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
};
