import { 
  collection, 
  doc, 
  addDoc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  deleteDoc,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth } from './firebase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function saveLog(data: { title: string, content: string, category: string, imageUrl?: string }, userId?: string, userName?: string) {
  const path = 'logs';
  try {
    const user = auth.currentUser;
    const finalUid = userId || user?.uid;
    if (!finalUid) throw new Error("Not authenticated");

    return await addDoc(collection(db, path), {
      ...data,
      userId: finalUid,
      userName: userName || user?.displayName || "농부",
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export function subscribeToLogs(callback: (logs: any[]) => void) {
  const path = 'logs';
  
  const q = query(
    collection(db, path),
    orderBy('timestamp', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(logs);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
}

export async function updateLog(id: string, data: { title: string, content: string, category: string, imageUrl?: string }) {
  const path = `logs/${id}`;
  try {
    const docRef = doc(db, 'logs', id);
    return await setDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteLog(id: string) {
  const path = `logs/${id}`;
  try {
    const docRef = doc(db, 'logs', id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function searchUserByUid(uid: string) {
  const path = `users/${uid}`;
  try {
    const docSnap = await getDoc(doc(db, 'users', uid));
    return docSnap.exists() ? docSnap.data() : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function getUserProfile(uid: string) {
  const path = `users/${uid}`;
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveSchedule(data: { title: string, startDate: string, endDate: string, type: 'travel' | 'rest' }, userId?: string) {
  const path = 'schedules';
  try {
    const user = auth.currentUser;
    const finalUid = userId || user?.uid;
    if (!finalUid) throw new Error("Not authenticated");

    return await addDoc(collection(db, path), {
      ...data,
      userId: finalUid,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export function subscribeToSchedules(userId: string, callback: (schedules: any[]) => void) {
  const path = 'schedules';
  const q = query(
    collection(db, path),
    where('userId', '==', userId),
    orderBy('timestamp', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const schedules = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(schedules);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
}

export async function deleteSchedule(id: string) {
  const path = `schedules/${id}`;
  try {
    const docRef = doc(db, 'schedules', id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveComment(complaintId: string, content: string, userId?: string, userName?: string) {
  const path = `complaints/${complaintId}/comments`;
  try {
    const user = auth.currentUser;
    const finalUid = userId || user?.uid;
    if (!finalUid) throw new Error("Not authenticated");

    return await addDoc(collection(db, 'complaints', complaintId, 'comments'), {
      content,
      userId: finalUid,
      userName: userName || user?.displayName || "가족",
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export function subscribeToComments(complaintId: string, callback: (comments: any[]) => void) {
  const path = `complaints/${complaintId}/comments`;
  const q = query(
    collection(db, 'complaints', complaintId, 'comments'),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const comments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(comments);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
}

export function subscribeToComplaints(callback: (complaints: any[]) => void) {
  const path = 'complaints';
  
  const q = query(
    collection(db, path),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const complaints = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(complaints);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
}

export async function saveComplaint(data: { content: string, imageUrl?: string | null }, userId?: string, userName?: string) {
  const path = 'complaints';
  try {
    const user = auth.currentUser;
    const finalUid = userId || user?.uid;
    if (!finalUid) throw new Error("Not authenticated");

    return await addDoc(collection(db, path), {
      ...data,
      userId: finalUid,
      userName: userName || user?.displayName || "생활 농부",
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteComplaint(id: string) {
  const path = `complaints/${id}`;
  try {
    const docRef = doc(db, 'complaints', id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveLogComment(logId: string, content: string, imageUrl?: string, userId?: string, userName?: string) {
  const path = `logs/${logId}/messages`;
  try {
    const user = auth.currentUser;
    const finalUid = userId || user?.uid;
    if (!finalUid) throw new Error("Not authenticated");

    return await addDoc(collection(db, 'logs', logId, 'messages'), {
      content,
      imageUrl: imageUrl || null,
      userId: finalUid,
      userName: userName || user?.displayName || "가족",
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export function subscribeToLogMessages(logId: string, callback: (messages: any[]) => void) {
  const path = `logs/${logId}/messages`;
  const q = query(
    collection(db, 'logs', logId, 'messages'),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(messages);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
}

export async function updateUserProfile(uid: string, data: any) {
  const path = `users/${uid}`;
  try {
    return await setDoc(doc(db, 'users', uid), data, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function getTodayOngoingSchedule(userId?: string) {
  const user = auth.currentUser;
  const finalUid = userId || user?.uid;
  if (!finalUid) return null;

  const path = 'schedules';
  const today = new Date().toISOString().split('T')[0];
  
  try {
    const q = query(
      collection(db, path),
      where('userId', '==', finalUid)
    );
    
    const snapshot = await getDocs(q);
    const schedules = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
    
    return schedules.find(s => {
      return s.startDate && s.endDate && today >= s.startDate && today <= s.endDate;
    }) || null;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return null;
  }
}
