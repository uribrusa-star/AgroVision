

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
        const newHarvestRef = await addDoc(collection(db, 'harvests'), harvest);
        const newHarvest = { id: newHarvestRef.id, ...harvest };
        
        const collectorRef = doc(db, 'collectors', harvest.collector.id);
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
        
        await setDoc(collectorRef, updatedCollectorData, { merge: true });

        setHarvests(prev => [newHarvest, ...prev]);
        setCollectors(prev => prev.map(c => c.id === harvest.collector.id ? { ...c, ...updatedCollectorData } : c));
        
        return newHarvestRef.id;
    };

    const editCollector = async (updatedCollector: Collector) => {
        const collectorRef = doc(db, 'collectors', updatedCollector.id);
        const { id, ...data } = updatedCollector;
        await setDoc(collectorRef, data, { merge: true });
        setCollectors(prev => prev.map(c => c.id === id ? updatedCollector : c));
    };

    const deleteCollector = async (collectorId: string) => {
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
        
        setCollectors(prev => prev.filter(c => c.id !== collectorId));
        setHarvests(prev => prev.filter(h => h.collector.id !== collectorId));
        setCollectorPaymentLogs(prev => prev.filter(p => p.collectorId !== collectorId));
    };

    const addCollector = async (collector: Omit<Collector, 'id'>) => {
        const newCollectorRef = await addDoc(collection(db, 'collectors'), collector);
        setCollectors(prev => [...prev, { id: newCollectorRef.id, ...collector }]);
    };

    const addAgronomistLog = async (log: Omit<AgronomistLog, 'id'>) => {
        const newLogRef = await addDoc(collection(db, 'agronomistLogs'), log);
        setAgronomistLogs(prev => [...prev, { id: newLogRef.id, ...log }]);
    };

    const editAgronomistLog = async (updatedLog: AgronomistLog) => {
        const logRef = doc(db, 'agronomistLogs', updatedLog.id);
        const { id, ...data } = updatedLog;
        await setDoc(logRef, data, { merge: true });
        setAgronomistLogs(prev => prev.map(l => l.id === id ? updatedLog : l));
    };

    const deleteAgronomistLog = async (logId: string) => {
        await deleteDoc(doc(db, 'agronomistLogs', logId));
        setAgronomistLogs(prev => prev.filter(l => l.id !== logId));
    };

    const addPhenologyLog = async (log: Omit<PhenologyLog, 'id'>) => {
        const newLogRef = await addDoc(collection(db, 'phenologyLogs'), log);
        setPhenologyLogs(prev => [...prev, { id: newLogRef.id, ...log }]);
    };

    const editPhenologyLog = async (updatedLog: PhenologyLog) => {
        const logRef = doc(db, 'phenologyLogs', updatedLog.id);
        const { id, ...data } = updatedLog;
        await setDoc(logRef, data, { merge: true });
        setPhenologyLogs(prev => prev.map(l => l.id === id ? updatedLog : l));
    };

    const deletePhenologyLog = async (logId: string) => {
        await deleteDoc(doc(db, 'phenologyLogs', logId));
        setPhenologyLogs(prev => prev.filter(l => l.id !== logId));
    };

    const addBatch = async (batchData: Omit<Batch, 'status'> & {status: string}) => {
        const newBatchRef = doc(db, 'batches', batchData.id);
        const newBatch = { ...batchData, status: 'pending' as 'pending' | 'completed' };
        await setDoc(newBatchRef, newBatch);
        setBatches(prev => [...prev, newBatch]);
    };


    const deleteBatch = async (batchId: string) => {
        await deleteDoc(doc(db, 'batches', batchId));
        setBatches(prev => prev.filter(b => b.id !== batchId));
    };

    const addCollectorPaymentLog = async (log: Omit<CollectorPaymentLog, 'id'>) => {
        const newLogRef = await addDoc(collection(db, 'collectorPaymentLogs'), log);
        setCollectorPaymentLogs(prev => [...prev, { id: newLogRef.id, ...log }]);
    };

    const deleteCollectorPaymentLog = async (logId: string) => {
      const logToDelete = collectorPaymentLogs.find(l => l.id === logId);
      if (!logToDelete) return;
  
      const batchOp = writeBatch(db);
      
      const paymentLogRef = doc(db, 'collectorPaymentLogs', logId);
      batchOp.delete(paymentLogRef);
      
      const harvestRef = doc(db, 'harvests', logToDelete.harvestId);
      batchOp.delete(harvestRef);

      const collectorRef = doc(db, 'collectors', logToDelete.collectorId);
      const collectorDoc = collectors.find(c => c.id === logToDelete.collectorId);

      if (collectorDoc) {
        const newTotalHarvested = collectorDoc.totalHarvested - logToDelete.kilograms;
        const newHoursWorked = collectorDoc.hoursWorked - logToDelete.hours;
        batchOp.update(collectorRef, {
            totalHarvested: newTotalHarvested,
            hoursWorked: newHoursWorked,
            productivity: newHoursWorked > 0 ? newTotalHarvested / newHoursWorked : 0,
        });
      }
      
      await batchOp.commit();
      await fetchData(); // Refetch to ensure all state is consistent
    };

    const updateEstablishmentData = async (data: Partial<EstablishmentData>) => {
        const { id, ...updateData } = data;
        const establishmentRef = doc(db, 'establishment', 'main');
        await setDoc(establishmentRef, updateData, { merge: true });
        setEstablishmentData(prev => prev ? { ...prev, ...updateData } : null);
    };

    const addProducerLog = async (log: Omit<ProducerLog, 'id'>) => {
        const newLogRef = await addDoc(collection(db, 'producerLogs'), log);
        setProducerLogs(prev => [...prev, { id: newLogRef.id, ...log }]);
    };

    const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
        const newTransRef = await addDoc(collection(db, 'transactions'), transaction);
        setTransactions(prev => [...prev, { id: newTransRef.id, ...transaction }]);
    };

    const deleteTransaction = async (transactionId: string) => {
        await deleteDoc(doc(db, 'transactions', transactionId));
        setTransactions(prev => prev.filter(t => t.id !== transactionId));
    };

    const updateUserPassword = async (userId: string, newPassword: string) => {
        const userRef = doc(db, 'users', userId);
        await setDoc(userRef, { password: newPassword }, { merge: true });
        // Update local state to reflect change immediately
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, password: newPassword } : u));
        if (currentUser?.id === userId) {
            setCurrentUser(prev => prev ? { ...prev, password: newPassword } : null);
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
