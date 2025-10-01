
import { NextResponse } from 'next/server';
import { sendEmail } from '@/services/email-service';
import type { Supply, User } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { supply, user, newStock } = body as { supply: Supply, user: User, newStock: number };

    if (!supply || !user || !user.email || newStock === undefined) {
      return NextResponse.json({ error: 'Faltan datos del insumo, usuario o stock.' }, { status: 400 });
    }
    
    const notificationEmail = user.notificationEmail || user.email;

    const subject = `Alerta de Stock Bajo en AgroVision: ${supply.name}`;
    const text = `Hola ${user.name},\n\nEl stock del insumo "${supply.name}" ha alcanzado un nivel bajo.\n\n- Stock Actual: ${newStock.toFixed(2)} kg/L\n- Umbral de Alerta: ${supply.lowStockThreshold} kg/L\n\nSe recomienda reponer el stock lo antes posible.\n\nSaludos,\nEl equipo de AgroVision`;
    
    const html = `
      <div style="font-family: sans-serif; line-height: 1.5;">
        <h2>Alerta de Stock Bajo en AgroVision</h2>
        <p>Hola ${user.name},</p>
        <p>El stock del insumo <strong>${supply.name}</strong> ha alcanzado un nivel bajo. A continuación se muestran los detalles:</p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 8px; font-weight: bold; width: 150px;">Insumo:</td>
            <td style="padding: 8px;">${supply.name}</td>
          </tr>
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 8px; font-weight: bold;">Stock Actual:</td>
            <td style="padding: 8px; color: red;">${newStock.toFixed(2)} kg/L</td>
          </tr>
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 8px; font-weight: bold;">Umbral de Alerta:</td>
            <td style="padding: 8px;">${supply.lowStockThreshold} kg/L</td>
          </tr>
        </table>
        <p>Por favor, considere reponer el stock para evitar faltantes en futuras aplicaciones.</p>
        <p>Saludos,<br>El equipo de AgroVision</p>
      </div>
    `;

    await sendEmail({ to: notificationEmail, subject, text, html });

    return NextResponse.json({ message: 'Correo de alerta de stock bajo enviado exitosamente.' });

  } catch (error) {
    console.error('Error al enviar correo de alerta de stock bajo:', error);
    return NextResponse.json({ error: 'Ocurrió un error en el servidor al intentar enviar el correo.' }, { status: 500 });
  }
}
