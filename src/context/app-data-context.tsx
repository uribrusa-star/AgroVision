

'use client';

import React, { ReactNode, useState, useCallback, useEffect } from 'react';
import type { AppData, User, Harvest, Collector, AgronomistLog, PhenologyLog, Batch, CollectorPaymentLog, EstablishmentData, ProducerLog, Transaction } from '@/lib/types';
import { users as availableUsers, initialEstablishmentData } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, writeBatch, query, where, addDoc, getDoc } from 'firebase/firestore';

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

type StorageType = 'localStorage' | 'sessionStorage';

const usePersistentState = <T,>(key: string): [T, (value: T | null, rememberMe?: boolean) => void] => {
  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return null as T;
    }
    try {
      const localItem = window.localStorage.getItem(key);
      if (localItem) return JSON.parse(localItem);

      const sessionItem = window.sessionStorage.getItem(key);
      if (sessionItem) return JSON.parse(sessionItem);

      return null as T;
    } catch (error) {
      console.warn(`Error reading storage key “${key}”:`, error);
      return null as T;
    }
  });

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
          getDocs(collection(db, 'harvests')),
          getDocs(collection(db, 'agronomistLogs')),
          getDocs(collection(db, 'phenologyLogs')),
          getDocs(collection(db, 'batches')),
          getDocs(collection(db, 'collectorPaymentLogs')),
          getDocs(collection(db, 'producerLogs')),
          getDocs(collection(db, 'transactions')),
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
    }, [toast]);
    
    useEffect(() => {
        if(isClient) {
            fetchData();
        }
    }, [isClient, fetchData]);

    const addHarvest = async (harvest: Omit<Harvest, 'id'>, hoursWorked: number): Promise<string> => {
        const tempId = `harvest_${Date.now()}`;
        const newHarvest: Harvest = { id: tempId, ...harvest };
        
        const collectorDoc = collectors.find(c => c.id === harvest.collector.id);
        if (!collectorDoc) {
          console.error("Collector not found in state");
          return '';
        }

        const newTotalHarvested = collectorDoc.totalHarvested + harvest.kilograms;
        const newHoursWorked = collectorDoc.hoursWorked + hoursWorked;
        const updatedCollectorData = {
            totalHarvested: newTotalHarvested,
            hoursWorked: newHoursWorked,
            productivity: newHoursWorked > 0 ? newTotalHarvested / newHoursWorked : 0,
        };
        
        // Optimistic update
        setHarvests(prev => [newHarvest, ...prev]);
        setCollectors(prev => prev.map(c => c.id === harvest.collector.id ? { ...c, ...updatedCollectorData } : c));

        try {
          const newHarvestRef = await addDoc(collection(db, 'harvests'), harvest);
          const collectorRef = doc(db, 'collectors', harvest.collector.id);
          await setDoc(collectorRef, updatedCollectorData, { merge: true });

          // Replace temp ID with real ID
          setHarvests(prev => prev.map(h => h.id === tempId ? { ...h, id: newHarvestRef.id } : h));
          return newHarvestRef.id;
        } catch(error) {
          console.error("Failed to add harvest:", error);
          // Rollback optimistic update
          setHarvests(prev => prev.filter(h => h.id !== tempId));
          setCollectors(prev => prev.map(c => c.id === harvest.collector.id ? collectorDoc : c));
          toast({ title: "Error", description: "No se pudo guardar la cosecha.", variant: "destructive"});
          return '';
        }
    };

    const editCollector = async (updatedCollector: Collector) => {
        const originalCollectors = collectors;
        setCollectors(prev => prev.map(c => c.id === updatedCollector.id ? updatedCollector : c));
        
        try {
            const collectorRef = doc(db, 'collectors', updatedCollector.id);
            const { id, ...data } = updatedCollector;
            await setDoc(collectorRef, data, { merge: true });
        } catch (error) {
            console.error("Failed to edit collector:", error);
            setCollectors(originalCollectors);
            toast({ title: "Error", description: "No se pudo editar el recolector.", variant: "destructive"});
        }
    };

    const deleteCollector = async (collectorId: string) => {
        const originalState = { collectors, harvests, collectorPaymentLogs };
        
        // Optimistic update
        setCollectors(prev => prev.filter(c => c.id !== collectorId));
        setHarvests(prev => prev.filter(h => h.collector.id !== collectorId));
        setCollectorPaymentLogs(prev => prev.filter(p => p.collectorId !== collectorId));

        try {
            const batchOp = writeBatch(db);

            const collectorRef = doc(db, 'collectors', collectorId);
            batchOp.delete(collectorRef);

            const harvestsToDeleteQuery = query(collection(db, 'harvests'), where('collector.id', '==', collectorId));
            const harvestsToDeleteSnapshot = await getDocs(harvestsToDeleteQuery);
            harvestsToDeleteSnapshot.forEach(doc => batchOp.delete(doc.ref));

            const paymentsToDeleteQuery = query(collection(db, 'collectorPaymentLogs'), where('collectorId', '==', collectorId));
            const paymentsToDeleteSnapshot = await getDocs(paymentsToDeleteQuery);
            paymentsToDeleteSnapshot.forEach(doc => batchOp.delete(doc.ref));

            await batchOp.commit();
        } catch(error) {
            console.error("Failed to delete collector:", error);
            // Rollback
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
            const newCollectorRef = await addDoc(collection(db, 'collectors'), collector);
            setCollectors(prev => prev.map(c => c.id === tempId ? { ...c, id: newCollectorRef.id } : c));
        } catch (error) {
            console.error("Failed to add collector:", error);
            setCollectors(prev => prev.filter(c => c.id !== tempId));
            toast({ title: "Error", description: "No se pudo agregar al recolector.", variant: "destructive"});
        }
    };

    const addAgronomistLog = async (log: Omit<AgronomistLog, 'id'>) => {
        const tempId = `agronomistlog_${Date.now()}`;
        setAgronomistLogs(prev => [{ id: tempId, ...log }, ...prev]);
        
        try {
            const newLogRef = await addDoc(collection(db, 'agronomistLogs'), log);
            setAgronomistLogs(prev => prev.map(l => l.id === tempId ? { ...l, id: newLogRef.id } : l));
        } catch(error) {
            console.error("Failed to add agronomist log:", error);
            setAgronomistLogs(prev => prev.filter(l => l.id !== tempId));
            toast({ title: "Error", description: "No se pudo guardar el registro agronómico.", variant: "destructive"});
        }
    };

    const editAgronomistLog = async (updatedLog: AgronomistLog) => {
        const originalLogs = agronomistLogs;
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
        const originalLogs = agronomistLogs;
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
            const newLogRef = await addDoc(collection(db, 'phenologyLogs'), log);
            setPhenologyLogs(prev => prev.map(l => l.id === tempId ? { ...l, id: newLogRef.id } : l));
        } catch (error) {
            console.error("Failed to add phenology log:", error);
            setPhenologyLogs(prev => prev.filter(l => l.id !== tempId));
            toast({ title: "Error", description: "No se pudo guardar el registro de fenología.", variant: "destructive"});
        }
    };

    const editPhenologyLog = async (updatedLog: PhenologyLog) => {
        const originalLogs = phenologyLogs;
        setPhenologyLogs(prev => prev.map(l => l.id === updatedLog.id ? updatedLog : l));

        try {
            const logRef = doc(db, 'phenologyLogs', updatedLog.id);
            const { id, ...data } = updatedLog;
            await setDoc(logRef, data, { merge: true });
        } catch(error) {
            console.error("Failed to edit phenology log:", error);
            setPhenologyLogs(originalLogs);
            toast({ title: "Error", description: "No se pudo editar el registro de fenología.", variant: "destructive"});
        }
    };

    const deletePhenologyLog = async (logId: string) => {
        const originalLogs = phenologyLogs;
        setPhenologyLogs(prev => prev.filter(l => l.id !== logId));
        
        try {
            await deleteDoc(doc(db, 'phenologyLogs', logId));
        } catch (error) {
            console.error("Failed to delete phenology log:", error);
            setPhenologyLogs(originalLogs);
            toast({ title: "Error", description: "No se pudo eliminar el registro de fenología.", variant: "destructive"});
        }
    };

    const addBatch = async (batchData: Omit<Batch, 'status'> & {status: string}) => {
        const newBatch = { ...batchData, status: 'pending' as 'pending' | 'completed' };
        setBatches(prev => [newBatch, ...prev]);

        try {
            const newBatchRef = doc(db, 'batches', batchData.id);
            await setDoc(newBatchRef, newBatch);
        } catch (error) {
            console.error("Failed to add batch:", error);
            setBatches(prev => prev.filter(b => b.id !== batchData.id));
            toast({ title: "Error", description: "No se pudo agregar el lote.", variant: "destructive"});
        }
    };


    const deleteBatch = async (batchId: string) => {
        const originalBatches = batches;
        setBatches(prev => prev.filter(b => b.id !== batchId));
        
        try {
            await deleteDoc(doc(db, 'batches', batchId));
        } catch (error) {
            console.error("Failed to delete batch:", error);
            setBatches(originalBatches);
            toast({ title: "Error", description: "No se pudo eliminar el lote.", variant: "destructive"});
        }
    };

    const addCollectorPaymentLog = async (log: Omit<CollectorPaymentLog, 'id'>) => {
        const tempId = `paymentlog_${Date.now()}`;
        setCollectorPaymentLogs(prev => [{ id: tempId, ...log }, ...prev]);
        
        try {
            const newLogRef = await addDoc(collection(db, 'collectorPaymentLogs'), log);
            setCollectorPaymentLogs(prev => prev.map(l => l.id === tempId ? { ...l, id: newLogRef.id } : l));
        } catch (error) {
            console.error("Failed to add payment log:", error);
            setCollectorPaymentLogs(prev => prev.filter(l => l.id !== tempId));
            toast({ title: "Error", description: "No se pudo guardar el pago.", variant: "destructive"});
        }
    };

    const deleteCollectorPaymentLog = async (logId: string) => {
      const originalState = { collectors, harvests, collectorPaymentLogs };
      const logToDelete = collectorPaymentLogs.find(l => l.id === logId);
      if (!logToDelete) return;
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
      } catch (error) {
        console.error("Failed to delete payment log:", error);
        // Rollback
        setCollectors(originalState.collectors);
        setHarvests(originalState.harvests);
        setCollectorPaymentLogs(originalState.collectorPaymentLogs);
        toast({ title: "Error", description: "No se pudo eliminar el registro de pago.", variant: "destructive"});
      }
    };

    const updateEstablishmentData = async (data: Partial<EstablishmentData>) => {
        const originalData = establishmentData;
        setEstablishmentData(prev => prev ? { ...prev, ...data } : null);
        
        try {
            const { id, ...updateData } = data;
            const establishmentRef = doc(db, 'establishment', 'main');
            await setDoc(establishmentRef, updateData, { merge: true });
        } catch (error) {
            console.error("Failed to update establishment data:", error);
            setEstablishmentData(originalData);
            toast({ title: "Error", description: "No se pudieron actualizar los datos del establecimiento.", variant: "destructive"});
        }
    };

    const addProducerLog = async (log: Omit<ProducerLog, 'id'>) => {
        const tempId = `producerlog_${Date.now()}`;
        setProducerLogs(prev => [{ id: tempId, ...log }, ...prev]);
        
        try {
            const newLogRef = await addDoc(collection(db, 'producerLogs'), log);
            setProducerLogs(prev => prev.map(l => l.id === tempId ? { ...l, id: newLogRef.id } : l));
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
            const newTransRef = await addDoc(collection(db, 'transactions'), transaction);
            setTransactions(prev => prev.map(t => t.id === tempId ? { ...t, id: newTransRef.id } : t));
        } catch(error) {
            console.error("Failed to add transaction:", error);
            setTransactions(prev => prev.filter(t => t.id !== tempId));
            toast({ title: "Error", description: "No se pudo guardar la transacción.", variant: "destructive"});
        }
    };

    const deleteTransaction = async (transactionId: string) => {
        const originalTransactions = transactions;
        setTransactions(prev => prev.filter(t => t.id !== transactionId));
        
        try {
            await deleteDoc(doc(db, 'transactions', transactionId));
        } catch (error) {
            console.error("Failed to delete transaction:", error);
            setTransactions(originalTransactions);
            toast({ title: "Error", description: "No se pudo eliminar la transacción.", variant: "destructive"});
        }
    };

    const updateUserPassword = async (userId: string, newPassword: string) => {
        const originalUsers = users;
        const originalCurrentUser = currentUser;

        setUsers(prev => prev.map(u => u.id === userId ? { ...u, password: newPassword } : u));
        if (currentUser?.id === userId) {
            setCurrentUser(prev => prev ? { ...prev, password: newPassword } : null, true); // Assuming remember me
        }

        try {
            const userRef = doc(db, 'users', userId);
            await setDoc(userRef, { password: newPassword }, { merge: true });
        } catch (error) {
            console.error("Failed to update password:", error);
            setUsers(originalUsers);
            if (currentUser?.id === userId) {
                setCurrentUser(originalCurrentUser, true);
            }
            throw error;
        }
    };

    const value = {
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

