import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Key, 
  Download, 
  Upload, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  Lock, 
  Mail,
  Truck,
  Database
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const AdminSettingsTab = () => {
  const { 
    adminCreds, 
    updateAdminCredentials, 
    resetStoreData, 
    exportStoreData, 
    importStoreData 
  } = useStore();

  const [formData, setFormData] = useState({
    name: adminCreds.name || 'Comandante Patria',
    username: adminCreds.username || 'admin',
    email: adminCreds.email || 'admin@patrianostra.cl',
    password: adminCreds.password || 'admin123'
  });

  const [toastMessage, setToastMessage] = useState(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const showNotification = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveCredentials = (e) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.email.trim() || !formData.password.trim()) {
      showNotification('Todos los campos de credenciales son obligatorios');
      return;
    }
    updateAdminCredentials(formData);
    showNotification('¡Credenciales de administrador actualizadas con éxito!');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const result = importStoreData(event.target.result);
        if (result.success) {
          showNotification('¡Base de datos importada y restaurada correctamente!');
        } else {
          showNotification('Error al importar: ' + result.error);
        }
      } catch (err) {
        showNotification('El archivo no tiene un formato JSON válido.');
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmReset = () => {
    resetStoreData();
    setFormData({
      name: 'Comandante Patria',
      username: 'admin',
      email: 'admin@patrianostra.cl',
      password: 'admin123'
    });
    setIsResetConfirmOpen(false);
    showNotification('Datos restablecidos a los valores originales de fábrica.');
  };

  return (
    <div className="space-y-8 max-w-5xl animate-in fade-in duration-300">
      
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#121212] border border-[#C52222] text-white px-4 py-3 rounded shadow-2xl flex items-center gap-2 text-xs font-condensed font-bold uppercase tracking-wider animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-[#C52222]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="pb-4 border-b border-neutral-900">
        <span className="text-[#C52222] font-condensed font-bold text-xs tracking-[0.25em] uppercase block mb-1">
          CONFIGURACIÓN &amp; SEGURIDAD
        </span>
        <h1 className="font-condensed text-2xl sm:text-3xl font-extrabold uppercase text-white tracking-tight">
          PERFIL DE ADMINISTRADOR Y SISTEMA
        </h1>
      </div>

      {/* Credentials Form */}
      <div className="bg-[#0a0a0a] border border-neutral-900 rounded-lg p-6 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-900">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-[#151515] border border-neutral-800 flex items-center justify-center text-[#C52222]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-condensed font-bold text-base uppercase text-white tracking-wider">
                CREDENCIALES DE ACCESO AL PANEL
              </h3>
              <p className="text-xs text-neutral-500">
                Modifica el usuario, correo y clave necesarios para ingresar a este panel.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveCredentials} className="space-y-4 text-xs font-sans">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div>
              <label className="font-condensed font-bold text-neutral-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#C52222]" />
                <span>NOMBRE COMPLETO / TITULAR</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full bg-black border border-neutral-800 rounded p-2.5 text-white focus:outline-none focus:border-[#C52222]"
              />
            </div>

            <div>
              <label className="font-condensed font-bold text-neutral-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-[#C52222]" />
                <span>NOMBRE DE USUARIO</span>
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full bg-black border border-neutral-800 rounded p-2.5 text-white font-mono focus:outline-none focus:border-[#C52222]"
              />
            </div>

            <div>
              <label className="font-condensed font-bold text-neutral-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#C52222]" />
                <span>CORREO ELECTRÓNICO ADMIN</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full bg-black border border-neutral-800 rounded p-2.5 text-white focus:outline-none focus:border-[#C52222]"
              />
            </div>

            <div>
              <label className="font-condensed font-bold text-neutral-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#C52222]" />
                <span>CONTRASEÑA</span>
              </label>
              <input
                type="text"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full bg-black border border-neutral-800 rounded p-2.5 text-white font-mono focus:outline-none focus:border-[#C52222]"
              />
            </div>

          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#C52222] hover:bg-[#a81c1c] text-white font-condensed font-bold text-xs uppercase tracking-widest rounded shadow-lg shadow-[#C52222]/20 transition-all cursor-pointer"
            >
              GUARDAR NUEVAS CREDENCIALES
            </button>
          </div>
        </form>
      </div>

      {/* Backup and Database Management */}
      <div className="bg-[#0a0a0a] border border-neutral-900 rounded-lg p-6 space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-neutral-900">
          <div className="w-9 h-9 rounded bg-[#151515] border border-neutral-800 flex items-center justify-center text-blue-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-condensed font-bold text-base uppercase text-white tracking-wider">
              COPIAS DE SEGURIDAD &amp; RESTAURACIÓN
            </h3>
            <p className="text-xs text-neutral-500">
              Descarga un archivo JSON con todos los productos, pedidos y stock o restaura un respaldo previo.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Export button */}
          <div className="bg-black/60 border border-neutral-800/80 p-4 rounded-lg flex flex-col justify-between space-y-3">
            <div>
              <span className="font-condensed font-bold text-xs uppercase tracking-wider text-white block mb-1">
                EXPORTAR BASE DE DATOS (.JSON)
              </span>
              <p className="text-xs text-neutral-400">
                Guarda una copia descargable con todos los cambios de precios, productos creados y pedidos.
              </p>
            </div>
            <button
              onClick={exportStoreData}
              className="w-full py-2.5 bg-[#141414] hover:bg-neutral-800 text-neutral-200 border border-neutral-700 font-condensed font-bold text-xs uppercase tracking-wider rounded flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Download className="w-4 h-4 text-[#C52222]" />
              <span>DESCARGAR RESPALDO JSON</span>
            </button>
          </div>

          {/* Import file */}
          <div className="bg-black/60 border border-neutral-800/80 p-4 rounded-lg flex flex-col justify-between space-y-3">
            <div>
              <span className="font-condensed font-bold text-xs uppercase tracking-wider text-white block mb-1">
                IMPORTAR / RESTAURAR RESPALDO
              </span>
              <p className="text-xs text-neutral-400">
                Sube un archivo de respaldo previamente exportado para recuperar tu catálogo y pedidos.
              </p>
            </div>
            <label className="w-full py-2.5 bg-[#141414] hover:bg-neutral-800 text-neutral-200 border border-neutral-700 font-condensed font-bold text-xs uppercase tracking-wider rounded flex items-center justify-center gap-2 cursor-pointer transition-colors">
              <Upload className="w-4 h-4 text-blue-400" />
              <span>SELECCIONAR ARCHIVO JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

        </div>
      </div>

      {/* Danger Zone: Factory Reset */}
      <div className="bg-red-950/10 border border-red-900/40 rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-red-950/40 border border-red-800 flex items-center justify-center text-red-400">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-condensed font-bold text-base uppercase text-red-300 tracking-wider">
              ZONA DE PELIGRO: RESTABLECER DATOS DE DEMO
            </h3>
            <p className="text-xs text-neutral-400">
              Elimina todos los cambios locales y vuelve a cargar los productos y pedidos de demostración iniciales.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsResetConfirmOpen(true)}
          className="px-5 py-2.5 bg-red-900/40 hover:bg-red-900 text-red-200 border border-red-800 font-condensed font-bold text-xs uppercase tracking-wider rounded flex items-center gap-2 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>RESTABLECER A VALORES DE FÁBRICA</span>
        </button>
      </div>

      {/* Reset Confirmation Modal */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f0f0f] border border-red-800 p-6 rounded-lg max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-red-950/50 border border-red-800 text-red-400 flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-condensed text-lg font-bold uppercase text-white">¿CONFIRMAR RESTABLECIMIENTO?</h3>
              <p className="text-xs text-neutral-400">
                Se borrarán todos los pedidos creados y los cambios de inventario, restaurando los 6 productos originales y los pedidos demo.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="flex-1 py-2.5 bg-[#181818] hover:bg-neutral-800 text-neutral-300 font-condensed font-bold text-xs uppercase rounded cursor-pointer"
              >
                CANCELAR
              </button>
              <button
                onClick={handleConfirmReset}
                className="flex-1 py-2.5 bg-red-700 hover:bg-red-800 text-white font-condensed font-bold text-xs uppercase rounded cursor-pointer"
              >
                SÍ, RESTABLECER TODO
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
