

'use client';

import React, { ReactNode, useState, useCallback, useEffect } from 'react';
import type { AppData, User, Harvest, Collector, AgronomistLog, PhenologyLog, Batch, CollectorPaymentLog, EstablishmentData, ProducerLog, Transaction } from '@/lib/types';
import { users as availableUsers, initialEstablishmentData } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, writeBatch, query, where, addDoc, getDoc, orderBy } from 'firebase/firestore';

export const AppDataContext = React.createContext<AppData>({
  loading: true,
  currentUser: null,
  users: [],
  setCurrentUser: () => {},
  harvests: [],
  collectors: [],
  agronomistLogs: [],
  phenologyLogs: [],
  batches: [],
  collectorPaymentLogs: [],
  establishmentData: null,
  producerLogs: [],
  transactions: [],
  addHarvest: async () => { throw new Error('Not implemented') },
  editCollector: async () => { throw new Error('Not implemented') },
  deleteCollector: async () => { throw new Error('Not implemented') },
  addAgronomistLog: async () => { throw new Error('Not implemented') },
  editAgronomistLog: async () => { throw new Error('Not implemented') },
  deleteAgronomistLog: async () => { throw new Error('Not implemented') },
  addPhenologyLog: async () => { throw new Error('Not implemented') },
  editPhenologyLog: async () => { throw new Error('Not implemented') },
  deletePhenologyLog: async () => { throw new Error('Not implemented') },
  addCollector: async () => { throw new Error('Not implemented') },
  addBatch: async () => { throw new Error('Not implemented') },
  deleteBatch: async () => { throw new Error('Not implemented') },
  addCollectorPaymentLog: async () => { throw new Error('Not implemented') },
  deleteCollectorPaymentLog: async () => { throw new Error('Not implemented') },
  updateEstablishmentData: async () => { throw new Error('Not implemented') },
  addProducerLog: async () => { throw new Error('Not implemented') },
  addTransaction: async () => { throw new Error('Not implemented') },
  deleteTransaction: async () => { throw new Error('Not implemented') },
  updateUserPassword: async () => { throw new Error('Not implemented') },
  isClient: false,
});

const usePersistentState = <T,>(key: string): [T, (value: T | null, rememberMe?: boolean) => void] => {
  const [state, setState] = useState<T>(() => null as T); // Start with null state on server

  // Load state from storage only on the client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const localItem = window.localStorage.getItem(key);
        if (localItem) {
          setState(JSON.parse(localItem));
          return;
        }

        const sessionItem = window.sessionStorage.getItem(key);
        if (sessionItem) {
          setState(JSON.parse(sessionItem));
          return;
        }
      } catch (error) {
        console.warn(`Error reading storage key “${key}”:`, error);
      }
    }
  }, [key]);

  const setPersistentState = (value: T | null, rememberMe: boolean = false) => {
    if (typeof window !== 'undefined') {
      // Clear both storages to ensure only one is used
      window.localStorage.removeItem(key);
      window.sessionStorage.removeItem(key);
      
      if (value !== null) {
        const storage: Storage = rememberMe ? window.localStorage : window.sessionStorage;
        storage.setItem(key, JSON.stringify(value));
      }
    }
    setState(value as T);
  };

  return [state, setPersistentState];
};

