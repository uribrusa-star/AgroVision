

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

        try {
            const batch = writeBatch(db);
            
            const newHarvestRef = doc(collection(db, 'harvests'));
            batch.set(newHarvestRef, harvest);

            const collectorRef = doc(db, 'collectors', harvest.collector.id);
            const newTotalHarvested = collectorDoc.totalHarvested + harvest.kilograms;
            const newHoursWorked = collectorDoc.hoursWorked + hoursWorked;
            const updatedCollectorData = {
                totalHarvested: newTotalHarvested,
                hoursWorked: newHoursWorked,
                productivity: newHoursWorked > 0 ? newTotalHarvested / newHoursWorked : 0,
            };
            batch.update(collectorRef, updatedCollectorData);
            
            await batch.commit();
            await fetchData(); // Refetch to ensure UI is consistent
            return newHarvestRef.id;

        } catch(error) {
            console.error("Failed to add harvest:", error);
            toast({ title: "Error", description: "No se pudo guardar la cosecha.", variant: "destructive"});
            return undefined;
        }
    };

    const editCollector = async (updatedCollector: Collector) => {
      try {
        const batch = writeBatch(db);

        // Update the main collector document
        const collectorRef = doc(db, 'collectors', updatedCollector.id);
        const { id, ...collectorData } = updatedCollector;
        batch.update(collectorRef, collectorData);

        // Find and update all harvests associated with this collector
        const harvestsQuery = query(collection(db, 'harvests'), where('collector.id', '==', updatedCollector.id));
        const harvestsSnapshot = await getDocs(harvestsQuery);
        harvestsSnapshot.forEach(harvestDoc => {
            batch.update(harvestDoc.ref, { 'collector.name': updatedCollector.name });
        });

        // Find and update all payment logs associated with this collector
        const paymentsQuery = query(collection(db, 'collectorPaymentLogs'), where('collectorId', '==', updatedCollector.id));
        const paymentsSnapshot = await getDocs(paymentsQuery);
        paymentsSnapshot.forEach(paymentDoc => {
            batch.update(paymentDoc.ref, { collectorName: updatedCollector.name });
        });
        
        await batch.commit();
        await fetchData(); // Refetch all data to ensure UI consistency
      } catch (error) {
        console.error("Failed to edit collector and related documents:", error);
        toast({ title: "Error", description: "No se pudo actualizar el nombre del recolector en todos los registros.", variant: "destructive"});
        await fetchData(); 
      }
    };

    const deleteCollector = async (collectorId: string) => {
        try {
            const batchOp = writeBatch(db);
            
            // Delete the collector itself
            batchOp.delete(doc(db, 'collectors', collectorId));

            // Find and delete all harvests by this collector
            const harvestsQuery = query(collection(db, 'harvests'), where('collector.id', '==', collectorId));
            const harvestsSnapshot = await getDocs(harvestsQuery);
            harvestsSnapshot.forEach(doc => batchOp.delete(doc.ref));

            // Find and delete all payment logs for this collector
            const paymentsQuery = query(collection(db, 'collectorPaymentLogs'), where('collectorId', '==', collectorId));
            const paymentsSnapshot = await getDocs(paymentsQuery);
            paymentsSnapshot.forEach(doc => batchOp.delete(doc.ref));
            
            await batchOp.commit();
            await fetchData();
        } catch (error) {
            console.error("Failed to delete collector and associated data:", error);
            toast({ title: "Error", description: "No se pudo eliminar al recolector y sus datos.", variant: "destructive"});
            await fetchData();
        }
    };

    const addCollector = async (collector: Omit<Collector, 'id'>) => {
        try {
            await addDoc(collection(db, 'collectors'), collector);
            await fetchData();
        } catch (error) {
            console.error("Failed to add collector:", error);
            toast({ title: "Error", description: "No se pudo agregar al recolector.", variant: "destructive"});
        }
    };

    const addAgronomistLog = async (log: Omit<AgronomistLog, 'id'>) => {
        try {
            await addDoc(collection(db, 'agronomistLogs'), log);
            await fetchData();
        } catch (error) {
            console.error("Failed to add agronomist log:", error);
            toast({ title: "Error", description: "No se pudo guardar el registro.", variant: "destructive"});
        }
    };

    const editAgronomistLog = async (updatedLog: AgronomistLog) => {
        try {
            const logRef = doc(db, 'agronomistLogs', updatedLog.id);
            const { id, ...data } = updatedLog;
            await setDoc(logRef, data, { merge: true });
            await fetchData();
        } catch (error) {
             console.error("Failed to edit agronomist log:", error);
            toast({ title: "Error", description: "No se pudo editar el registro.", variant: "destructive"});
        }
    };

    const deleteAgronomistLog = async (logId: string) => {
        try {
            await deleteDoc(doc(db, 'agronomistLogs', logId));
            await fetchData();
        } catch (error) {
            console.error("Failed to delete agronomist log:", error);
            toast({ title: "Error", description: "No se pudo eliminar el registro.", variant: "destructive"});
        }
    };

    const addPhenologyLog = async (log: Omit<PhenologyLog, 'id'>) => {
        try {
            await addDoc(collection(db, 'phenologyLogs'), log);
            await fetchData();
        } catch (error) {
            console.error("Failed to add phenology log:", error);
            toast({ title: "Error", description: "No se pudo guardar el registro de fenología.", variant: "destructive"});
        }
    };

    const editPhenologyLog = async (updatedLog: PhenologyLog) => {
        try {
            const logRef = doc(db, 'phenologyLogs', updatedLog.id);
            const { id, ...data } = updatedLog;
            await setDoc(logRef, data, { merge: true });
            await fetchData();
        } catch (error) {
            console.error("Failed to edit phenology log:", error);
            toast({ title: "Error", description: "No se pudo editar el registro.", variant: "destructive"});
        }
    };

    const deletePhenologyLog = async (logId: string) => {
        try {
            await deleteDoc(doc(db, 'phenologyLogs', logId));
            await fetchData();
        } catch (error) {
            console.error("Failed to delete phenology log:", error);
            toast({ title: "Error", description: "No se pudo eliminar el registro.", variant: "destructive"});
        }
    };

    const addBatch = async (batchData: Omit<Batch, 'id' | 'status' | 'preloadedDate'> & { id: string; preloadedDate: string; status: string }) => {
        try {
            const newBatch = { ...batchData, status: 'pending' as 'pending' | 'completed' };
            const batchRef = doc(db, 'batches', batchData.id);
            await setDoc(batchRef, newBatch);
            await fetchData();
        } catch(error) {
            console.error("Failed to add batch:", error);
            toast({ title: "Error", description: "No se pudo agregar el lote.", variant: "destructive"});
        }
    };

    const deleteBatch = async (batchId: string) => {
        try {
            await deleteDoc(doc(db, 'batches', batchId));
            await fetchData();
        } catch (error) {
            console.error("Failed to delete batch:", error);
            toast({ title: "Error", description: "No se pudo eliminar el lote.", variant: "destructive"});
        }
    };

    const addCollectorPaymentLog = async (log: Omit<CollectorPaymentLog, 'id'>) => {
        try {
            await addDoc(collection(db, 'collectorPaymentLogs'), log);
            await fetchData();
        } catch (error) {
            console.error("Failed to add payment log:", error);
            toast({ title: "Error", description: "No se pudo guardar el pago.", variant: "destructive"});
        }
    };

    const deleteCollectorPaymentLog = async (logId: string) => {
        const logToDelete = collectorPaymentLogs.find(l => l.id === logId);
        if (!logToDelete) return;

        const collectorDoc = collectors.find(c => c.id === logToDelete.collectorId);
        if (!collectorDoc) {
             toast({ title: "Error", description: "Recolector original no encontrado.", variant: "destructive"});
             return;
        }

        try {
            const batchOp = writeBatch(db);
            
            // Delete payment and harvest
            batchOp.delete(doc(db, 'collectorPaymentLogs', logId));
            batchOp.delete(doc(db, 'harvests', logToDelete.harvestId));
            
            // Revert collector stats
            const collectorRef = doc(db, 'collectors', logToDelete.collectorId);
            const newTotalHarvested = collectorDoc.totalHarvested - logToDelete.kilograms;
            const newHoursWorked = collectorDoc.hoursWorked - logToDelete.hours;
            batchOp.update(collectorRef, {
                totalHarvested: newTotalHarvested,
                hoursWorked: newHoursWorked,
                productivity: newHoursWorked > 0 ? newTotalHarvested / newHoursWorked : 0,
            });

            await batchOp.commit();
            await fetchData();
        } catch (error) {
            console.error("Failed to delete payment log:", error);
            toast({ title: "Error", description: "No se pudo eliminar el registro de pago.", variant: "destructive"});
            await fetchData();
        }
    };

    const updateEstablishmentData = async (data: Partial<EstablishmentData>) => {
        try {
            const { id, ...updateData } = data;
            const establishmentRef = doc(db, 'establishment', 'main');
            await setDoc(establishmentRef, updateData, { merge: true });
            await fetchData();
        } catch (error) {
            console.error("Failed to update establishment data:", error);
            toast({ title: "Error", description: "No se pudieron actualizar los datos.", variant: "destructive"});
        }
    };

    const addProducerLog = async (log: Omit<ProducerLog, 'id'>) => {
        try {
            await addDoc(collection(db, 'producerLogs'), log);
            await fetchData();
        } catch (error) {
            console.error("Failed to add producer log:", error);
            toast({ title: "Error", description: "No se pudo guardar la nota.", variant: "destructive"});
        }
    };

    const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
        try {
            await addDoc(collection(db, 'transactions'), transaction);
            await fetchData();
        } catch (error) {
            console.error("Failed to add transaction:", error);
            toast({ title: "Error", description: "No se pudo guardar la transacción.", variant: "destructive"});
        }
    };

    const deleteTransaction = async (transactionId: string) => {
        try {
            await deleteDoc(doc(db, 'transactions', transactionId));
            await fetchData();
        } catch (error) {
            console.error("Failed to delete transaction:", error);
            toast({ title: "Error", description: "No se pudo eliminar la transacción.", variant: "destructive"});
        }
    };

    const updateUserPassword = async (userId: string, newPassword: string) => {
        try {
            const userRef = doc(db, 'users', userId);
            await setDoc(userRef, { password: newPassword }, { merge: true });
            await fetchData();
        } catch (error) {
            console.error("Failed to update password:", error);
            toast({ title: "Error", description: "No se pudo actualizar la contraseña.", variant: "destructive"});
            throw error; // Re-throw to be caught in the component
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

    

    