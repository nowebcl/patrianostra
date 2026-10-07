import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const logoPath = path.join(projectRoot, 'public', 'logo.png');
const desktopPath = path.resolve('C:\\Users\\NOWEB  DESKTOP\\Desktop');
const outputPdfPath = path.join(desktopPath, 'Documentacion_Patria_Nostra.pdf');
const tempHtmlPath = path.join(projectRoot, 'scripts', 'temp_doc_print.html');

// Cargar Logo como Base64
let logoBase64 = '';
if (fs.existsSync(logoPath)) {
  const logoBuffer = fs.readFileSync(logoPath);
  logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
}

const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Documentación Oficial y Manual de Administración - Patria Nostra Distro</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap');

    @page {
      size: A4 portrait;
      margin: 12mm 15mm 12mm 15mm;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #ffffff;
      color: #1f2937;
      line-height: 1.45;
      font-size: 8.8pt;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .page {
      page-break-after: always;
      height: 272mm;
      max-height: 272mm;
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
    }

    .page:last-child {
      page-break-after: avoid;
    }

    .page-content {
      flex: 1;
    }

    /* Encabezado Superior Principal (Pág 1) */
    .header-main {
      text-align: center;
      padding-bottom: 12px;
      margin-bottom: 14px;
      border-bottom: 1.5px solid #e5e7eb;
    }

    .header-logo {
      height: 64px;
      max-width: 220px;
      object-fit: contain;
      margin: 0 auto 8px auto;
      display: block;
    }

    .header-title {
      font-size: 15pt;
      font-weight: 800;
      letter-spacing: -0.01em;
      text-transform: uppercase;
      color: #111827;
      margin-bottom: 2px;
    }

    .header-subtitle {
      font-size: 8pt;
      font-weight: 600;
      color: #6b7280;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    .header-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 8px;
      padding-top: 6px;
      border-top: 1px dashed #e5e7eb;
      font-size: 7.2pt;
      color: #9ca3af;
    }

    .header-meta strong {
      color: #4b5563;
    }

    /* Mini Header para Páginas 2 y 3 */
    .mini-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 8px;
      margin-bottom: 12px;
      border-bottom: 1px solid #e5e7eb;
    }

    .mini-brand {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .mini-logo {
      height: 22px;
      object-fit: contain;
    }

    .mini-brand-text {
      font-size: 8pt;
      font-weight: 800;
      text-transform: uppercase;
      color: #111827;
      letter-spacing: 0.05em;
    }

    .mini-doc-label {
      font-size: 7.2pt;
      color: #6b7280;
      font-weight: 500;
      text-transform: uppercase;
    }

    /* Títulos de Sección */
    .section-title {
      display: flex;
      align-items: center;
      gap: 7px;
      font-size: 10.5pt;
      font-weight: 800;
      text-transform: uppercase;
      color: #111827;
      letter-spacing: -0.01em;
      margin-top: 10px;
      margin-bottom: 8px;
      padding-bottom: 3px;
      border-bottom: 1px solid #f3f4f6;
    }

    .section-number {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 19px;
      height: 19px;
      background: #c52222;
      color: #ffffff;
      font-size: 7.5pt;
      font-weight: 700;
      border-radius: 4px;
    }

    /* Tarjetas y Contenedores */
    .card {
      background: #fafafa;
      border: 1px solid #e5e7eb;
      border-radius: 5px;
      padding: 9px 12px;
      margin-bottom: 9px;
    }

    .card-accent {
      border-left: 3.5px solid #c52222;
      background: #ffffff;
      box-shadow: 0 1px 2px rgba(0,0,0,0.02);
    }

    /* Grid de Credenciales */
    .creds-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 9px;
      margin-bottom: 10px;
    }

    .cred-box {
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 5px;
      padding: 9px 11px;
    }

    .cred-badge {
      display: inline-block;
      font-size: 6.5pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #c52222;
      background: #fef2f2;
      border: 1px solid #fee2e2;
      padding: 2px 5px;
      border-radius: 3px;
      margin-bottom: 5px;
    }

    .cred-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      padding: 2.5px 0;
      border-bottom: 1px solid #f3f4f6;
      font-size: 7.8pt;
    }

    .cred-row:last-child {
      border-bottom: none;
    }

    .cred-label {
      color: #6b7280;
      font-size: 7.2pt;
      font-weight: 500;
    }

    .cred-value {
      font-family: 'JetBrains Mono', Consolas, monospace;
      font-weight: 700;
      color: #111827;
      font-size: 7.8pt;
    }

    /* Pasos estructurados */
    .steps-list {
      display: flex;
      flex-direction: column;
      gap: 7px;
      margin-bottom: 10px;
    }

    .step-item {
      display: flex;
      gap: 9px;
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 5px;
      padding: 7px 11px;
    }

    .step-idx {
      width: 20px;
      height: 20px;
      background: #f3f4f6;
      border: 1px solid #e5e7eb;
      color: #374151;
      font-size: 7.5pt;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      flex-shrink: 0;
      margin-top: 1px;
    }

    .step-text {
      flex: 1;
    }

    .step-text h4 {
      font-size: 8.2pt;
      font-weight: 700;
      color: #111827;
      margin-bottom: 2px;
    }

    .step-text p {
      font-size: 7.6pt;
      color: #4b5563;
      line-height: 1.35;
    }

    /* Tablas Limpias */
    .clean-table {
      width: 100%;
      border-collapse: collapse;
      margin: 6px 0 9px 0;
      font-size: 7.5pt;
    }

    .clean-table th {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      padding: 5px 8px;
      text-align: left;
      font-weight: 700;
      color: #374151;
      text-transform: uppercase;
      font-size: 6.8pt;
      letter-spacing: 0.04em;
    }

    .clean-table td {
      border: 1px solid #e5e7eb;
      padding: 5px 8px;
      color: #4b5563;
    }

    .clean-table tr:nth-child(even) td {
      background: #fafafa;
    }

    .code-pill {
      font-family: 'JetBrains Mono', Consolas, monospace;
      font-weight: 600;
      background: #f3f4f6;
      border: 1px solid #e5e7eb;
      padding: 1px 4px;
      border-radius: 3px;
      font-size: 7.2pt;
      color: #111827;
    }

    /* Póliza de Garantía */
    .warranty-card {
      background: #ffffff;
      border: 1.5px solid #d1d5db;
      border-top: 3.5px solid #c52222;
      border-radius: 5px;
      padding: 11px 14px;
      margin-top: 8px;
    }

    .warranty-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
      padding-bottom: 5px;
      border-bottom: 1px solid #f3f4f6;
    }

    .warranty-title {
      font-size: 9.2pt;
      font-weight: 800;
      color: #111827;
      text-transform: uppercase;
      letter-spacing: -0.01em;
    }

    .warranty-badge {
      background: #fef2f2;
      color: #c52222;
      border: 1px solid #fee2e2;
      font-weight: 700;
      font-size: 6.5pt;
      padding: 2px 6px;
      border-radius: 3px;
      text-transform: uppercase;
    }

    .warranty-body p {
      font-size: 7.6pt;
      color: #4b5563;
      margin-bottom: 6px;
      line-height: 1.4;
    }

    .warranty-features {
      list-style: none;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 5px;
      margin-top: 6px;
    }

    .warranty-features li {
      font-size: 7.2pt;
      color: #374151;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .warranty-features li::before {
      content: '✓';
      color: #c52222;
      font-weight: 800;
    }

    /* Footer de cada página */
    .doc-footer {
      padding-top: 6px;
      border-top: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      font-size: 6.8pt;
      color: #9ca3af;
    }
  </style>
