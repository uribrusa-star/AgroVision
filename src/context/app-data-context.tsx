

'use client';

import React, { ReactNode, useState, useCallback, useEffect } from 'react';
import type { AppData, User, Harvest, Collector, AgronomistLog, PhenologyLog, Batch, CollectorPaymentLog, EstablishmentData, ProducerLog, Transaction, Packer, PackagingLog, CulturalPracticeLog } from '@/lib/types';
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
  packers: [],
  packagingLogs: [],
  culturalPracticeLogs: [],
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
  addPacker: async () => { throw new Error('Not implemented') },
  deletePacker: async () => { throw new Error('Not implemented') },
  addPackagingLog: async () => { throw new Error('Not implemented') },
  deletePackagingLog: async () => { throw new Error('Not implemented') },
  addCulturalPracticeLog: async () => { throw new Error('Not implemented') },
  addBatch: async () => { throw new Error('Not implemented') },
  deleteBatch: async () => { throw new Error('Not implemented') },
  addCollectorPaymentLog: async () => { throw new Error('Not implemented') },
  deleteCollectorPaymentLog: async () => { throw new Error('Not implemented') },
  updateEstablishmentData: async () => { throw new Error('Not implemented') },
  addProducerLog: async () => { throw new Error('Not implemented') },
  deleteProducerLog: async () => { throw new Error('Not implemented') },
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
    const [packers, setPackers] = useState<Packer[]>([]);
    const [packagingLogs, setPackagingLogs] = useState<PackagingLog[]>([]);
    const [culturalPracticeLogs, setCulturalPracticeLogs] = useState<CulturalPracticeLog[]>([]);
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
          packersSnapshot,
          harvestsSnapshot,
          agronomistLogsSnapshot,
          phenologyLogsSnapshot,
          batchesSnapshot,
          collectorPaymentsSnapshot,
          packagingLogsSnapshot,
          culturalPracticeLogsSnapshot,
          producerLogsSnapshot,
          transactionsSnapshot,
        ] = await Promise.all([
          getDocs(collection(db, 'collectors')),
          getDocs(collection(db, 'packers')),
          getDocs(collection(db, 'harvests')),
          getDocs(collection(db, 'agronomistLogs')),
          getDocs(collection(db, 'phenologyLogs')),
          getDocs(collection(db, 'batches')),
          getDocs(collection(db, 'collectorPaymentLogs')),
          getDocs(collection(db, 'packagingLogs')),
          getDocs(collection(db, 'culturalPracticeLogs')),
          getDocs(collection(db, 'producerLogs')),
          getDocs(collection(db, 'transactions')),
        ]);
        
        setCollectors(collectorsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Collector[]);
        setPackers(packersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Packer[]);
        setHarvests(harvestsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Harvest[]);
        setAgronomistLogs(agronomistLogsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as AgronomistLog[]);
        setPhenologyLogs(phenologyLogsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as PhenologyLog[]);
        setBatches(batchesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Batch[]);
        setCollectorPaymentLogs(collectorPaymentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as CollectorPaymentLog[]);
        setPackagingLogs(packagingLogsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as PackagingLog[]);
        setCulturalPracticeLogs(culturalPracticeLogsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as CulturalPracticeLog[]);
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

        const collectorRef = doc(db, 'collectors', updatedCollector.id);
        const { id, ...collectorData } = updatedCollector;
        batch.set(collectorRef, collectorData, { merge: true });

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
        await fetchData(); // Refetch all data to ensure UI consistency
      } catch (error) {
        console.error("Failed to edit collector and related documents:", error);
        toast({ title: "Error", description: "No se pudo actualizar el nombre del recolector en todos los registros.", variant: "destructive"});
        // Refetch data even on error to revert UI to a consistent state
        await fetchData(); 
      }
    };

    const deleteCollector = (collectorId: string) => {
        const originalState = { collectors, harvests, collectorPaymentLogs };
        
        setCollectors(prev => prev.filter(c => c.id !== collectorId));
        setHarvests(prev => prev.filter(h => h.collector.id !== collectorId));
        setCollectorPaymentLogs(prev => prev.filter(p => p.collectorId !== collectorId));

        const runDelete = async () => {
            const batchOp = writeBatch(db);
            batchOp.delete(doc(db, 'collectors', collectorId));
            const harvestsQuery = query(collection(db, 'harvests'), where('collector.id', '==', collectorId));
            const paymentsQuery = query(collection(db, 'collectorPaymentLogs'), where('collectorId', '==', collectorId));
            const [harvestsSnapshot, paymentsSnapshot] = await Promise.all([getDocs(harvestsQuery), getDocs(paymentsQuery)]);
            harvestsSnapshot.forEach(doc => batchOp.delete(doc.ref));
            paymentsSnapshot.forEach(doc => batchOp.delete(doc.ref));
            await batchOp.commit();
        }

        runDelete().catch(error => {
            console.error("Failed to delete collector:", error);
            setCollectors(originalState.collectors);
            setHarvests(originalState.harvests);
            setCollectorPaymentLogs(originalState.collectorPaymentLogs);
            toast({ title: "Error", description: "No se pudo eliminar al recolector.", variant: "destructive"});
        });
    };

    const addCollector = (collector: Omit<Collector, 'id'>) => {
        const tempId = `collector_${Date.now()}`;
        setCollectors(prev => [...prev, { id: tempId, ...collector }]);
        
        addDoc(collection(db, 'collectors'), collector).then(ref => {
            setCollectors(prev => prev.map(c => c.id === tempId ? { ...c, id: ref.id } : c));
        }).catch(error => {
            console.error("Failed to add collector:", error);
            setCollectors(prev => prev.filter(c => c.id !== tempId));
            toast({ title: "Error", description: "No se pudo agregar al recolector.", variant: "destructive"});
        });
    };

    const addPacker = (packer: Omit<Packer, 'id'>) => {
        const tempId = `packer_${Date.now()}`;
        setPackers(prev => [...prev, { id: tempId, ...packer }]);
        
        addDoc(collection(db, 'packers'), packer).then(ref => {
            setPackers(prev => prev.map(p => p.id === tempId ? { ...p, id: ref.id } : p));
        }).catch(error => {
            console.error("Failed to add packer:", error);
            setPackers(prev => prev.filter(p => p.id !== tempId));
            toast({ title: "Error", description: "No se pudo agregar al embalador.", variant: "destructive"});
        });
    };

    const deletePacker = (packerId: string) => {
        const originalState = { packers, packagingLogs };
        
        setPackers(prev => prev.filter(p => p.id !== packerId));
        setPackagingLogs(prev => prev.filter(p => p.packerId !== packerId));

        const runDelete = async () => {
            const batchOp = writeBatch(db);
            batchOp.delete(doc(db, 'packers', packerId));
            const logsQuery = query(collection(db, 'packagingLogs'), where('packerId', '==', packerId));
            const logsSnapshot = await getDocs(logsQuery);
            logsSnapshot.forEach(doc => batchOp.delete(doc.ref));
            await batchOp.commit();
        }

        runDelete().catch(error => {
            console.error("Failed to delete packer:", error);
            setPackers(originalState.packers);
            setPackagingLogs(originalState.packagingLogs);
            toast({ title: "Error", description: "No se pudo eliminar al embalador.", variant: "destructive"});
        });
    };

    const addAgronomistLog = (log: Omit<AgronomistLog, 'id'>) => {
        const tempId = `agrolog_${Date.now()}`;
        setAgronomistLogs(prev => [{ id: tempId, ...log }, ...prev]);

        addDoc(collection(db, 'agronomistLogs'), log).then(ref => {
            setAgronomistLogs(prev => prev.map(l => l.id === tempId ? { ...l, id: ref.id } : l));
        }).catch(error => {
            console.error("Failed to add agronomist log:", error);
            setAgronomistLogs(prev => prev.filter(l => l.id !== tempId));
            toast({ title: "Error", description: "No se pudo guardar el registro.", variant: "destructive"});
        });
    };

    const editAgronomistLog = (updatedLog: AgronomistLog) => {
        const originalLogs = agronomistLogs;
        setAgronomistLogs(prev => prev.map(l => l.id === updatedLog.id ? updatedLog : l));

        const logRef = doc(db, 'agronomistLogs', updatedLog.id);
        const { id, ...data } = updatedLog;
        setDoc(logRef, data, { merge: true }).catch(error => {
            console.error("Failed to edit agronomist log:", error);
            setAgronomistLogs(originalLogs);
            toast({ title: "Error", description: "No se pudo editar el registro.", variant: "destructive"});
        });
    };

    const deleteAgronomistLog = (logId: string) => {
        const originalLogs = agronomistLogs;
        setAgronomistLogs(prev => prev.filter(l => l.id !== logId));

        deleteDoc(doc(db, 'agronomistLogs', logId)).catch(error => {
            console.error("Failed to delete agronomist log:", error);
            setAgronomistLogs(originalLogs);
            toast({ title: "Error", description: "No se pudo eliminar el registro.", variant: "destructive"});
        });
    };

    const addPhenologyLog = (log: Omit<PhenologyLog, 'id'>) => {
        const tempId = `phenologylog_${Date.now()}`;
        setPhenologyLogs(prev => [{ id: tempId, ...log }, ...prev]);

        addDoc(collection(db, 'phenologyLogs'), log).then(ref => {
            setPhenologyLogs(prev => prev.map(l => l.id === tempId ? { ...l, id: ref.id } : l));
        }).catch(error => {
            console.error("Failed to add phenology log:", error);
            setPhenologyLogs(prev => prev.filter(l => l.id !== tempId));
            toast({ title: "Error", description: "No se pudo guardar el registro de fenología.", variant: "destructive"});
        });
    };

    const editPhenologyLog = (updatedLog: PhenologyLog) => {
        const originalLogs = phenologyLogs;
        setPhenologyLogs(prev => prev.map(l => l.id === updatedLog.id ? updatedLog : l));

        const logRef = doc(db, 'phenologyLogs', updatedLog.id);
        const { id, ...data } = updatedLog;
        setDoc(logRef, data, { merge: true }).catch(error => {
            console.error("Failed to edit phenology log:", error);
            setPhenologyLogs(originalLogs);
            toast({ title: "Error", description: "No se pudo editar el registro.", variant: "destructive"});
        });
    };

    const deletePhenologyLog = (logId: string) => {
        return new Promise<void>((resolve, reject) => {
            const originalLogs = phenologyLogs;
            setPhenologyLogs(prev => prev.filter(l => l.id !== logId));
            
            deleteDoc(doc(db, 'phenologyLogs', logId))
            .then(resolve)
            .catch(error => {
                console.error("Failed to delete phenology log:", error);
                setPhenologyLogs(originalLogs);
                toast({ title: "Error", description: "No se pudo eliminar el registro.", variant: "destructive"});
                reject(error);
            });
        });
    };

    const addBatch = (batchData: Omit<Batch, 'id' | 'status' | 'preloadedDate'> & { id: string; preloadedDate: string; status: string }) => {
        const newBatch = { ...batchData, status: 'pending' as 'pending' | 'completed' };
        setBatches(prev => [newBatch, ...prev]);

        const batchRef = doc(db, 'batches', batchData.id);
        setDoc(batchRef, newBatch).catch(error => {
            console.error("Failed to add batch:", error);
            setBatches(prev => prev.filter(b => b.id !== batchData.id));
            toast({ title: "Error", description: "No se pudo agregar el lote.", variant: "destructive"});
        });
    };

    const deleteBatch = (batchId: string) => {
        const originalBatches = batches;
        setBatches(prev => prev.filter(b => b.id !== batchId));
        
        deleteDoc(doc(db, 'batches', batchId)).catch(error => {
            console.error("Failed to delete batch:", error);
            setBatches(originalBatches);
            toast({ title: "Error", description: "No se pudo eliminar el lote.", variant: "destructive"});
        });
    };

    const addCollectorPaymentLog = (log: Omit<CollectorPaymentLog, 'id'>) => {
        const tempId = `paymentlog_${Date.now()}`;
        setCollectorPaymentLogs(prev => [{ id: tempId, ...log }, ...prev]);
        
        addDoc(collection(db, 'collectorPaymentLogs'), log).then(ref => {
            setCollectorPaymentLogs(prev => prev.map(l => l.id === tempId ? { ...l, id: ref.id } : l));
        }).catch(error => {
            console.error("Failed to add payment log:", error);
            setCollectorPaymentLogs(prev => prev.filter(l => l.id !== tempId));
            toast({ title: "Error", description: "No se pudo guardar el pago.", variant: "destructive"});
        });
    };

    const deleteCollectorPaymentLog = (logId: string) => {
        return new Promise<void>((resolve, reject) => {
            const originalState = { collectors, harvests, collectorPaymentLogs };
            const logToDelete = collectorPaymentLogs.find(l => l.id === logId);
            if (!logToDelete) {
                return reject("Log not found");
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
        
            const runDelete = async () => {
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
                resolve();
            }

            runDelete().catch(error => {
                console.error("Failed to delete payment log:", error);
                setCollectors(originalState.collectors);
                setHarvests(originalState.harvests);
                setCollectorPaymentLogs(originalState.collectorPaymentLogs);
                toast({ title: "Error", description: "No se pudo eliminar el registro de pago.", variant: "destructive"});
                reject(error);
            });
        });
    };

    const addPackagingLog = (log: Omit<PackagingLog, 'id'>) => {
        const tempId = `packlog_${Date.now()}`;
        setPackagingLogs(prev => [{ id: tempId, ...log }, ...prev]);
        
        addDoc(collection(db, 'packagingLogs'), log).then(ref => {
            setPackagingLogs(prev => prev.map(l => l.id === tempId ? { ...l, id: ref.id } : l));
            // Trigger a full refetch to update packer stats
            fetchData();
        }).catch(error => {
            console.error("Failed to add packaging log:", error);
            setPackagingLogs(prev => prev.filter(l => l.id !== tempId));
            toast({ title: "Error", description: "No se pudo guardar el registro de embalaje.", variant: "destructive"});
        });
    };

    const deletePackagingLog = (logId: string) => {
        return new Promise<void>((resolve, reject) => {
            const originalState = { packers, packagingLogs };
            const logToDelete = packagingLogs.find(l => l.id === logId);
            if (!logToDelete) {
                return reject("Log not found");
            }
            
            setPackagingLogs(prev => prev.filter(l => l.id !== logId));

            const runDelete = async () => {
                await deleteDoc(doc(db, 'packagingLogs', logId));
                // After deleting, refetch all data to recalculate stats correctly
                await fetchData();
                resolve();
            }

            runDelete().catch(error => {
                console.error("Failed to delete packaging log:", error);
                setPackers(originalState.packers);
                setPackagingLogs(originalState.packagingLogs);
                toast({ title: "Error", description: "No se pudo eliminar el registro de embalaje.", variant: "destructive"});
                reject(error);
            });
        });
    };

    const addCulturalPracticeLog = (log: Omit<CulturalPracticeLog, 'id'>) => {
        const tempId = `culturallog_${Date.now()}`;
        setCulturalPracticeLogs(prev => [{ id: tempId, ...log }, ...prev]);
        
        addDoc(collection(db, 'culturalPracticeLogs'), log).then(ref => {
            setCulturalPracticeLogs(prev => prev.map(l => l.id === tempId ? { ...l, id: ref.id } : l));
        }).catch(error => {
            console.error("Failed to add cultural practice log:", error);
            setCulturalPracticeLogs(prev => prev.filter(l => l.id !== tempId));
            toast({ title: "Error", description: "No se pudo guardar el registro de la labor.", variant: "destructive"});
        });
    };


    const updateEstablishmentData = (data: Partial<EstablishmentData>) => {
        return new Promise<void>((resolve, reject) => {
            const originalData = establishmentData;
            setEstablishmentData(prev => prev ? { ...prev, ...data } : null);
            
            const { id, ...updateData } = data;
            const establishmentRef = doc(db, 'establishment', 'main');
            setDoc(establishmentRef, updateData, { merge: true })
            .then(resolve)
            .catch(error => {
                console.error("Failed to update establishment data:", error);
                setEstablishmentData(originalData);
                toast({ title: "Error", description: "No se pudieron actualizar los datos.", variant: "destructive"});
                reject(error);
            });
        });
    };

    const addProducerLog = (log: Omit<ProducerLog, 'id'>) => {
        const tempId = `producerlog_${Date.now()}`;
        setProducerLogs(prev => [{ id: tempId, ...log }, ...prev]);
        
        addDoc(collection(db, 'producerLogs'), log).then(ref => {
            setProducerLogs(prev => prev.map(l => l.id === tempId ? { ...l, id: ref.id } : l));
        }).catch(error => {
            console.error("Failed to add producer log:", error);
            setProducerLogs(prev => prev.filter(l => l.id !== tempId));
            toast({ title: "Error", description: "No se pudo guardar la nota.", variant: "destructive"});
        });
    };

    const deleteProducerLog = (logId: string) => {
        const originalLogs = producerLogs;
        setProducerLogs(prev => prev.filter(l => l.id !== logId));

        deleteDoc(doc(db, 'producerLogs', logId)).catch(error => {
            console.error("Failed to delete producer log:", error);
            setProducerLogs(originalLogs);
            toast({ title: "Error", description: "No se pudo eliminar la nota.", variant: "destructive"});
        });
    };

    const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
        const tempId = `transaction_${Date.now()}`;
        setTransactions(prev => [{ id: tempId, ...transaction }, ...prev]);
        
        addDoc(collection(db, 'transactions'), transaction).then(ref => {
            setTransactions(prev => prev.map(t => t.id === tempId ? { ...t, id: ref.id } : t));
        }).catch(error => {
            console.error("Failed to add transaction:", error);
            setTransactions(prev => prev.filter(t => t.id !== tempId));
            toast({ title: "Error", description: "No se pudo guardar la transacción.", variant: "destructive"});
        });
    };

    const deleteTransaction = (transactionId: string) => {
        return new Promise<void>((resolve, reject) => {
            const originalTransactions = transactions;
            setTransactions(prev => prev.filter(t => t.id !== transactionId));
            
            deleteDoc(doc(db, 'transactions', transactionId))
            .then(resolve)
            .catch(error => {
                console.error("Failed to delete transaction:", error);
                setTransactions(originalTransactions);
                toast({ title: "Error", description: "No se pudo eliminar la transacción.", variant: "destructive"});
                reject(error);
            });
        });
    };

    const updateUserPassword = async (userId: string, newPassword: string) => {
        const userRef = doc(db, 'users', userId);
        await setDoc(userRef, { password: newPassword }, { merge: true });
        
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, password: newPassword } : u));
        if (currentUser?.id === userId) {
            setCurrentUser(prev => prev ? { ...prev, password: newPassword } : null, true); // Assuming remember me
        }
    };

    const value = {
        loading,
        currentUser,
        users,
        setCurrentUser,
        harvests,
        collectors,
        packers,
        packagingLogs,
        culturalPracticeLogs,
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
        addPacker,
        deletePacker,
        addPackagingLog,
        deletePackagingLog,
        addCulturalPracticeLog,
        addBatch,
        deleteBatch,
        addCollectorPaymentLog,
        deleteCollectorPaymentLog,
        updateEstablishmentData,
        addProducerLog,
        deleteProducerLog,
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

    
