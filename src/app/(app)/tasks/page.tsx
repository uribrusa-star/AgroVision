
'use client';

import React, { useContext, useMemo, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { PageHeader } from "@/components/page-header";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AppDataContext } from '@/context/app-data-context';
import type { Task, TaskStatus } from '@/lib/types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Calendar as CalendarIcon, MoreHorizontal, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const TaskSchema = z.object({
    title: z.string().min(5, "El título debe tener al menos 5 caracteres."),
    description: z.string().min(10, "La descripción debe tener al menos 10 caracteres."),
    assignedToId: z.string().min(1, "Debe asignar la tarea a un usuario."),
    dueDate: z.date().optional(),
});

type TaskFormValues = z.infer<typeof TaskSchema>;

const TaskCard = ({ task }: { task: Task }) => {
    const { users } = useContext(AppDataContext);
    const assignedUser = users.find(u => u.id === task.assignedTo.id);

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-base font-bold">{task.title}</CardTitle>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            {task.status === 'pending' && <DropdownMenuItem><ArrowRight className="mr-2 h-4 w-4" />Mover a En Progreso</DropdownMenuItem>}
                            {task.status === 'in-progress' && <DropdownMenuItem><ArrowRight className="mr-2 h-4 w-4" />Mover a Completado</DropdownMenuItem>}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground pb-4">
                <p className="mb-4">{task.description}</p>
                <div className="flex justify-between items-center">
                     {assignedUser && (
                        <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                                <AvatarImage src={`https://picsum.photos/seed/${assignedUser.avatar}/24/24`} />
                                <AvatarFallback>{assignedUser.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-medium">{assignedUser.name}</span>
                        </div>
                    )}
                    {task.dueDate && (
                        <div className="flex items-center gap-1 text-xs">
                            <CalendarIcon className="h-3 w-3" />
                            <span>{new Date(task.dueDate).toLocaleDateString('es-ES')}</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

export default function TasksPage() {
    const { tasks, users, currentUser, addTask } = useContext(AppDataContext);
    const { toast } = useToast();
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const form = useForm<TaskFormValues>({
        resolver: zodResolver(TaskSchema),
        defaultValues: { title: '', description: '', assignedToId: '', dueDate: undefined },
    });

    if (!currentUser) return null;
    const canCreateTasks = currentUser.role === 'Productor';

    const assignableUsers = users.filter(u => u.id !== currentUser.id);

    const categorizedTasks = useMemo(() => {
        const pending: Task[] = [];
        const inProgress: Task[] = [];
        const completed: Task[] = [];

        tasks.forEach(task => {
            if (task.status === 'in-progress') inProgress.push(task);
            else if (task.status === 'completed') completed.push(task);
            else pending.push(task);
        });

        return { pending, inProgress, completed };
    }, [tasks]);

    const onAddTask = (values: TaskFormValues) => {
        const assignedToUser = users.find(u => u.id === values.assignedToId);
        if (!assignedToUser || !currentUser) return;
        
        startTransition(() => {
            addTask({
                title: values.title,
                description: values.description,
                assignedTo: { id: assignedToUser.id, name: assignedToUser.name },
                createdBy: { id: currentUser.id, name: currentUser.name },
                status: 'pending',
                createdAt: new Date().toISOString(),
                dueDate: values.dueDate?.toISOString(),
            });
            toast({ title: "Tarea Creada", description: `La tarea "${values.title}" ha sido asignada a ${assignedToUser.name}.` });
            setIsAddDialogOpen(false);
            form.reset();
        });
    }

  return (
    <>
      <PageHeader
        title="Gestión de Tareas"
        description="Cree, asigne y siga el progreso de las tareas del equipo."
      >
        {canCreateTasks && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                    <Button>Crear Nueva Tarea</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Crear Nueva Tarea</DialogTitle>
                        <DialogDescription>Complete los detalles para asignar una nueva tarea.</DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onAddTask)} className="space-y-4">
                            <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Título</FormLabel><FormControl><Input {...field} placeholder="Ej. Revisar riego en Lote 005" disabled={isPending} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Descripción</FormLabel><FormControl><Textarea {...field} placeholder="Añadir detalles sobre la tarea..." disabled={isPending} /></FormControl><FormMessage /></FormItem>)} />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="assignedToId" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Asignar a</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value} disabled={isPending}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Seleccione un usuario" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                {assignableUsers.map(user => <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="dueDate" render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Fecha Límite (Opcional)</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")} disabled={isPending}>
                                                        {field.value ? format(field.value, "PPP", { locale: es }) : <span>Seleccione fecha</span>}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date()} initialFocus />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                            <DialogFooter>
                                <DialogClose asChild><Button type="button" variant="secondary">Cancelar</Button></DialogClose>
                                <Button type="submit" disabled={isPending}>{isPending ? "Creando..." : "Crear Tarea"}</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        )}
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-muted/30">
          <CardHeader><CardTitle>Pendiente</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {categorizedTasks.pending.length > 0 ? (
                categorizedTasks.pending.map(task => <TaskCard key={task.id} task={task} />)
            ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No hay tareas pendientes.</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-muted/30">
          <CardHeader><CardTitle>En Progreso</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {categorizedTasks.inProgress.length > 0 ? (
                categorizedTasks.inProgress.map(task => <TaskCard key={task.id} task={task} />)
            ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No hay tareas en progreso.</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-muted/30">
          <CardHeader><CardTitle>Completado</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {categorizedTasks.completed.length > 0 ? (
                categorizedTasks.completed.map(task => <TaskCard key={task.id} task={task} />)
            ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No hay tareas completadas.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
