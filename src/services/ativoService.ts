import {
    collection,
    doc,
    getDocs,
    query,
    where,
    writeBatch,
    Timestamp,
    orderBy,
} from 'firebase/firestore';
import { db, COLLECTIONS } from './firebase';
import type { ImportResult, OperacaoAtivo } from '../types/ativos';

const OPERACOES_COLLECTION = COLLECTIONS.OPERACOES_ATIVOS;

function docIdForUser(userId: string, idOperacao: string): string {
  return `${userId}_${idOperacao}`;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export async function importOperacoesAtivos(
  userId: string,
  operacoes: OperacaoAtivo[]
): Promise<ImportResult> {
  if (!userId) throw new Error('Usuário inválido');

  const totalLinhasLidas = operacoes.length;
  const colRef = collection(db, OPERACOES_COLLECTION);

  // Buscar todos os IDs existentes do usuário usando query permitida pela regra de segurança
  const existing = new Set<string>();
  const q = query(colRef, where('userId', '==', userId));
  const snap = await getDocs(q);
  snap.forEach((d) => existing.add(d.id));

  let totalOperacoesImportadas = 0;
  let totalOperacoesIgnoradasDuplicidade = 0;

  // Firestore batch hard limit is 500 writes.
  // Keep a bit of margin to avoid edge-cases.
  const MAX_WRITES_PER_BATCH = 450;
  let batch = writeBatch(db);
  let pendingWrites = 0;

  async function commitIfNeeded(force: boolean) {
    if (pendingWrites === 0) return;
    if (!force && pendingWrites < MAX_WRITES_PER_BATCH) return;
    await batch.commit();
    batch = writeBatch(db);
    pendingWrites = 0;
  }

  for (const op of operacoes) {
    const docId = docIdForUser(userId, op.idOperacao);
    if (existing.has(docId)) {
      totalOperacoesIgnoradasDuplicidade += 1;
      continue;
    }

    const ref = doc(colRef, docId);
    batch.set(ref, {
      userId,
      idOperacao: op.idOperacao,
      data: Timestamp.fromDate(op.data),
      ticker: op.ticker,
      tipo: op.tipo,
      quantidade: op.quantidade,
      precoUnitario: op.precoUnitario,
      valorTotal: op.valorTotal,
      corretora: op.corretora,
    });
    totalOperacoesImportadas += 1;
    pendingWrites += 1;

    await commitIfNeeded(false);
  }

  await commitIfNeeded(true);

  return {
    totalLinhasLidas,
    totalOperacoesImportadas,
    totalOperacoesIgnoradasDuplicidade,
  };
}

export async function listOperacoesAtivos(userId: string): Promise<OperacaoAtivo[]> {
  const colRef = collection(db, OPERACOES_COLLECTION);

  const q = query(
    colRef,
    where('userId', '==', userId),
    orderBy('data', 'desc')
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data() as any;
    return {
      idOperacao: String(data.idOperacao),
      data: (data.data as Timestamp).toDate(),
      ticker: String(data.ticker),
      tipo: data.tipo,
      quantidade: Number(data.quantidade) || 0,
      precoUnitario: Number(data.precoUnitario) || 0,
      valorTotal: Number(data.valorTotal) || 0,
      corretora: String(data.corretora ?? ''),
    } as OperacaoAtivo;
  });
}

export async function deleteAllOperacoesAtivos(userId: string): Promise<{ totalDeleted: number }> {
  if (!userId) throw new Error('Usuário inválido');

  const colRef = collection(db, OPERACOES_COLLECTION);
  const q = query(colRef, where('userId', '==', userId));
  const snap = await getDocs(q);

  const docs = snap.docs;
  if (docs.length === 0) return { totalDeleted: 0 };

  const MAX_WRITES_PER_BATCH = 450;
  let totalDeleted = 0;

  for (let i = 0; i < docs.length; i += MAX_WRITES_PER_BATCH) {
    const part = docs.slice(i, i + MAX_WRITES_PER_BATCH);
    const batch = writeBatch(db);
    for (const d of part) {
      batch.delete(d.ref);
    }
    await batch.commit();
    totalDeleted += part.length;
  }

  return { totalDeleted };
}