</head>
<body>

  <!-- ========================================================================= -->
  <!-- PÁGINA 1: IDENTIFICACIÓN, CREDENCIALES & ACCESO AL PANEL                  -->
  <!-- ========================================================================= -->
  <div class="page">
    <div class="page-content">
      
      <!-- Encabezado con Logo Oficial Arriba -->
      <div class="header-main">
        ${logoBase64 ? `<img src="${logoBase64}" alt="Patria Nostra" class="header-logo" />` : ''}
        <h1 class="header-title">DOCUMENTACIÓN & MANUAL DE ADMINISTRACIÓN</h1>
        <div class="header-subtitle">TIENDA ONLINE OFICIAL • PATRIA NOSTRA DISTRO • DOMINIO .CL</div>
        <div class="header-meta">
          <span>Tienda Pública: <strong>https://patrianostradistro.cl</strong></span>
          <span>Desarrollo & Respaldo: <strong>NOWEB LABS</strong></span>
          <span>Fecha de Emisión: <strong>Octubre 2026</strong></span>
        </div>
      </div>

      <!-- SECCIÓN 1: ACCESOS RÁPIDOS Y CREDENCIALES -->
      <div class="section-title">
        <span class="section-number">1</span>
        <span>ACCESOS RÁPIDOS & CREDENCIALES OFICIALES</span>
      </div>

      <p style="font-size: 7.8pt; color: #4b5563; margin-bottom: 7px;">
        A continuación se resumen los accesos y credenciales oficiales para la gestión del sitio web y las comunicaciones corporativas:
      </p>

      <div class="creds-grid">
        <!-- Tarjeta Panel Web -->
        <div class="cred-box">
          <span class="cred-badge">PANEL DE ADMINISTRACIÓN WEB</span>
          <div class="cred-row">
            <span class="cred-label">Enlace Directo:</span>
            <span class="cred-value">https://patrianostradistro.cl/admin</span>
          </div>
          <div class="cred-row">
            <span class="cred-label">Usuario / Correo:</span>
            <span class="cred-value">contacto@patrianostradistro.cl</span>
          </div>
          <div class="cred-row">
            <span class="cred-label">Contraseña:</span>
            <span class="cred-value">PatriaNostra2026!</span>
          </div>
        </div>

        <!-- Tarjeta Correo Outlook -->
        <div class="cred-box">
          <span class="cred-badge">CORREO CORPORATIVO (OUTLOOK / WEBMAIL)</span>
          <div class="cred-row">
            <span class="cred-label">Dirección Email:</span>
            <span class="cred-value">contacto@patrianostradistro.cl</span>
          </div>
          <div class="cred-row">
            <span class="cred-label">Contraseña:</span>
            <span class="cred-value">Patria!34</span>
          </div>
          <div class="cred-row">
            <span class="cred-label">Webmail Directo:</span>
            <span class="cred-value">https://mail.patrianostradistro.cl/webmail</span>
          </div>
        </div>
      </div>

      <!-- SECCIÓN 2: TUTORIAL DE INGRESO AL PANEL -->
      <div class="section-title">
        <span class="section-number">2</span>
        <span>CÓMO INGRESAR AL PANEL DE ADMINISTRACIÓN</span>
      </div>

      <div class="steps-list">
        <div class="step-item">
          <div class="step-idx">1</div>
          <div class="step-text">
            <h4>Abrir la Dirección de Acceso Oficial</h4>
            <p>En tu navegador web de preferencia (Chrome, Edge, Safari o Firefox), ingresa a <span class="code-pill">https://patrianostradistro.cl/admin</span> o haz clic en el enlace discreto <strong>"Panel Admin"</strong> situado en el pie de página (footer) de la tienda.</p>
          </div>
        </div>

        <div class="step-item">
          <div class="step-idx">2</div>
          <div class="step-text">
            <h4>Autenticación de Seguridad</h4>
            <p>Escribe tu correo <span class="code-pill">contacto@patrianostradistro.cl</span> y la contraseña oficial del panel <span class="code-pill">PatriaNostra2026!</span>. Luego pulsa el botón rojo <strong>"INGRESAR AL SISTEMA →"</strong>.</p>
          </div>
        </div>

        <div class="step-item">
          <div class="step-idx">3</div>
          <div class="step-text">
            <h4>Navegación por el Menú Lateral</h4>
            <p>Una vez dentro, tendrás acceso directo e intuitivo a los módulos principales: <strong>Pedidos</strong>, <strong>Productos</strong>, <strong>Inventario</strong> y <strong>Resumen</strong>, con la opción de regresar a la tienda pública o cerrar sesión con un clic.</p>
          </div>
        </div>
      </div>

      <!-- Tips de seguridad y recomendaciones -->
      <div class="card card-accent">
        <h4 style="font-size: 8pt; font-weight: 700; color: #111827; margin-bottom: 2px;">💡 Recomendación Operativa</h4>
        <p style="font-size: 7.5pt; color: #4b5563;">
          Guarda la dirección <span class="code-pill">https://patrianostradistro.cl/admin</span> en la barra de marcadores o favoritos de tu navegador para acceder de forma rápida y revisar ventas diarias o actualizar existencias de prendas.
        </p>
      </div>

    </div>

    <div class="doc-footer">
      <span>Patria Nostra Distro Chile • https://patrianostradistro.cl</span>
      <span>Página 1 de 3</span>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- PÁGINA 2: GESTIÓN DE PRODUCTOS, STOCK & SEGUIMIENTO DE PEDIDOS            -->
  <!-- ========================================================================= -->
  <div class="page">
    <div class="page-content">
      
      <div class="mini-header">
        <div class="mini-brand">
          ${logoBase64 ? `<img src="${logoBase64}" alt="Logo" class="mini-logo" />` : ''}
          <span class="mini-brand-text">PATRIA NOSTRA DISTRO</span>
        </div>
        <span class="mini-doc-label">Manual de Gestión: Catálogo & Pedidos</span>
      </div>

      <!-- SECCIÓN 3: GESTIÓN DE PRODUCTOS Y STOCK -->
      <div class="section-title">
        <span class="section-number">3</span>
        <span>GESTIÓN DE PRODUCTOS: SUBIR, MODIFICAR Y CONTROL DE STOCK</span>
      </div>

      <div class="card card-accent" style="margin-bottom: 8px;">
        <h4 style="font-size: 8.3pt; font-weight: 700; color: #111827; margin-bottom: 3px;">A. Cómo Subir un Nuevo Producto o Prenda</h4>
        <p style="font-size: 7.6pt; color: #4b5563; margin-bottom: 5px;">Para publicar un nuevo artículo en la tienda en tiempo real:</p>
        <ol style="margin-left: 16px; font-size: 7.5pt; color: #4b5563; line-height: 1.45;">
          <li>Ve a la pestaña <strong>"Productos"</strong> en el menú lateral del panel.</li>
          <li>Haz clic en el botón superior derecho <strong>"+ NUEVO PRODUCTO"</strong> para abrir el editor.</li>
          <li><strong>Nombre y Precio:</strong> Ingresa el título de la prenda y su valor en pesos chilenos (CLP). El desglose de IVA es automático.</li>
          <li><strong>Categoría:</strong> Selecciona la familia de prendas (ej: Poleras, Polerones, Accesorios).</li>
          <li><strong>Imágenes:</strong> Sube la imagen principal y las fotos de la galería (recomendado formato PNG o JPG nítido sobre fondo neutro).</li>
          <li><strong>Tallas y Stock:</strong> Activa las tallas correspondientes (<span class="code-pill">S</span>, <span class="code-pill">M</span>, <span class="code-pill">L</span>, <span class="code-pill">XL</span>) y define la cantidad disponible de cada una.</li>
          <li><strong>Descripción:</strong> Especifica el material (ej: 100% algodón prelavado 200g, serigrafía al tacto).</li>
          <li>Presiona <strong>"GUARDAR PRODUCTO"</strong>. El artículo aparecerá de inmediato publicado en el catálogo público.</li>
        </ol>
      </div>

      <div class="card" style="margin-bottom: 10px;">
        <h4 style="font-size: 8.3pt; font-weight: 700; color: #111827; margin-bottom: 3px;">B. Cómo Modificar un Producto y Reponer Stock</h4>
        <p style="font-size: 7.5pt; color: #4b5563; line-height: 1.4;">
          En la lista de productos, localiza la prenda y pulsa el botón <strong>"Editar"</strong> (ícono de lápiz). Podrás corregir precios, cambiar o reordenar fotografías, ajustar las unidades disponibles por talla o pausar la publicación. Al finalizar, pulsa <strong>"ACTUALIZAR PRODUCTO"</strong> para sincronizar los cambios al instante.
        </p>
      </div>

      <!-- SECCIÓN 4: GESTIÓN DE PEDIDOS Y VENTAS -->
      <div class="section-title">
        <span class="section-number">4</span>
        <span>GESTIÓN Y SEGUIMIENTO DE PEDIDOS</span>
      </div>

      <p style="font-size: 7.6pt; color: #4b5563; margin-bottom: 6px;">
        Cada vez que un cliente compra mediante Webpay Plus / Flow, la orden se registra de forma automática en la sección <strong>"Pedidos"</strong>:
      </p>

      <table class="clean-table">
        <thead>
          <tr>
            <th style="width: 25%;">Estado de la Orden</th>
            <th style="width: 40%;">Significado en el Flujo</th>
            <th style="width: 35%;">Acción del Administrador</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong style="color: #b45309;">Pendiente</strong></td>
            <td>Orden iniciada a la espera del comprobante de pago.</td>
            <td>Confirmar transacción antes de embalar.</td>
          </tr>
          <tr>
            <td><strong style="color: #c52222;">En Preparación</strong></td>
            <td>Pago aprobado por Webpay Plus. Transacción confirmada.</td>
            <td>Empacar prendas en bodega con rótulo de cliente.</td>
          </tr>
          <tr>
            <td><strong style="color: #1d4ed8;">Enviado</strong></td>
            <td>Paquete entregado al servicio de despacho o transporte.</td>
            <td>Coordinar envío o proveer seguimiento.</td>
          </tr>
          <tr>
            <td><strong style="color: #15803d;">Entregado</strong></td>
            <td>Pedido recibido conforme por el comprador.</td>
            <td>Proceso completado exitosamente.</td>
          </tr>
        </tbody>
      </table>

      <div class="card">
        <p style="font-size: 7.5pt; color: #4b5563; line-height: 1.4;">
          📄 <strong>Descarga y Reimpresión de Comprobante en PDF:</strong> Al hacer clic sobre cualquier pedido podrás ver el desglose completo (Nombre, RUT, Teléfono, Comuna, Dirección y prendas) y presionar <strong>"DESCARGAR ORDEN EN PDF"</strong> para obtener el documento oficial para adjuntar al paquete o enviar al comprador.
        </p>
      </div>

    </div>

    <div class="doc-footer">
      <span>Patria Nostra Distro Chile • https://patrianostradistro.cl</span>
      <span>Página 2 de 3</span>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- PÁGINA 3: CONFIGURACIÓN OUTLOOK (PC Y MÓVIL) & GARANTÍA NOWEB LABS        -->
  <!-- ========================================================================= -->
  <div class="page">
    <div class="page-content">
      
      <div class="mini-header">
        <div class="mini-brand">
          ${logoBase64 ? `<img src="${logoBase64}" alt="Logo" class="mini-logo" />` : ''}
          <span class="mini-brand-text">PATRIA NOSTRA DISTRO</span>
        </div>
        <span class="mini-doc-label">Correo Outlook & Garantía Oficial</span>
      </div>

      <!-- SECCIÓN 5: CONFIGURACIÓN DE CORREO OUTLOOK -->
      <div class="section-title">
        <span class="section-number">5</span>
        <span>CONFIGURACIÓN DEL CORREO EN OUTLOOK (PC Y MÓVIL)</span>
      </div>

      <!-- Parámetros de la Cuenta -->
      <div class="card" style="padding: 8px 11px; margin-bottom: 9px; background: #ffffff;">
        <div style="font-size: 7.8pt; font-weight: 700; color: #111827; margin-bottom: 4px; text-transform: uppercase;">
          Parámetros Oficiales de la Cuenta Corporativa:
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 7.5pt;">
          <div>
            <span style="color: #6b7280;">• Correo:</span> <span class="code-pill">contacto@patrianostradistro.cl</span><br>
            <span style="color: #6b7280;">• Contraseña:</span> <span class="code-pill">Patria!34</span><br>
            <span style="color: #6b7280;">• Tipo de Cuenta:</span> <strong>IMAP</strong> (Sincronización multi-dispositivo)
          </div>
          <div>
            <span style="color: #6b7280;">• Servidor Entrante:</span> <span class="code-pill">mail.patrianostradistro.cl</span> (Puerto <strong>993</strong>, SSL/TLS)<br>
            <span style="color: #6b7280;">• Servidor Saliente:</span> <span class="code-pill">mail.patrianostradistro.cl</span> (Puerto <strong>465</strong> o <strong>587</strong>, SSL)<br>
            <span style="color: #6b7280;">• Webmail Alternativo:</span> <span class="code-pill">https://mail.patrianostradistro.cl/webmail</span>
          </div>
        </div>
      </div>

      <div class="creds-grid" style="margin-bottom: 10px;">
        <!-- Guía PC -->
        <div class="card" style="margin-bottom: 0;">
          <h4 style="font-size: 8.2pt; font-weight: 700; color: #111827; margin-bottom: 3px;">
            💻 En Outlook para PC / Mac
          </h4>
          <ol style="margin-left: 15px; font-size: 7.4pt; color: #4b5563; line-height: 1.4;">
            <li>Abre Microsoft Outlook y pulsa en <strong>Archivo</strong> &gt; <strong>Agregar cuenta</strong>.</li>
            <li>Escribe <span class="code-pill">contacto@patrianostradistro.cl</span> y marca <em>"Configurar manualmente"</em>.</li>
            <li>Selecciona la opción <strong>IMAP</strong>.</li>
            <li>Digita la contraseña <span class="code-pill">Patria!34</span>.</li>
            <li>En servidor de entrada y salida coloca <span class="code-pill">mail.patrianostradistro.cl</span> con puertos <strong>993 (SSL)</strong> y <strong>465 (SSL)</strong>.</li>
            <li>Presiona <strong>Siguiente</strong> para completar la sincronización.</li>
          </ol>
        </div>

        <!-- Guía Móvil -->
        <div class="card" style="margin-bottom: 0;">
          <h4 style="font-size: 8.2pt; font-weight: 700; color: #111827; margin-bottom: 3px;">
            📱 En Outlook para Celular (Android / iOS)
          </h4>
          <ol style="margin-left: 15px; font-size: 7.4pt; color: #4b5563; line-height: 1.4;">
            <li>Instala la app oficial <strong>Microsoft Outlook</strong> desde Google Play o App Store.</li>
            <li>Abre la aplicación y pulsa en <strong>Agregar cuenta</strong>.</li>
            <li>Escribe <span class="code-pill">contacto@patrianostradistro.cl</span> y selecciona <strong>IMAP</strong>.</li>
            <li>Ingresa la contraseña <span class="code-pill">Patria!34</span> y nombre (<em>Patria Nostra</em>).</li>
            <li>Indica el servidor <span class="code-pill">mail.patrianostradistro.cl</span> con SSL activado.</li>
            <li>Confirma con el botón ✓. Recibirás avisos en tu teléfono cada vez que un cliente te escriba.</li>
          </ol>
        </div>
      </div>

      <!-- SECCIÓN 6: GARANTÍA OFICIAL NOWEB LABS -->
      <div class="section-title">
        <span class="section-number">6</span>
        <span>GARANTÍA OFICIAL & SOPORTE TÉCNICO NOWEB LABS</span>
      </div>

      <div class="warranty-card">
        <div class="warranty-header">
          <div class="warranty-title">🛡️ CERTIFICADO DE GARANTÍA OFICIAL NOWEB LABS</div>
          <span class="warranty-badge">1 MES DE SOPORTE & CAMBIOS</span>
        </div>
        <div class="warranty-body">
          <p>
            <strong>NOWEB LABS</strong> certifica que la plataforma de comercio electrónico desarrollada para <strong>PATRIA NOSTRA DISTRO</strong> en el dominio oficial <span class="code-pill">https://patrianostradistro.cl</span> cuenta con una <strong>garantía integral de 1 mes</strong> (30 días corridos) a partir de la entrega y puesta en producción.
          </p>
          <p>
            Durante este período, el cliente dispone de asistencia prioritaria y gratuita en los siguientes aspectos:
          </p>
          <ul class="warranty-features">
            <li><strong>Solicitud de Cambios:</strong> Ajustes de textos, fotos, banners, precios o ajustes del catálogo.</li>
            <li><strong>Soporte Técnico Continuo:</strong> Resolución de dudas en el uso del panel de administración.</li>
            <li><strong>Asistencia en Correo Outlook:</strong> Configuración y sincronización en nuevos equipos o teléfonos.</li>
            <li><strong>Verificación de Pasarela de Pagos:</strong> Monitoreo de transacciones con Webpay Plus / Flow.</li>
          </ul>
          <p style="margin-top: 7px; margin-bottom: 0; font-size: 7.2pt; color: #6b7280; border-top: 1px dashed #e5e7eb; padding-top: 5px;">
            Canal de Atención Oficial de Noweb Labs: <strong>soporte@noweb.cl</strong> • Sitio Web: <strong>https://noweb.cl</strong>
          </p>
        </div>
      </div>

    </div>

    <div class="doc-footer">
      <span>Patria Nostra Distro Chile • Ingeniería y Soporte por Noweb Labs</span>
      <span>Página 3 de 3</span>
    </div>
  </div>

</body>
</html>
`;

// Guardar archivo HTML temporal
fs.writeFileSync(tempHtmlPath, htmlContent, 'utf8');

// Ejecutar Chrome Headless para compilar a PDF directo en el Escritorio
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

console.log('Generando PDF en el Escritorio con Chrome headless...');
try {
  execFileSync(chromePath, [
    '--headless=new',
    '--disable-gpu',
    `--print-to-pdf=${outputPdfPath}`,
    '--no-pdf-header-footer',
    tempHtmlPath
  ]);

  if (fs.existsSync(outputPdfPath)) {
    const stats = fs.statSync(outputPdfPath);
    console.log(`✅ PDF generado exitosamente en el Escritorio:`);
    console.log(`📁 Ruta: ${outputPdfPath}`);
    console.log(`📏 Tamaño: ${stats.size} bytes (${(stats.size / 1024).toFixed(1)} KB)`);
  } else {
    console.error('❌ El archivo PDF no se encontró en la ruta esperada.');
  }
} catch (err) {
  console.error('❌ Error al ejecutar Chrome para generar el PDF:', err);
} finally {
  if (fs.existsSync(tempHtmlPath)) {
    fs.unlinkSync(tempHtmlPath);
  }
}
