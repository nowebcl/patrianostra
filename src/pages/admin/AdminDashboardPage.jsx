import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { AdminLoginPage } from './AdminLoginPage';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AdminOrdersTab } from '../../components/admin/AdminOrdersTab';
import { AdminProductsTab } from '../../components/admin/AdminProductsTab';
import { AdminInventoryTab } from '../../components/admin/AdminInventoryTab';
import { AdminOverviewTab } from '../../components/admin/AdminOverviewTab';

export const AdminDashboardPage = () => {
  const { isAdminAuthenticated } = useStore();
  const [activeTab, setActiveTab] = useState('orders');
  const [isEditing, setIsEditing] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);

  if (!isAdminAuthenticated) {
    return <AdminLoginPage />;
  }

  const handleOpenNewProduct = () => {
    setProductToEdit(null);
    setIsEditing(true);
    setActiveTab('products');
  };

  return (
    <AdminLayout activeTab={activeTab} setActiveTab={(tab) => {
      setActiveTab(tab);
      if (tab !== 'products') {
        setIsEditing(false);
      }
    }}>
      {activeTab === 'orders' && (
        <AdminOrdersTab />
      )}

      {activeTab === 'products' && (
        <AdminProductsTab
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          productToEdit={productToEdit}
          setProductToEdit={setProductToEdit}
        />
      )}

      {activeTab === 'inventory' && (
        <AdminInventoryTab />
      )}

      {activeTab === 'overview' && (
        <AdminOverviewTab 
          setActiveTab={setActiveTab} 
          onOpenNewProduct={handleOpenNewProduct} 
        />
      )}
    </AdminLayout>
  );
};
