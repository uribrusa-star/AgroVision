
import { NextResponse } from 'next/server';
import { sendEmail } from '@/services/email-service';
import type { Task, User } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { task, creator } = body as { task: Task, creator: User };

    if (!task || !creator || !creator.email) {
      return NextResponse.json({ error: 'Faltan datos de la tarea o del creador.' }, { status: 400 });
    }
    
    const notificationEmail = creator.notificationEmail || creator.email;
    const completedBy = task.assignedTo.name;

    const subject = `Tarea Completada en AgroVision: ${task.title}`;
    const text = `Hola ${creator.name},\n\nLa tarea "${task.title}" ha sido marcada como completada por ${completedBy}.\n\nPuedes ver los detalles en la sección de Tareas de la aplicación.\n\nSaludos,\nEl equipo de AgroVision`;
    
    const html = `
      <div style="font-family: sans-serif; line-height: 1.5;">
        <h2>Tarea Completada en AgroVision</h2>
        <p>Hola ${creator.name},</p>
        <p>La tarea que asignaste ha sido marcada como completada. A continuación se muestran los detalles:</p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 8px; font-weight: bold; width: 120px;">Título:</td>
            <td style="padding: 8px;">${task.title}</td>
          </tr>
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 8px; font-weight: bold;">Completada por:</td>
            <td style="padding: 8px;">${completedBy}</td>
          </tr>
        </table>
        <p>Puedes revisar el estado de todas las tareas en la sección correspondiente de la aplicación.</p>
        <p>Saludos,<br>El equipo de AgroVision</p>
      </div>
    `;

    await sendEmail({ to: notificationEmail, subject, text, html });

    return NextResponse.json({ message: 'Correo de tarea completada enviado exitosamente.' });

  } catch (error) {
    console.error('Error al enviar correo de tarea completada:', error);
    return NextResponse.json({ error: 'Ocurrió un error en el servidor al intentar enviar el correo.' }, { status: 500 });
  }
}
