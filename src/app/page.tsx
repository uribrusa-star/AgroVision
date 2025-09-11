
'use client';

import React, { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AgroVisionLogo } from '@/components/icons';
import { AppDataContext } from '@/context/app-data-context.tsx';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';

const LoginSchema = z.object({
  email: z.string().email("Debe ser un email válido."),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
  rememberMe: z.boolean().default(false),
});

type LoginFormValues = z.infer<typeof LoginSchema>;

export default function LoginPage() {
  const { setCurrentUser, users } = React.useContext(AppDataContext);
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: true,
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    startTransition(() => {
      const user = users.find(u => u.email === data.email);

      if (user && user.password === data.password) {
        toast({
          title: `¡Bienvenido, ${user.name}!`,
          description: "Iniciando sesión en su cuenta.",
        });
        setCurrentUser(user, data.rememberMe);
        router.push('/dashboard');
      } else {
        toast({
          title: "Error de Autenticación",
          description: "El email o la contraseña son incorrectos.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col items-center gap-4 mb-8 text-center">
        <AgroVisionLogo className="w-16 h-16 text-primary" />
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">Bienvenido a AgroVision</h1>
        <p className="text-muted-foreground max-w-md">
          Su asistente digital para la gestión de la producción de frutilla.
        </p>
      </div>

      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Iniciar Sesión</CardTitle>
          <CardDescription>Ingrese sus credenciales para acceder a su panel.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="ejemplo@agrovision.co" {...field} disabled={isPending} />
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
                      <Input type="password" placeholder="••••••••" {...field} disabled={isPending} />
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
                        disabled={isPending}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Recordar sesión
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? 'Iniciando Sesión...' : 'Ingresar'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
      
      <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} AgroVision. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
