/**
 * Firebase Sync Service
 * Handles real-time synchronization with Firestore for all stores
 */
import { db } from '../lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  onSnapshot, 
  query, 
  where,
  orderBy,
  limit,
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { toast } from 'react-hot-toast';

// Generic type for Firestore sync
interface FirestoreDoc {
  id: string;
  createdAt?: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

type Unsubscribe = () => void;

interface SyncConfig<T> {
  collectionName: string;
  idField?: keyof T;
  orderByField?: string;
  orderDirection?: 'asc' | 'desc';
}

/**
 * Subscribe to a collection with real-time updates
 */
export function subscribeToCollection<T extends FirestoreDoc>(
  config: SyncConfig<T>,
  onUpdate: (docs: T[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const collectionRef = collection(db, config.collectionName);
  let q = query(collectionRef);
  
  if (config.orderByField) {
    q = query(
      collectionRef, 
      orderBy(config.orderByField, config.orderDirection || 'desc'),
      limit(1000)
    );
  }

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const docs: T[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as T;
        docs.push({
          ...data,
          id: config.idField ? String(data[config.idField]) : docSnap.id,
        } as T);
      });
      onUpdate(docs);
    },
    (error) => {
      console.error(`Error subscribing to ${config.collectionName}:`, error);
      onError?.(error);
    }
  );

  return unsubscribe;
}

/**
 * Subscribe to a single document
 */
export function subscribeToDocument<T extends FirestoreDoc>(
  collectionName: string,
  documentId: string,
  onUpdate: (doc: T | null) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const docRef = doc(db, collectionName, documentId);

  const unsubscribe = onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        onUpdate({ id: docSnap.id, ...docSnap.data() } as T);
      } else {
        onUpdate(null);
      }
    },
    (error) => {
      console.error(`Error subscribing to ${collectionName}/${documentId}:`, error);
      onError?.(error);
    }
  );

  return unsubscribe;
}

/**
 * Create or update a document
 */
export async function saveDocument<T extends FirestoreDoc>(
  collectionName: string,
  data: T,
  id?: string
): Promise<string> {
  const docId = id || data.id;
  
  if (!docId) {
    // Add new document
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } else {
    // Update existing document
    const docRef = doc(db, collectionName, docId);
    await setDoc(
      docRef,
      {
        ...data,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return docId;
  }
}

/**
 * Update specific fields of a document
 */
export async function updateDocumentFields(
  collectionName: string,
  documentId: string,
  updates: Record<string, any>
): Promise<void> {
  const docRef = doc(db, collectionName, documentId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Delete a document
 */
export async function deleteDocument(
  collectionName: string,
  documentId: string
): Promise<void> {
  const docRef = doc(db, collectionName, documentId);
  await deleteDoc(docRef);
}

/**
 * Get all documents from a collection (one-time fetch)
 */
export async function fetchCollection<T extends FirestoreDoc>(
  collectionName: string,
  options?: {
    where?: { field: string; operator: any; value: any }[];
    orderBy?: { field: string; direction?: 'asc' | 'desc' };
    limit?: number;
  }
): Promise<T[]> {
  let q = query(collection(db, collectionName));

  if (options?.where) {
    options.where.forEach((w) => {
      q = query(q, where(w.field, w.operator, w.value));
    });
  }

  if (options?.orderBy) {
    q = query(q, orderBy(options.orderBy.field, options.orderBy.direction || 'desc'));
  }

  if (options?.limit) {
    q = query(q, limit(options.limit));
  }

  const snapshot = await getDocs(q);
  const docs: T[] = [];
  
  snapshot.forEach((docSnap) => {
    docs.push({ id: docSnap.id, ...docSnap.data() } as T);
  });

  return docs;
}

/**
 * Create initial data if collection is empty
 */
export async function seedCollectionIfEmpty<T extends FirestoreDoc>(
  collectionName: string,
  defaultData: T[],
  idField?: keyof T
): Promise<void> {
  const docs = await fetchCollection<T>(collectionName);
  
  if (docs.length === 0 && defaultData.length > 0) {
    console.log(`Seeding ${collectionName} with default data...`);
    for (const item of defaultData) {
      await saveDocument(collectionName, item, idField ? String(item[idField]) : undefined);
    }
  }
}

// Export Timestamp for use in type conversions
export { Timestamp };
