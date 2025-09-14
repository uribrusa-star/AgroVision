
'use client';

import React, { useContext, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, Mail } from 'lucide-react';
import Image from 'next/image';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { AppDataContext } from '@/context/app-data-context.tsx';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


const LoginSchema = z.object({
    email: z.string().email("Por favor, ingrese un correo electrónico válido."),
    password: z.string().min(1, "La contraseña es requerida."),
    rememberMe: z.boolean().default(false),
});

type LoginFormValues = z.infer<typeof LoginSchema>;

export default function LoginPageContent() {
  const { users, currentUser, setCurrentUser, isClient } = useContext(AppDataContext);
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  useEffect(() => {
    if (isClient && currentUser) {
      router.replace('/dashboard');
    }
  }, [isClient, currentUser, router]);


  const onSubmit = (values: LoginFormValues) => {
    startTransition(() => {
        const user = users.find(u => u.email === values.email && u.password === values.password);

        if (user) {
            setCurrentUser(user, values.rememberMe);
            toast({
                title: `Bienvenido, ${user.name}!`,
                description: "Ha iniciado sesión correctamente.",
            });
            // The useEffect above will handle the redirection.
        } else {
            form.setError("root", { message: "Correo electrónico o contraseña incorrectos."});
        }
    });
  };

  // If already logged in, don't render the form, let useEffect redirect.
  if (currentUser) {
    return null; // or a loading spinner
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
       <div className="flex flex-col items-center gap-4 mb-8">
        <Image src="/logo.png" alt="AgroVision Logo" width={64} height={64} />
        <h1 className="text-4xl font-headline text-foreground">Bienvenido a AgroVision</h1>
        <p className="text-muted-foreground max-w-md text-center">
          Su asistente digital para la gestión de la producción de frutilla.
        </p>
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Iniciar Sesión</CardTitle>
          <CardDescription>Ingrese sus credenciales para acceder a su panel.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {form.formState.errors.root && (
                     <Alert variant="destructive">
                        <AlertTitle>Error de Autenticación</AlertTitle>
                        <AlertDescription>{form.formState.errors.root.message}</AlertDescription>
                    </Alert>
                )}
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Correo Electrónico</FormLabel>
                        <FormControl>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="productor@agrovision.co" {...field} className="pl-10" />
                            </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Contraseña</FormLabel>
                         <FormControl>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input type="password" placeholder="••••••••" {...field} className="pl-10" />
                            </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="rememberMe"
                    render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                        <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                        />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                        <FormLabel>
                            Recordarme
                        </FormLabel>
                        </div>
                    </FormItem>
                    )}
                />

                <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending ? "Ingresando..." : "Ingresar"}
                </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} AgroVision. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}