export const AppContextProvider = ({ children }: { children: ReactNode }) => {
    const { toast } = useToast();
    const [currentUser, setCurrentUser] = usePersistentState<User | null>('currentUser');
    const [users, setUsers] = useState<User[]>([]);
    const [harvests, setHarvests] = useState<Harvest[]>([]);
    const [collectors, setCollectors] = useState<Collector[]>([]);
    const [agronomistLogs, setAgronomistLogs] = useState<AgronomistLog[]>([]);
    const [phenologyLogs, setPhenologyLogs] = useState<PhenologyLog[]>([]);
    const [batches, setBatches] = useState<Batch[]>([]);
    const [collectorPaymentLogs, setCollectorPaymentLogs] = useState<CollectorPaymentLog[]>([]);
    const [establishmentData, setEstablishmentData] = useState<EstablishmentData | null>(null);
    const [producerLogs, setProducerLogs] = useState<ProducerLog[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
      setIsClient(true);
    }, []);

    const fetchData = useCallback(async () => {
      if (!isClient) return;
      setLoading(true);
      try {
        const usersCollectionRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersCollectionRef);

        if (usersSnapshot.empty) {
          const batch = writeBatch(db);
          availableUsers.forEach(user => {
            const userRef = doc(db, 'users', user.id);
            batch.set(userRef, user);
          });
          await batch.commit();
          setUsers(availableUsers);
        } else {
          setUsers(usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as User[]);
        }

        const establishmentDocRef = doc(db, 'establishment', 'main');
        const establishmentDocSnap = await getDoc(establishmentDocRef);

        let estData;
        if (establishmentDocSnap.exists()) {
          estData = { id: establishmentDocSnap.id, ...establishmentDocSnap.data() } as EstablishmentData;
        } else {
          await setDoc(establishmentDocRef, initialEstablishmentData);
          estData = { id: 'main', ...initialEstablishmentData } as EstablishmentData;
        }
        setEstablishmentData(estData);
        
        const [
          collectorsSnapshot,
          harvestsSnapshot,
          agronomistLogsSnapshot,
          phenologyLogsSnapshot,
          batchesSnapshot,
          collectorPaymentsSnapshot,
          producerLogsSnapshot,
          transactionsSnapshot,
        ] = await Promise.all([
          getDocs(collection(db, 'collectors')),
          getDocs(query(collection(db, 'harvests'), orderBy('date', 'desc'))),
          getDocs(query(collection(db, 'agronomistLogs'), orderBy('date', 'desc'))),
          getDocs(query(collection(db, 'phenologyLogs'), orderBy('date', 'desc'))),
          getDocs(query(collection(db, 'batches'), orderBy('preloadedDate', 'desc'))),
          getDocs(query(collection(db, 'collectorPaymentLogs'), orderBy('date', 'desc'))),
          getDocs(query(collection(db, 'producerLogs'), orderBy('date', 'desc'))),
          getDocs(query(collection(db, 'transactions'), orderBy('date', 'desc'))),
        ]);
        
        setCollectors(collectorsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Collector[]);
        setHarvests(harvestsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Harvest[]);
        setAgronomistLogs(agronomistLogsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as AgronomistLog[]);
        setPhenologyLogs(phenologyLogsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as PhenologyLog[]);
        setBatches(batchesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Batch[]);
        setCollectorPaymentLogs(collectorPaymentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as CollectorPaymentLog[]);
        setProducerLogs(producerLogsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ProducerLog[]);
        setTransactions(transactionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Transaction[]);


      } catch (error) {
        console.error("Error fetching data from Firestore:", error);
        toast({
          title: "Error de Conexión",
          description: "No se pudieron cargar los datos. Asegúrese de que Firestore esté configurado y con las reglas de seguridad correctas.",
          variant: "destructive",
        })
      } finally {
        setLoading(false);
      }
    }, [toast, isClient]);
    
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const addHarvest = async (harvest: Omit<Harvest, 'id'>, hoursWorked: number): Promise<string | undefined> => {
        const collectorDoc = collectors.find(c => c.id === harvest.collector.id);
        if (!collectorDoc) {
            toast({ title: "Error", description: "Recolector no encontrado.", variant: "destructive"});
            return undefined;
        }

        const tempId = `harvest_${Date.now()}`;
        const newHarvestWithTempId = { ...harvest, id: tempId };

        // Optimistic UI Update
        setHarvests(prev => [newHarvestWithTempId, ...prev]);
        const updatedCollector = {
            ...collectorDoc,
            totalHarvested: collectorDoc.totalHarvested + harvest.kilograms,
            hoursWorked: collectorDoc.hoursWorked + hoursWorked,
            productivity: (collectorDoc.totalHarvested + harvest.kilograms) / (collectorDoc.hoursWorked + hoursWorked),
        };
        setCollectors(prev => prev.map(c => c.id === harvest.collector.id ? updatedCollector : c));

        try {
            const batch = writeBatch(db);
            const newHarvestRef = doc(collection(db, 'harvests'));
            batch.set(newHarvestRef, harvest);

            const collectorRef = doc(db, 'collectors', harvest.collector.id);
            const { id, ...collectorUpdateData } = updatedCollector;
            batch.update(collectorRef, collectorUpdateData);
            
            await batch.commit();

            // Replace temp ID with real ID on success
            setHarvests(prev => prev.map(h => h.id === tempId ? { ...h, id: newHarvestRef.id } : h));
            return newHarvestRef.id;
        } catch(error) {
            console.error("Failed to add harvest:", error);
            toast({ title: "Error de Sincronización", description: "No se pudo guardar la cosecha en la nube.", variant: "destructive"});
            // Rollback optimistic update on failure
            setHarvests(prev => prev.filter(h => h.id !== tempId));
            setCollectors(prev => prev.map(c => c.id === harvest.collector.id ? collectorDoc : c));
            return undefined;
        }
    };

    const editCollector = async (updatedCollector: Collector) => {
      const originalState = { collectors: [...collectors], harvests: [...harvests], collectorPaymentLogs: [...collectorPaymentLogs] };

      // Optimistic Update
      setCollectors(prev => prev.map(c => c.id === updatedCollector.id ? updatedCollector : c));
      setHarvests(prev => prev.map(h => h.collector.id === updatedCollector.id ? { ...h, collector: { ...h.collector, name: updatedCollector.name } } : h));
      setCollectorPaymentLogs(prev => prev.map(p => p.collectorId === updatedCollector.id ? { ...p, collectorName: updatedCollector.name } : p));
      
      try {
        const batch = writeBatch(db);
        const collectorRef = doc(db, 'collectors', updatedCollector.id);
        const { id, ...collectorData } = updatedCollector;
        batch.update(collectorRef, collectorData);

        const harvestsQuery = query(collection(db, 'harvests'), where('collector.id', '==', updatedCollector.id));
        const harvestsSnapshot = await getDocs(harvestsQuery);
        harvestsSnapshot.forEach(doc => {
            batch.update(doc.ref, { 'collector.name': updatedCollector.name });
        });

        const paymentsQuery = query(collection(db, 'collectorPaymentLogs'), where('collectorId', '==', updatedCollector.id));
        const paymentsSnapshot = await getDocs(paymentsQuery);
        paymentsSnapshot.forEach(doc => {
            batch.update(doc.ref, { collectorName: updatedCollector.name });
        });
        
        await batch.commit();
      } catch (error) {
        console.error("Failed to edit collector:", error);
        // Rollback
        setCollectors(originalState.collectors);
        setHarvests(originalState.harvests);
        setCollectorPaymentLogs(originalState.collectorPaymentLogs);
        toast({ title: "Error", description: "No se pudo actualizar el recolector.", variant: "destructive"});
      }
    };

    const deleteCollector = async (collectorId: string) => {
        const originalState = { collectors: [...collectors], harvests: [...harvests], collectorPaymentLogs: [...collectorPaymentLogs] };
        
        // Optimistic Update
        setCollectors(prev => prev.filter(c => c.id !== collectorId));
        setHarvests(prev => prev.filter(h => h.collector.id !== collectorId));
        setCollectorPaymentLogs(prev => prev.filter(p => p.collectorId !== collectorId));

        try {
            const batchOp = writeBatch(db);
            batchOp.delete(doc(db, 'collectors', collectorId));
            const harvestsQuery = query(collection(db, 'harvests'), where('collector.id', '==', collectorId));
            const paymentsQuery = query(collection(db, 'collectorPaymentLogs'), where('collectorId', '==', collectorId));
            const [harvestsSnapshot, paymentsSnapshot] = await Promise.all([getDocs(harvestsQuery), getDocs(paymentsQuery)]);
            harvestsSnapshot.forEach(doc => batchOp.delete(doc.ref));
            paymentsSnapshot.forEach(doc => batchOp.delete(doc.ref));
            await batchOp.commit();
        } catch(error) {
            console.error("Failed to delete collector:", error);
            setCollectors(originalState.collectors);
            setHarvests(originalState.harvests);
            setCollectorPaymentLogs(originalState.collectorPaymentLogs);
            toast({ title: "Error", description: "No se pudo eliminar al recolector.", variant: "destructive"});
        }
    };

    const addCollector = async (collector: Omit<Collector, 'id'>) => {
        const tempId = `collector_${Date.now()}`;
        setCollectors(prev => [...prev, { id: tempId, ...collector }]);
        
        try {
            const ref = await addDoc(collection(db, 'collectors'), collector);
            setCollectors(prev => prev.map(c => c.id === tempId ? { ...c, id: ref.id } : c));
        } catch (error) {
            console.error("Failed to add collector:", error);
            setCollectors(prev => prev.filter(c => c.id !== tempId));
            toast({ title: "Error", description: "No se pudo agregar al recolector.", variant: "destructive"});
        }
    };

    const addAgronomistLog = async (log: Omit<AgronomistLog, 'id'>) => {
        const tempId = `agrolog_${Date.now()}`;
        setAgronomistLogs(prev => [{ id: tempId, ...log }, ...prev]);

        try {
            const ref = await addDoc(collection(db, 'agronomistLogs'), log);
            setAgronomistLogs(prev => prev.map(l => l.id === tempId ? { ...l, id: ref.id } : l));
        } catch(error) {
            console.error("Failed to add agronomist log:", error);
            setAgronomistLogs(prev => prev.filter(l => l.id !== tempId));
            toast({ title: "Error", description: "No se pudo guardar el registro.", variant: "destructive"});
        }
    };

    const editAgronomistLog = async (updatedLog: AgronomistLog) => {
        const originalLogs = [...agronomistLogs];
        setAgronomistLogs(prev => prev.map(l => l.id === updatedLog.id ? updatedLog : l));

        try {
            const logRef = doc(db, 'agronomistLogs', updatedLog.id);
            const { id, ...data } = updatedLog;
            await setDoc(logRef, data, { merge: true });
        } catch(error) {
            console.error("Failed to edit agronomist log:", error);
            setAgronomistLogs(originalLogs);
            toast({ title: "Error", description: "No se pudo editar el registro.", variant: "destructive"});
        }
    };

    const deleteAgronomistLog = async (logId: string) => {
        const originalLogs = [...agronomistLogs];
        setAgronomistLogs(prev => prev.filter(l => l.id !== logId));

        try {
            await deleteDoc(doc(db, 'agronomistLogs', logId));
        } catch(error) {
            console.error("Failed to delete agronomist log:", error);
            setAgronomistLogs(originalLogs);
            toast({ title: "Error", description: "No se pudo eliminar el registro.", variant: "destructive"});
        }
    };

    const addPhenologyLog = async (log: Omit<PhenologyLog, 'id'>) => {
        const tempId = `phenologylog_${Date.now()}`;
        setPhenologyLogs(prev => [{ id: tempId, ...log }, ...prev]);

        try {
            const ref = await addDoc(collection(db, 'phenologyLogs'), log);
            setPhenologyLogs(prev => prev.map(l => l.id === tempId ? { ...l, id: ref.id } : l));
        } catch (error) {
            console.error("Failed to add phenology log:", error);
            setPhenologyLogs(prev => prev.filter(l => l.id !== tempId));
            toast({ title: "Error", description: "No se pudo guardar el registro de fenología.", variant: "destructive"});
        }
    };

    const editPhenologyLog = async (updatedLog: PhenologyLog) => {
        const originalLogs = [...phenologyLogs];
        setPhenologyLogs(prev => prev.map(l => l.id === updatedLog.id ? updatedLog : l));
        try {
            const logRef = doc(db, 'phenologyLogs', updatedLog.id);
            const { id, ...data } = updatedLog;
            await setDoc(logRef, data, { merge: true });
        } catch(error) {
            console.error("Failed to edit phenology log:", error);
            setPhenologyLogs(originalLogs);
            toast({ title: "Error", description: "No se pudo editar el registro.", variant: "destructive"});
        }
    };

    const deletePhenologyLog = async (logId: string) => {
        const originalLogs = [...phenologyLogs];
        setPhenologyLogs(prev => prev.filter(l => l.id !== logId));
        try {
            await deleteDoc(doc(db, 'phenologyLogs', logId));
        } catch(error) {
            console.error("Failed to delete phenology log:", error);
            setPhenologyLogs(originalLogs);
            toast({ title: "Error", description: "No se pudo eliminar el registro.", variant: "destructive"});
        }
    };

    const addBatch = async (batchData: Omit<Batch, 'id' | 'status' | 'preloadedDate'> & { id: string; preloadedDate: string; status: string }) => {
        const newBatch = { ...batchData, status: 'pending' as 'pending' | 'completed' };
        setBatches(prev => [newBatch, ...prev]);

        try {
            const batchRef = doc(db, 'batches', batchData.id);
            await setDoc(batchRef, newBatch);
        } catch(error) {
            console.error("Failed to add batch:", error);
            setBatches(prev => prev.filter(b => b.id !== batchData.id));
            toast({ title: "Error", description: "No se pudo agregar el lote.", variant: "destructive"});
        }
    };

    const deleteBatch = async (batchId: string) => {
        const originalBatches = [...batches];
        setBatches(prev => prev.filter(b => b.id !== batchId));
        
        try {
            await deleteDoc(doc(db, 'batches', batchId));
        } catch(error) {
            console.error("Failed to delete batch:", error);
            setBatches(originalBatches);
            toast({ title: "Error", description: "No se pudo eliminar el lote.", variant: "destructive"});
        }
    };

    const addCollectorPaymentLog = async (log: Omit<CollectorPaymentLog, 'id'>) => {
        const tempId = `paymentlog_${Date.now()}`;
        setCollectorPaymentLogs(prev => [{ id: tempId, ...log }, ...prev]);
        
        try {
            const ref = await addDoc(collection(db, 'collectorPaymentLogs'), log);
            setCollectorPaymentLogs(prev => prev.map(l => l.id === tempId ? { ...l, id: ref.id } : l));
        } catch (error) {
            console.error("Failed to add payment log:", error);
            setCollectorPaymentLogs(prev => prev.filter(l => l.id !== tempId));
            toast({ title: "Error", description: "No se pudo guardar el pago.", variant: "destructive"});
        }
    };

    const deleteCollectorPaymentLog = async (logId: string) => {
        const originalState = { collectors: [...collectors], harvests: [...harvests], collectorPaymentLogs: [...collectorPaymentLogs] };
        const logToDelete = collectorPaymentLogs.find(l => l.id === logId);
        if (!logToDelete) {
            return;
        }
        const collectorDoc = collectors.find(c => c.id === logToDelete.collectorId);

        // Optimistic update
        setCollectorPaymentLogs(prev => prev.filter(l => l.id !== logId));
        setHarvests(prev => prev.filter(h => h.id !== logToDelete.harvestId));
        if (collectorDoc) {
            const newTotalHarvested = collectorDoc.totalHarvested - logToDelete.kilograms;
            const newHoursWorked = collectorDoc.hoursWorked - logToDelete.hours;
            const updatedCollector = {
                ...collectorDoc,
                totalHarvested: newTotalHarvested,
                hoursWorked: newHoursWorked,
                productivity: newHoursWorked > 0 ? newTotalHarvested / newHoursWorked : 0,
            };
            setCollectors(prev => prev.map(c => c.id === logToDelete.collectorId ? updatedCollector : c));
        }
    
        try {
            const batchOp = writeBatch(db);
            batchOp.delete(doc(db, 'collectorPaymentLogs', logId));
            batchOp.delete(doc(db, 'harvests', logToDelete.harvestId));
            if (collectorDoc) {
                const collectorRef = doc(db, 'collectors', logToDelete.collectorId);
                const newTotalHarvested = collectorDoc.totalHarvested - logToDelete.kilograms;
                const newHoursWorked = collectorDoc.hoursWorked - logToDelete.hours;
                batchOp.update(collectorRef, {
                    totalHarvested: newTotalHarvested,
                    hoursWorked: newHoursWorked,
                    productivity: newHoursWorked > 0 ? newTotalHarvested / newHoursWorked : 0,
                });
            }
            await batchOp.commit();
        } catch(error) {
            console.error("Failed to delete payment log:", error);
            setCollectors(originalState.collectors);
            setHarvests(originalState.harvests);
            setCollectorPaymentLogs(originalState.collectorPaymentLogs);
            toast({ title: "Error", description: "No se pudo eliminar el registro de pago.", variant: "destructive"});
        }
    };

    const updateEstablishmentData = async (data: Partial<EstablishmentData>) => {
        const originalData = establishmentData ? {...establishmentData} : null;
        setEstablishmentData(prev => prev ? { ...prev, ...data } : null);
        
        try {
            const { id, ...updateData } = data;
            const establishmentRef = doc(db, 'establishment', 'main');
            await setDoc(establishmentRef, updateData, { merge: true });
        } catch(error) {
            console.error("Failed to update establishment data:", error);
            setEstablishmentData(originalData);
            toast({ title: "Error", description: "No se pudieron actualizar los datos.", variant: "destructive"});
        }
    };

    const addProducerLog = async (log: Omit<ProducerLog, 'id'>) => {
        const tempId = `producerlog_${Date.now()}`;
        setProducerLogs(prev => [{ id: tempId, ...log }, ...prev]);
        
        try {
            const ref = await addDoc(collection(db, 'producerLogs'), log);
            setProducerLogs(prev => prev.map(l => l.id === tempId ? { ...l, id: ref.id } : l));
        } catch(error) {
            console.error("Failed to add producer log:", error);
            setProducerLogs(prev => prev.filter(l => l.id !== tempId));
            toast({ title: "Error", description: "No se pudo guardar la nota.", variant: "destructive"});
        }
    };

    const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
        const tempId = `transaction_${Date.now()}`;
        setTransactions(prev => [{ id: tempId, ...transaction }, ...prev]);
        
        try {
            const ref = await addDoc(collection(db, 'transactions'), transaction);
            setTransactions(prev => prev.map(t => t.id === tempId ? { ...t, id: ref.id } : t));
        } catch(error) {
            console.error("Failed to add transaction:", error);
            setTransactions(prev => prev.filter(t => t.id !== tempId));
            toast({ title: "Error", description: "No se pudo guardar la transacción.", variant: "destructive"});
        }
    };

    const deleteTransaction = async (transactionId: string) => {
        const originalTransactions = [...transactions];
        setTransactions(prev => prev.filter(t => t.id !== transactionId));
        
        try {
            await deleteDoc(doc(db, 'transactions', transactionId));
        } catch(error) {
            console.error("Failed to delete transaction:", error);
            setTransactions(originalTransactions);
            toast({ title: "Error", description: "No se pudo eliminar la transacción.", variant: "destructive"});
        }
    };

    const updateUserPassword = async (userId: string, newPassword: string) => {
        const originalUsers = users;
        const userToUpdate = users.find(u => u.id === userId);
        if (!userToUpdate) throw new Error("User not found");

        const updatedUser = { ...userToUpdate, password: newPassword };
        setUsers(prev => prev.map(u => u.id === userId ? updatedUser : u));

        try {
            const userRef = doc(db, 'users', userId);
            await setDoc(userRef, { password: newPassword }, { merge: true });
            if (currentUser?.id === userId) {
                setCurrentUser(updatedUser, true); 
            }
        } catch (error) {
            console.error("Failed to update password:", error);
            setUsers(originalUsers);
            if (currentUser?.id === userId) {
                setCurrentUser(currentUser, true);
            }
            throw error;
        }
    };

    const value: AppData = {
        loading,
        currentUser,
        users,
        setCurrentUser,
        harvests,
        collectors,
        agronomistLogs,
        phenologyLogs,
        batches,
        collectorPaymentLogs,
        establishmentData,
        producerLogs,
        transactions,
        addHarvest,
        editCollector,
        deleteCollector,
        addAgronomistLog,
        editAgronomistLog,
        deleteAgronomistLog,
        addPhenologyLog,
        editPhenologyLog,
        deletePhenologyLog,
        addCollector,
        addBatch,
        deleteBatch,
        addCollectorPaymentLog,
        deleteCollectorPaymentLog,
        updateEstablishmentData,
        addProducerLog,
        addTransaction,
        deleteTransaction,
        updateUserPassword,
        isClient
    };

    return (
        <AppDataContext.Provider value={value}>
            {children}
        </AppDataContext.Provider>
    );
};

    
    