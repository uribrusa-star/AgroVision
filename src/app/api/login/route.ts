
import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions } from '@/lib/session';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import type { User } from '@/lib/types';

export async function POST(request: Request) {
  const session = await getIronSession(cookies(), sessionOptions);
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Faltan credenciales.' }, { status: 400 });
  }

  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return NextResponse.json({ error: 'Correo o contraseña incorrectos.' }, { status: 401 });
    }

    const userDoc = querySnapshot.docs[0];
    const user = { id: userDoc.id, ...userDoc.data() } as User;

    const isValidPassword = user.password === password;

    if (!isValidPassword) {
      return NextResponse.json({ error: 'Correo o contraseña incorrectos.' }, { status: 401 });
    }
    
    // Omit password from the user object before saving to session and sending to client
    const { password: _, ...userToSave } = user;

    session.user = userToSave;
    await session.save();

    return NextResponse.json({ user: userToSave });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Ocurrió un error en el servidor.' }, { status: 500 });
  }
}
