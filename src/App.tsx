import React, { useState } from "react";
import { AppLayout, NavTab } from "./components/layout/AppLayout";
import { AlertDialogProvider } from "./context/AlertDialogContext";
import { CompanyListPage } from "./modules/company/pages/CompanyListPage";
import { CreateInvoicePage } from "./modules/invoice/pages/CreateInvoicePage";
import { InvoiceHistoryPage } from "./modules/invoice/pages/InvoiceHistoryPage";
import { PartyListPage } from "./modules/party/pages/PartyListPage";
import { ProductListPage } from "./modules/product/pages/ProductListPage";

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>(NavTab.CREATE_INVOICE);

  return (
    <AlertDialogProvider>
      <AppLayout activeTab={activeTab} onTabChange={setActiveTab}>
        {activeTab === NavTab.CREATE_INVOICE && <CreateInvoicePage />}
        {activeTab === NavTab.INVOICE_HISTORY && (
          <InvoiceHistoryPage
            onNavigateCreate={() => setActiveTab(NavTab.CREATE_INVOICE)}
          />
        )}
        {activeTab === NavTab.COMPANIES && <CompanyListPage />}
        {activeTab === NavTab.PARTIES && <PartyListPage />}
        {activeTab === NavTab.PRODUCTS && <ProductListPage />}
      </AppLayout>
    </AlertDialogProvider>
  );
};

export default App;
