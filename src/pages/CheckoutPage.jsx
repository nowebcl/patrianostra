import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, CheckCircle2, Truck, CreditCard, Building, ArrowLeft, Download, ShoppingBag, Sparkles, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { formatCLP } from '../utils/currency';
import { initWebpayTransaction, redirectToWebpayForm, isWebpayApiConfigured } from '../services/paymentService';

const CHILE_REGIONS = [
  'Región Metropolitana de Santiago',
  'Región de Valparaíso',
  'Región del Biobío',
  'Región de Antofagasta',
  'Región de Coquimbo',
  'Región de La Araucanía',
  'Región de Los Lagos',
  'Región de Tarapacá',
  'Región de Atacama',
  'Región de O’Higgins',
  'Región del Maule',
  'Región de Los Ríos',
  'Región de Arica y Parinacota',
  'Región de Magallanes'
];

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { createOrder } = useStore();
  const { 
    cart, 
    subtotal, 
    discountAmount, 
    appliedCoupon, 
    couponDiscountPercent, 
    shippingCost, 
    finalTotal, 
    totalItems,
    clearCart,
    lastOrder,
    setLastOrder,
    showToast
  } = useCart();

  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Success Confirmation
  const [isProcessing, setIsProcessing] = useState(false);

  const [formData, setFormData] = useState({
    email: 'contacto@ejemplo.cl',
    firstName: 'Matías',
    lastName: 'González',
    rut: '18.420.912-K',
    phone: '+56 9 8765 4321',
    address: 'Av. Providencia 1240, Depto 402',
    region: 'Región Metropolitana de Santiago',
    city: 'Santiago / Providencia',
    postalCode: '7500000',
    shippingMethod: 'express', // 'express' (Chilexpress 24h) or 'starken'
    paymentMethod: 'webpay', // 'webpay', 'card', 'transfer', 'mercadopago'
    cardNumber: '•••• •••• •••• 4242',
    cardExpiry: '12/26',
    cardCvc: '•••'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGoToPayment = (e) => {
    e.preventDefault();
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleConfirmOrder = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    const orderNumber = `PN-CL-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      if (formData.paymentMethod === 'webpay') {
        // 1. Iniciar transacción en Webpay Plus
        const tx = await initWebpayTransaction({
          buyOrder: orderNumber,
          sessionId: `sess_${Date.now()}`,
          amount: finalTotal,
          returnUrl: `${window.location.origin}/checkout?status=webpay_return`
        });

        // Si la API real de Webpay está conectada y retorna URL oficial de Transbank
        if (tx.isLive && tx.url && tx.token) {
          const orderDetails = {
            orderNumber,
            status: 'Pendiente',
            paymentStatus: 'pending_webpay',
            paymentMethod: 'Webpay Plus (Transbank)',
            paymentDetails: { token: tx.token },
            items: [...cart],
            subtotal,
            discountAmount,
            shippingCost,
            finalTotal,
            customer: { ...formData },
            date: new Date().toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
          };
          await createOrder(orderDetails);
          redirectToWebpayForm(tx.url, tx.token);
          return;
        }

        // Modo Preparatorio / Simulado de Webpay (hasta conectar la API real)
        const orderDetails = {
          orderNumber,
          status: 'En Preparación',
          paymentStatus: 'authorized',
          paymentMethod: 'Webpay Plus (Transbank)',
          paymentDetails: tx.mockDetails || { status: 'AUTHORIZED' },
          items: [...cart],
          subtotal,
          discountAmount,
          shippingCost,
          finalTotal,
          customer: { ...formData },
          date: new Date().toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        };

        await createOrder(orderDetails);
        setLastOrder(orderDetails);
        clearCart();
        setIsProcessing(false);
        setStep(3);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        showToast('¡Pago con Webpay Plus procesado exitosamente!');
        return;
      }

      // Otros métodos de pago (Transferencia bancaria, etc.)
      const orderDetails = {
        orderNumber,
        status: formData.paymentMethod === 'transfer' ? 'Pendiente' : 'En Preparación',
        paymentStatus: formData.paymentMethod === 'transfer' ? 'pending_transfer' : 'authorized',
        paymentMethod: formData.paymentMethod === 'transfer' ? 'Transferencia Bancaria' : (formData.paymentMethod === 'card' ? 'Tarjeta de Crédito' : 'Mercado Pago'),
        items: [...cart],
        subtotal,
        discountAmount,
        shippingCost,
        finalTotal,
        customer: { ...formData },
        date: new Date().toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
      };

      await createOrder(orderDetails);
      setLastOrder(orderDetails);
      clearCart();
      setIsProcessing(false);
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      showToast('¡Pedido confirmado exitosamente!');
    } catch (err) {
      console.error('Error procesando pago:', err);
      setIsProcessing(false);
      showToast('Error al conectar con la pasarela de pago. Intenta nuevamente.');
    }
  };

  if (cart.length === 0 && step !== 3 && !lastOrder) {
    return (
      <div className="min-h-[70vh] bg-black text-neutral-300 flex flex-col items-center justify-center p-6 text-center">
        <ShoppingBag className="w-16 h-16 text-neutral-700 mb-4" />
        <h2 className="font-condensed text-2xl font-bold uppercase tracking-wider mb-2">TU CARRITO ESTÁ VACÍO</h2>
        <p className="text-xs text-neutral-500 mb-6">Añade prendas de nuestra colección antes de pasar por caja.</p>
        <Link to="/catalogo" className="btn-crimson font-condensed font-bold text-xs uppercase px-8 py-3.5 tracking-widest">
          EXPLORAR CATÁLOGO →
        </Link>
      </div>
    );
  }

  const currentOrder = step === 3 ? lastOrder : null;

  return (
    <div className="min-h-screen bg-black text-[#E5E5E5] pt-6 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Checkout Top Bar */}
        <div className="flex items-center justify-between pb-6 mb-8 border-b border-neutral-900">
          <Link to="/" className="flex items-center gap-2 text-neutral-400 hover:text-white text-xs font-condensed tracking-widest uppercase">
            <ArrowLeft className="w-4 h-4" />
            <span>PATRIA NOSTRA • CHILE 🇨🇱</span>
          </Link>
          <div className="flex items-center gap-2 text-xs text-neutral-400 font-condensed tracking-wider uppercase">
            <Lock className="w-3.5 h-3.5 text-[#C52222]" />
            <span>PAGO SEGURO SSL 256-BIT ENCRIPTADO</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STEP 3: ORDER CONFIRMED RECEIPT SCREEN                                    */}
        {/* ========================================================================= */}
        {step === 3 && currentOrder ? (
          <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
            
            {/* Success Hero Badge */}
            <div className="bg-[#090909] border border-neutral-800 p-8 sm:p-10 text-center mb-8 hard-box shadow-2xl relative overflow-hidden">
              <div className="w-16 h-16 bg-[#C52222]/10 border border-[#C52222] rounded-full flex items-center justify-center mx-auto mb-5 text-[#C52222]">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              
              <span className="text-[#C52222] font-condensed font-bold text-xs tracking-[0.25em] uppercase block mb-1">
                COMPRA PROCESADA CON ÉXITO
              </span>
              <h1 className="font-condensed text-3xl sm:text-4xl font-extrabold uppercase text-white mb-2">
                ¡GRACIAS POR TU PEDIDO!
              </h1>
              <p className="text-xs sm:text-sm text-neutral-400 font-mono mb-4">
                Nº de Orden: <strong className="text-white text-base">{currentOrder.orderNumber}</strong>
              </p>
              <p className="text-xs text-neutral-500 max-w-md mx-auto">
                Hemos enviado la confirmación y el comprobante detallado a <strong className="text-neutral-300">{currentOrder.customer.email}</strong>.
              </p>
            </div>

            {/* Tracking Progress Timeline */}
            <div className="bg-[#080808] border border-neutral-900 p-6 mb-8">
              <h3 className="font-condensed text-xs font-bold tracking-[0.2em] uppercase text-neutral-300 mb-6">
                ESTADO DEL DESPACHO
              </h3>

              <div className="grid grid-cols-4 gap-2 relative">
                <div className="flex flex-col items-center text-center">
                  <div className="w-8 h-8 rounded-full bg-[#C52222] text-white flex items-center justify-center text-xs font-bold mb-2">✓</div>
                  <span className="text-[11px] font-condensed font-bold text-white uppercase">PAGO RECIBIDO</span>
                  <span className="text-[9px] text-neutral-500 mt-0.5">Completado</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="w-8 h-8 rounded-full bg-[#C52222] text-white flex items-center justify-center text-xs font-bold mb-2 animate-pulse">2</div>
                  <span className="text-[11px] font-condensed font-bold text-white uppercase">EN PREPARACIÓN</span>
                  <span className="text-[9px] text-[#C52222] mt-0.5">Bodega Central</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-500 flex items-center justify-center text-xs font-bold mb-2">3</div>
                  <span className="text-[11px] font-condensed font-bold text-neutral-500 uppercase">DESPACHO CHILEXPRESS</span>
                  <span className="text-[9px] text-neutral-600 mt-0.5">Pendiente</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-500 flex items-center justify-center text-xs font-bold mb-2">4</div>
                  <span className="text-[11px] font-condensed font-bold text-neutral-500 uppercase">ENTREGADO</span>
                  <span className="text-[9px] text-neutral-600 mt-0.5">24/48 hrs</span>
                </div>
              </div>
            </div>

            {/* Order Breakdown & Customer Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              
              {/* Shipping Address Summary */}
              <div className="bg-[#080808] border border-neutral-900 p-5 text-xs font-sans space-y-2">
                <h4 className="font-condensed font-bold text-neutral-200 tracking-wider uppercase mb-3 pb-2 border-b border-neutral-900">
                  DIRECCIÓN DE ENTREGA 🇨🇱
                </h4>
                <p className="text-white font-medium">{currentOrder.customer.firstName} {currentOrder.customer.lastName}</p>
                <p className="text-neutral-400">RUT: {currentOrder.customer.rut}</p>
                <p className="text-neutral-400">{currentOrder.customer.address}</p>
                <p className="text-neutral-400">{currentOrder.customer.city}, {currentOrder.customer.region}</p>
                <p className="text-neutral-400">Teléfono: {currentOrder.customer.phone}</p>
              </div>

              {/* Payment Summary */}
              <div className="bg-[#080808] border border-neutral-900 p-5 text-xs font-sans space-y-2">
                <h4 className="font-condensed font-bold text-neutral-200 tracking-wider uppercase mb-3 pb-2 border-b border-neutral-900">
                  DETALLES DEL PAGO
                </h4>
                <p className="text-neutral-400">Método: <strong className="text-white uppercase">{currentOrder.customer.paymentMethod}</strong></p>
                <p className="text-neutral-400">Fecha: <span className="text-neutral-300">{currentOrder.date}</span></p>
                <p className="text-neutral-400">Subtotal: <span className="text-neutral-300">{formatCLP(currentOrder.subtotal)}</span></p>
                {currentOrder.discountAmount > 0 && (
                  <p className="text-[#C52222]">Descuento: -{formatCLP(currentOrder.discountAmount)}</p>
                )}
                <p className="text-neutral-400">Envío: <span className="text-emerald-400">{currentOrder.shippingCost === 0 ? 'GRATIS' : formatCLP(currentOrder.shippingCost)}</span></p>
                <p className="text-white text-sm font-bold pt-2 border-t border-neutral-800">
                  Total Pagado: <span className="text-[#C52222] text-base">{formatCLP(currentOrder.finalTotal)}</span>
                </p>
              </div>

            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => showToast('Comprobante digital descargado en PDF')}
                className="flex-1 bg-[#121212] hover:bg-neutral-800 text-neutral-200 border border-neutral-800 py-3.5 text-xs font-condensed font-bold tracking-widest uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>DESCARGAR FACTURA / RESUMEN</span>
              </button>
              <Link
                to="/catalogo"
                className="flex-1 btn-crimson py-3.5 text-xs font-condensed font-bold tracking-widest uppercase text-center flex items-center justify-center gap-2"
              >
                <span>SEGUIR COMPRANDO</span>
                <span>→</span>
              </Link>
            </div>

          </div>
        ) : (
          /* ========================================================================= */
          /* STEP 1 & 2: MULTI-STEP CHECKOUT FORM                                     */
          /* ========================================================================= */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left: Form Steps */}
            <div className="lg:col-span-7">
              
              {/* Stepper Indicator */}
              <div className="flex items-center gap-3 mb-8 text-xs font-condensed font-bold tracking-widest uppercase">
                <span className={`flex items-center gap-1.5 ${step >= 1 ? 'text-white' : 'text-neutral-600'}`}>
                  <span className="w-5 h-5 rounded-full bg-[#C52222] text-white flex items-center justify-center text-[10px]">1</span>
                  DATOS DE ENVÍO
                </span>
                <span className="text-neutral-700">──</span>
                <span className={`flex items-center gap-1.5 ${step >= 2 ? 'text-white' : 'text-neutral-600'}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 2 ? 'bg-[#C52222] text-white' : 'bg-neutral-900 text-neutral-600'}`}>2</span>
                  PAGO & CONFIRMACIÓN
                </span>
              </div>

              {/* STEP 1: SHIPPING FORM */}
              {step === 1 && (
                <form onSubmit={handleGoToPayment} className="space-y-6">
                  
                  {/* Contact Info */}
                  <div className="bg-[#080808] border border-neutral-900 p-6 space-y-4">
                    <h3 className="font-condensed text-sm font-bold tracking-wider uppercase text-neutral-200 mb-4 pb-2 border-b border-neutral-900 flex items-center justify-between">
                      <span>1. INFORMACIÓN DE CONTACTO</span>
                      <span className="text-[10px] text-neutral-500 font-sans font-normal">* Campos obligatorios</span>
                    </h3>

                    <div>
                      <label className="text-[11px] font-condensed tracking-wider text-neutral-400 uppercase block mb-1.5">CORREO ELECTRÓNICO *</label>
                      <input 
                        required
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="tu@correo.com"
                        className="w-full bg-black border border-neutral-800 text-xs font-sans text-white p-3 focus:outline-none focus:border-[#C52222]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] font-condensed tracking-wider text-neutral-400 uppercase block mb-1.5">NOMBRE *</label>
                        <input 
                          required
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          placeholder="Nombre"
                          className="w-full bg-black border border-neutral-800 text-xs font-sans text-white p-3 focus:outline-none focus:border-[#C52222]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-condensed tracking-wider text-neutral-400 uppercase block mb-1.5">APELLIDOS *</label>
                        <input 
                          required
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          placeholder="Apellidos"
                          className="w-full bg-black border border-neutral-800 text-xs font-sans text-white p-3 focus:outline-none focus:border-[#C52222]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] font-condensed tracking-wider text-neutral-400 uppercase block mb-1.5">RUT / DNI *</label>
                        <input 
                          required
                          type="text"
                          name="rut"
                          value={formData.rut}
                          onChange={handleInputChange}
                          placeholder="12.345.678-9"
                          className="w-full bg-black border border-neutral-800 text-xs font-sans text-white p-3 focus:outline-none focus:border-[#C52222]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-condensed tracking-wider text-neutral-400 uppercase block mb-1.5">TELÉFONO DE CONTACTO *</label>
                        <input 
                          required
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+56 9 1234 5678"
                          className="w-full bg-black border border-neutral-800 text-xs font-sans text-white p-3 focus:outline-none focus:border-[#C52222]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="bg-[#080808] border border-neutral-900 p-6 space-y-4">
                    <h3 className="font-condensed text-sm font-bold tracking-wider uppercase text-neutral-200 mb-4 pb-2 border-b border-neutral-900">
                      2. DIRECCIÓN DE DESPACHO EN CHILE 🇨🇱
                    </h3>

                    <div>
                      <label className="text-[11px] font-condensed tracking-wider text-neutral-400 uppercase block mb-1.5">REGIÓN *</label>
                      <select
                        name="region"
                        value={formData.region}
                        onChange={handleInputChange}
                        className="w-full bg-black border border-neutral-800 text-xs font-sans text-white p-3 focus:outline-none focus:border-[#C52222] cursor-pointer"
                      >
                        {CHILE_REGIONS.map(reg => (
                          <option key={reg} value={reg}>{reg}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] font-condensed tracking-wider text-neutral-400 uppercase block mb-1.5">CIUDAD / COMUNA *</label>
                        <input 
                          required
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          placeholder="Ej: Providencia, Concepción..."
                          className="w-full bg-black border border-neutral-800 text-xs font-sans text-white p-3 focus:outline-none focus:border-[#C52222]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-condensed tracking-wider text-neutral-400 uppercase block mb-1.5">CÓDIGO POSTAL</label>
                        <input 
                          type="text"
                          name="postalCode"
                          value={formData.postalCode}
                          onChange={handleInputChange}
                          placeholder="7500000"
                          className="w-full bg-black border border-neutral-800 text-xs font-sans text-white p-3 focus:outline-none focus:border-[#C52222]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-condensed tracking-wider text-neutral-400 uppercase block mb-1.5">DIRECCIÓN (CALLE, NÚMERO, DEPTO/CASA) *</label>
                      <input 
                        required
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Av. Libertador 1234, Depto 4B"
                        className="w-full bg-black border border-neutral-800 text-xs font-sans text-white p-3 focus:outline-none focus:border-[#C52222]"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="btn-crimson w-full font-condensed font-bold text-xs tracking-[0.2em] uppercase py-4 cursor-pointer shadow-xl flex items-center justify-center gap-2 active:scale-98"
                  >
                    <span>CONTINUAR AL PAGO</span>
                    <span>→</span>
                  </button>
                </form>
              )}

              {/* STEP 2: PAYMENT METHOD */}
              {step === 2 && (
                <form onSubmit={handleConfirmOrder} className="space-y-6">
                  
                  <div className="bg-[#080808] border border-neutral-900 p-6 space-y-5">
                    <h3 className="font-condensed text-sm font-bold tracking-wider uppercase text-neutral-200 pb-2 border-b border-neutral-900 flex items-center justify-between">
                      <span>SELECCIONA TU MÉTODO DE PAGO</span>
                      <ShieldCheck className="w-4 h-4 text-[#C52222]" />
                    </h3>

                    {/* Payment Method Selector Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      
                      {/* WebPay Plus */}
                      <button
                        type="button"
                        onClick={() => setFormData(f => ({ ...f, paymentMethod: 'webpay' }))}
                        className={`p-3.5 border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                          formData.paymentMethod === 'webpay' ? 'border-[#C52222] bg-[#C52222]/15 text-white' : 'border-neutral-800 text-neutral-400 hover:border-neutral-700'
                        }`}
                      >
                        <span className="font-condensed font-bold text-xs tracking-wider uppercase">WEBPAY PLUS</span>
                        <span className="text-[9px] text-neutral-400">RedCompra / Débito</span>
                      </button>

                      {/* Tarjeta */}
                      <button
                        type="button"
                        onClick={() => setFormData(f => ({ ...f, paymentMethod: 'card' }))}
                        className={`p-3.5 border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                          formData.paymentMethod === 'card' ? 'border-[#C52222] bg-[#C52222]/15 text-white' : 'border-neutral-800 text-neutral-400 hover:border-neutral-700'
                        }`}
                      >
                        <CreditCard className="w-4 h-4" />
                        <span className="font-condensed font-bold text-xs tracking-wider uppercase">TARJETA CRÉDITO</span>
                      </button>

                      {/* Transferencia */}
                      <button
                        type="button"
                        onClick={() => setFormData(f => ({ ...f, paymentMethod: 'transfer' }))}
                        className={`p-3.5 border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                          formData.paymentMethod === 'transfer' ? 'border-[#C52222] bg-[#C52222]/15 text-white' : 'border-neutral-800 text-neutral-400 hover:border-neutral-700'
                        }`}
                      >
                        <Building className="w-4 h-4" />
                        <span className="font-condensed font-bold text-xs tracking-wider uppercase">TRANSFERENCIA</span>
                      </button>

                      {/* MercadoPago */}
                      <button
                        type="button"
                        onClick={() => setFormData(f => ({ ...f, paymentMethod: 'mercadopago' }))}
                        className={`p-3.5 border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                          formData.paymentMethod === 'mercadopago' ? 'border-[#C52222] bg-[#C52222]/15 text-white' : 'border-neutral-800 text-neutral-400 hover:border-neutral-700'
                        }`}
                      >
                        <span className="font-condensed font-bold text-xs tracking-wider uppercase">MERCADO PAGO</span>
                        <span className="text-[9px] text-neutral-400">Cuotas sin interés</span>
                      </button>

                    </div>

                    {/* Method Details */}
                    {formData.paymentMethod === 'webpay' ? (
                      <div className="bg-black border border-neutral-800 p-5 text-xs font-sans space-y-2 rounded">
                        <div className="flex items-center justify-between">
                          <span className="text-white font-condensed font-bold text-sm tracking-wider uppercase flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-[#C52222]" />
                            PASARELA OFICIAL TRANSBANK WEBPAY PLUS
                          </span>
                          <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase tracking-wider bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
                            Listo para conectar
                          </span>
                        </div>
                        <p className="text-neutral-300 leading-relaxed">
                          Paga en cuotas sin interés o al contado con tarjetas de débito (<strong className="text-white">Redcompra</strong>), crédito (<strong className="text-white">Visa, Mastercard, AMEX, Magna</strong>) o tarjetas de prepago chilenas.
                        </p>
                        <p className="text-neutral-500 text-[11px] pt-1 border-t border-neutral-900">
                          🔒 Serás conectado directamente a los servidores seguros y encriptados de Transbank para ingresar tus datos financieros con total privacidad.
                        </p>
                      </div>
                    ) : formData.paymentMethod === 'transfer' ? (
                      <div className="bg-black border border-neutral-800 p-4 text-xs font-sans space-y-1.5 rounded">
                        <p className="text-[#C52222] font-condensed font-bold tracking-wider uppercase">DATOS BANCARIOS PARA TRANSFERENCIA:</p>
                        <p className="text-neutral-300">Banco: <strong className="text-white">Banco de Chile / BancoEstado</strong></p>
                        <p className="text-neutral-300">Tipo de Cuenta: <strong className="text-white">Cuenta Corriente</strong></p>
                        <p className="text-neutral-300">Nº Cuenta: <strong className="text-white font-mono">00-12345678-09</strong></p>
                        <p className="text-neutral-300">RUT: <strong className="text-white">76.543.210-K</strong></p>
                        <p className="text-neutral-300">Nombre: <strong className="text-white">Patria Nostra SpA</strong></p>
                        <p className="text-neutral-500 text-[10px] pt-1">Envía tu comprobante con tu número de orden a pagos@patrianostradistro.cl</p>
                      </div>
                    ) : (
                      <div className="space-y-4 bg-black border border-neutral-800 p-4 rounded">
                        <div>
                          <label className="text-[11px] font-condensed tracking-wider text-neutral-400 uppercase block mb-1.5">NÚMERO DE TARJETA</label>
                          <input 
                            type="text"
                            name="cardNumber"
                            value={formData.cardNumber}
                            onChange={handleInputChange}
                            className="w-full bg-[#080808] border border-neutral-800 text-xs font-mono text-white p-3 focus:outline-none focus:border-[#C52222]"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[11px] font-condensed tracking-wider text-neutral-400 uppercase block mb-1.5">EXPIRACIÓN (MM/AA)</label>
                            <input 
                              type="text"
                              name="cardExpiry"
                              value={formData.cardExpiry}
                              onChange={handleInputChange}
                              className="w-full bg-[#080808] border border-neutral-800 text-xs font-mono text-white p-3 focus:outline-none focus:border-[#C52222]"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-condensed tracking-wider text-neutral-400 uppercase block mb-1.5">CVC / CWW</label>
                            <input 
                              type="text"
                              name="cardCvc"
                              value={formData.cardCvc}
                              onChange={handleInputChange}
                              className="w-full bg-[#080808] border border-neutral-800 text-xs font-mono text-white p-3 focus:outline-none focus:border-[#C52222]"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Summary of Shipping Data */}
                    <div className="bg-black border border-neutral-900 p-4 text-xs font-sans flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-condensed text-neutral-500 uppercase tracking-wider block">ENVIAR A:</span>
                        <p className="text-neutral-200 font-medium">{formData.firstName} {formData.lastName} — {formData.address}, {formData.city}</p>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setStep(1)}
                        className="text-[#C52222] font-condensed uppercase font-bold text-xs hover:underline cursor-pointer"
                      >
                        EDITAR
                      </button>
                    </div>

                  </div>

                  {/* Buttons */}
                  <div className="flex gap-4">
                    <button 
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-6 py-4 bg-[#121212] hover:bg-neutral-800 text-neutral-300 text-xs font-condensed uppercase tracking-widest border border-neutral-700 cursor-pointer"
                    >
                      ← VOLVER
                    </button>
                    <button 
                      type="submit"
                      disabled={isProcessing}
                      className="btn-crimson flex-1 font-condensed font-bold text-xs tracking-[0.2em] uppercase py-4 cursor-pointer shadow-xl flex items-center justify-center gap-2 active:scale-98"
                    >
                      {isProcessing ? (
                        <span>CONECTANDO CON PASARELA DE PAGO...</span>
                      ) : (
                        <span>{formData.paymentMethod === 'webpay' ? `PAGAR CON WEBPAY PLUS (${formatCLP(finalTotal)}) →` : `CONFIRMAR Y PAGAR ${formatCLP(finalTotal)} →`}</span>
                      )}
                    </button>
                  </div>

                </form>
              )}

            </div>

            {/* Right: Order Summary Sidebar */}
            <div className="lg:col-span-5 bg-[#080808] border border-neutral-900 p-6 sticky top-24">
              <h3 className="font-condensed text-base font-bold tracking-wider uppercase text-neutral-200 mb-4 pb-2 border-b border-neutral-900 flex items-center justify-between">
                <span>RESUMEN DEL PEDIDO ({totalItems})</span>
                <span className="text-[11px] text-neutral-500 font-sans">IVA Incluido</span>
              </h3>

              {/* Items List */}
              <div className="divide-y divide-neutral-900 max-h-72 overflow-y-auto mb-4">
                {cart.map((item, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div className="w-14 h-14 bg-black border border-neutral-900 p-1 shrink-0">
                      <img src={item.product.image} alt={item.product.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-condensed font-bold uppercase text-neutral-200 truncate">{item.product.name}</h4>
                      <p className="text-[11px] text-neutral-400 font-sans">
                        Talla: <span className="text-white font-semibold">{item.size}</span> • Cant: <span className="text-white font-semibold">{item.quantity}</span>
                      </p>
                    </div>
                    <span className="font-condensed font-bold text-white">{formatCLP(item.product.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Price Calculations */}
              <div className="border-t border-neutral-900 pt-4 space-y-2 text-xs font-condensed tracking-wider uppercase">
                <div className="flex justify-between text-neutral-400">
                  <span>SUBTOTAL</span>
                  <span>{formatCLP(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#C52222]">
                    <span>DESCUENTO ({couponDiscountPercent}%)</span>
                    <span>-{formatCLP(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-neutral-400">
                  <span>ENVÍO CHILE</span>
                  <span>{shippingCost === 0 ? <strong className="text-emerald-400">GRATIS</strong> : formatCLP(shippingCost)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-white pt-3 border-t border-neutral-800">
                  <span>TOTAL FINAL</span>
                  <span className="text-[#C52222] text-lg font-bold">{formatCLP(finalTotal)}</span>
                </div>
              </div>

              {/* Security guarantees */}
              <div className="mt-6 pt-4 border-t border-neutral-900 space-y-2 text-[10px] font-sans text-neutral-500">
                <p className="flex items-center gap-1.5 text-neutral-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C52222]" />
                  <span>Garantía oficial de satisfacción de 30 días</span>
                </p>
                <p className="flex items-center gap-1.5 text-neutral-400">
                  <Truck className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Despacho con código de seguimiento en tiempo real</span>
                </p>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
