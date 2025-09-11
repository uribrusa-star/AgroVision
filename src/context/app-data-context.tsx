
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
  users: availableUsers,
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
  isClient: false,
});


const usePersistentState = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key “${key}”:`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      if (state === null) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, JSON.stringify(state));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key “${key}”:`, error);
    }
  }, [key, state]);

  return [state, setState];
};

export const AppContextProvider = ({ children }: { children: ReactNode }) => {
    const { toast } = useToast();
    const [currentUser, setCurrentUser] = usePersistentState<User | null>('currentUser', null);
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
        const collectorRef = doc(db, 'collectors', harvest.collector.id);
        
        const collectorDoc = collectors.find(c => c.id === harvest.collector.id);
        if (!collectorDoc) {
          console.error("Collector not found in state");
          return '';
        }

        const newTotalHarvested = collectorDoc.totalHarvested + harvest.kilograms;
        const newHoursWorked = collectorDoc.hoursWorked + hoursWorked;
        
        const batch = writeBatch(db);
        batch.update(collectorRef, {
            totalHarvested: newTotalHarvested,
            hoursWorked: newHoursWorked,
            productivity: newHoursWorked > 0 ? newTotalHarvested / newHoursWorked : 0,
        });

        await batch.commit();
        await fetchData();
        return newHarvestRef.id;
    };

    const editCollector = async (updatedCollector: Collector) => {
        const collectorRef = doc(db, 'collectors', updatedCollector.id);
        const { id, ...data } = updatedCollector;
        await setDoc(collectorRef, data, { merge: true });
        await fetchData();
    };

    const deleteCollector = async (collectorId: string) => {
        const batch = writeBatch(db);

        const collectorRef = doc(db, 'collectors', collectorId);
        batch.delete(collectorRef);

        const harvestsToDeleteQuery = query(collection(db, 'harvests'), where('collector.id', '==', collectorId));
        const harvestsToDeleteSnapshot = await getDocs(harvestsToDeleteQuery);
        harvestsToDeleteSnapshot.forEach(doc => batch.delete(doc.ref));

        const paymentsToDeleteQuery = query(collection(db, 'collectorPaymentLogs'), where('collectorId', '==', collectorId));
        const paymentsToDeleteSnapshot = await getDocs(paymentsToDeleteQuery);
        paymentsToDeleteSnapshot.forEach(doc => batch.delete(doc.ref));

        await batch.commit();
        await fetchData();
    };

    const addCollector = async (collector: Omit<Collector, 'id'>) => {
        await addDoc(collection(db, 'collectors'), collector);
        await fetchData();
    };

    const addAgronomistLog = async (log: Omit<AgronomistLog, 'id'>) => {
        await addDoc(collection(db, 'agronomistLogs'), log);
        await fetchData();
    };

    const editAgronomistLog = async (updatedLog: AgronomistLog) => {
        const logRef = doc(db, 'agronomistLogs', updatedLog.id);
        const { id, ...data } = updatedLog;
        await setDoc(logRef, data, { merge: true });
        await fetchData();
    };

    const deleteAgronomistLog = async (logId: string) => {
        await deleteDoc(doc(db, 'agronomistLogs', logId));
        await fetchData();
    };

    const addPhenologyLog = async (log: Omit<PhenologyLog, 'id'>) => {
        await addDoc(collection(db, 'phenologyLogs'), log);
        await fetchData();
    };

    const editPhenologyLog = async (updatedLog: PhenologyLog) => {
        const logRef = doc(db, 'phenologyLogs', updatedLog.id);
        const { id, ...data } = updatedLog;
        await setDoc(logRef, data, { merge: true });
        await fetchData();
    };

    const deletePhenologyLog = async (logId: string) => {
        await deleteDoc(doc(db, 'phenologyLogs', logId));
        await fetchData();
    };

    const addBatch = async (batchData: Omit<Batch, 'id'>) => {
        const newBatchRef = doc(db, 'batches', batchData.id);
        await setDoc(newBatchRef, batchData);
        await fetchData();
    };


    const deleteBatch = async (batchId: string) => {
        await deleteDoc(doc(db, 'batches', batchId));
        await fetchData();
    };

    const addCollectorPaymentLog = async (log: Omit<CollectorPaymentLog, 'id'>) => {
        await addDoc(collection(db, 'collectorPaymentLogs'), log);
        await fetchData();
    };

    const deleteCollectorPaymentLog = async (logId: string) => {
      const logToDelete = collectorPaymentLogs.find(l => l.id === logId);
      if (!logToDelete) return;
  
      const batch = writeBatch(db);
      
      const paymentLogRef = doc(db, 'collectorPaymentLogs', logId);
      batch.delete(paymentLogRef);
      
      // We assume harvestId will always exist and be valid
      const harvestRef = doc(db, 'harvests', logToDelete.harvestId);
      batch.delete(harvestRef);
      
      await batch.commit();
      await fetchData();
    };

    const updateEstablishmentData = async (data: Partial<EstablishmentData>) => {
        const { id, ...updateData } = data;
        const establishmentRef = doc(db, 'establishment', 'main');
        await setDoc(establishmentRef, updateData, { merge: true });
        await fetchData();
    };

    const addProducerLog = async (log: Omit<ProducerLog, 'id'>) => {
        await addDoc(collection(db, 'producerLogs'), log);
        await fetchData();
    };

    const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
        await addDoc(collection(db, 'transactions'), transaction);
        await fetchData();
    };

    const deleteTransaction = async (transactionId: string) => {
        await deleteDoc(doc(db, 'transactions', transactionId));
        await fetchData();
    };

    const value = {
        loading,
        currentUser,
        users: availableUsers,
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
        isClient
    };

    return (
        <AppDataContext.Provider value={value}>
            {children}
        </AppDataContext.Provider>
    );
};

    