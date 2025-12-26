// ==========================================
// SERVIÇO DE CATEGORIAS
// ==========================================

import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    getDocs,
    getDoc,
    query,
    where, Timestamp,
    writeBatch
} from 'firebase/firestore';
import { db, COLLECTIONS } from './firebase';
import {
    Category,
    CreateCategoryInput,
    UpdateCategoryInput,
    CategoryType,
    DEFAULT_EXPENSE_CATEGORIES,
    DEFAULT_INCOME_CATEGORIES,
} from '../types/firebase';

const categoriesRef = collection(db, COLLECTIONS.CATEGORIES);

// Criar categoria
export async function createCategory(
  userId: string,
  data: CreateCategoryInput
): Promise<Category> {
  const now = Timestamp.now();
  
  const docRef = await addDoc(categoriesRef, {
    ...data,
    userId,
    createdAt: now,
    updatedAt: now,
  });

  return {
    id: docRef.id,
    userId,
    ...data,
    createdAt: now,
    updatedAt: now,
  };
}

// Buscar todas as categorias do usuário
export async function getCategories(userId: string): Promise<Category[]> {
  const q = query(
    categoriesRef,
    where('userId', '==', userId)
  );

  const snapshot = await getDocs(q);
  const categories = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Category[];
  
  // Ordenar no cliente
  return categories.sort((a, b) => a.name.localeCompare(b.name));
}

// Buscar categorias por tipo
export async function getCategoriesByType(
  userId: string,
  type: CategoryType
): Promise<Category[]> {
  const q = query(
    categoriesRef,
    where('userId', '==', userId),
    where('type', '==', type)
  );

  const snapshot = await getDocs(q);
  const categories = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Category[];
  
  // Ordenar no cliente
  return categories.sort((a, b) => a.name.localeCompare(b.name));
}

// Buscar categoria por ID
export async function getCategoryById(categoryId: string): Promise<Category | null> {
  const docRef = doc(db, COLLECTIONS.CATEGORIES, categoryId);
  const snapshot = await getDoc(docRef);
  
  if (!snapshot.exists()) return null;
  
  return {
    id: snapshot.id,
    ...snapshot.data(),
  } as Category;
}

// Atualizar subcategoria (incluindo mudar categoria pai)
export async function updateSubcategory(
  subcategoryId: string,
  data: { name?: string; icon?: string; parentId?: string }
): Promise<void> {
  const docRef = doc(db, COLLECTIONS.CATEGORIES, subcategoryId);
  const updateData: any = {
    updatedAt: Timestamp.now(),
  };

  if (data.name !== undefined) updateData.name = data.name;
  if (data.icon !== undefined) updateData.icon = data.icon;
  if (data.parentId !== undefined) updateData.parentId = data.parentId;

  await updateDoc(docRef, updateData);
}

// Atualizar categoria
export async function updateCategory(
  categoryId: string,
  data: UpdateCategoryInput
): Promise<void> {
  // Verificar se é a categoria protegida
  const category = await getCategoryById(categoryId);
  if (category?.isDefault && category.name === 'Renda') {
    throw new Error('A categoria Renda não pode ser editada pois é usada para cálculos de relatórios.');
  }
  
  // Proteger categoria Meta de edições
  if (category?.isMetaCategory || category?.name === 'Meta') {
    throw new Error('A categoria Meta não pode ser editada pois é usada pelo sistema para lançamentos de objetivos.');
  }
  
  const docRef = doc(db, COLLECTIONS.CATEGORIES, categoryId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

// Transferir todas as transações de uma categoria para outra
export async function transferTransactionsToCategory(
  userId: string,
  fromCategoryId: string,
  toCategoryId: string
): Promise<number> {
  const transactionsRef = collection(db, COLLECTIONS.TRANSACTIONS);
  
  // Buscar todas as transações da categoria de origem (incluir userId para validar permissões)
  const q = query(
    transactionsRef,
    where('userId', '==', userId),
    where('categoryId', '==', fromCategoryId)
  );
  
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) return 0;
  
  // Buscar dados da categoria de destino
  const toCategory = await getCategoryById(toCategoryId);
  if (!toCategory) {
    throw new Error('Categoria de destino não encontrada');
  }
  
  // Atualizar todas as transações em batch
  const batch = writeBatch(db);
  
  snapshot.docs.forEach((docSnapshot) => {
    const docRef = doc(db, COLLECTIONS.TRANSACTIONS, docSnapshot.id);
    batch.update(docRef, {
      categoryId: toCategoryId,
      categoryName: toCategory.name,
      categoryIcon: toCategory.icon,
      updatedAt: Timestamp.now(),
    });
  });
  
  await batch.commit();
  return snapshot.size;
}

// Deletar categoria
export async function deleteCategory(categoryId: string): Promise<void> {
  // Verificar se é a categoria protegida
  const category = await getCategoryById(categoryId);
  
  if (!category) {
    throw new Error('Categoria não encontrada');
  }
  
  // Proteger categorias essenciais
  if (category.name === 'Renda' && category.type === 'income') {
    throw new Error('A categoria Renda não pode ser removida pois é essencial para o sistema.');
  }
  
  if (category.name === 'Outros') {
    throw new Error('A categoria Outros não pode ser removida pois é essencial para o sistema.');
  }
  
  if (category.isMetaCategory || category.name === 'Meta') {
    throw new Error('A categoria Meta não pode ser removida pois é usada para lançamentos de objetivos.');
  }
  
  const docRef = doc(db, COLLECTIONS.CATEGORIES, categoryId);
  await deleteDoc(docRef);
}

// Criar categorias padrão para novo usuário
export async function createDefaultCategories(userId: string): Promise<void> {
  const batch = writeBatch(db);
  const now = Timestamp.now();

  // Categorias de despesa
  for (const category of DEFAULT_EXPENSE_CATEGORIES) {
    const docRef = doc(categoriesRef);
    batch.set(docRef, {
      ...category,
      userId,
      createdAt: now,
      updatedAt: now,
    });
  }

  // Categorias de receita
  for (const category of DEFAULT_INCOME_CATEGORIES) {
    const docRef = doc(categoriesRef);
    batch.set(docRef, {
      ...category,
      userId,
      createdAt: now,
      updatedAt: now,
    });
  }

  await batch.commit();
}

// Verificar se usuário já tem categorias
export async function userHasCategories(userId: string): Promise<boolean> {
  const q = query(
    categoriesRef,
    where('userId', '==', userId)
  );
  
  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

// Buscar ou criar categoria de meta
export async function getOrCreateMetaCategory(userId: string): Promise<string> {
  // Buscar categoria de meta existente
  const q = query(
    categoriesRef,
    where('userId', '==', userId),
    where('isMetaCategory', '==', true)
  );
  
  const snapshot = await getDocs(q);
  
  if (!snapshot.empty) {
    return snapshot.docs[0].id;
  }
  
  // Se não existe, criar
  const now = Timestamp.now();
  const docRef = await addDoc(categoriesRef, {
    name: 'Meta',
    icon: 'flag-checkered',
    type: 'expense',
    isDefault: true,
    isMetaCategory: true,
    userId,
    createdAt: now,
    updatedAt: now,
  });
  
  return docRef.id;
}

// ==========================================
// SUBCATEGORIAS
// ==========================================

// Buscar subcategorias de uma categoria pai
export async function getSubcategories(
  userId: string,
  parentId: string
): Promise<Category[]> {
  const q = query(
    categoriesRef,
    where('userId', '==', userId),
    where('parentId', '==', parentId)
  );

  const snapshot = await getDocs(q);
  const subcategories = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Category[];
  
  return subcategories.sort((a, b) => a.name.localeCompare(b.name));
}

// Verificar se uma categoria tem subcategorias
export async function hasSubcategories(
  userId: string,
  categoryId: string
): Promise<boolean> {
  const q = query(
    categoriesRef,
    where('userId', '==', userId),
    where('parentId', '==', categoryId)
  );
  
  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

// Criar subcategoria
export async function createSubcategory(
  userId: string,
  parentId: string,
  data: Omit<CreateCategoryInput, 'parentId'>
): Promise<Category> {
  const now = Timestamp.now();
  
  // Verificar se a categoria pai existe
  const parentCategory = await getCategoryById(parentId);
  if (!parentCategory) {
    throw new Error('Categoria pai não encontrada');
  }
  
  // Criar a subcategoria
  const docRef = await addDoc(categoriesRef, {
    ...data,
    parentId,
    userId,
    createdAt: now,
    updatedAt: now,
  });

  // Marcar a categoria pai como parent
  const parentDocRef = doc(db, COLLECTIONS.CATEGORIES, parentId);
  await updateDoc(parentDocRef, {
    isParent: true,
    updatedAt: now,
  });

  return {
    id: docRef.id,
    userId,
    ...data,
    parentId,
    createdAt: now,
    updatedAt: now,
  };
}

// Buscar categorias raiz (sem pai) por tipo
export async function getRootCategoriesByType(
  userId: string,
  type: CategoryType
): Promise<Category[]> {
  const q = query(
    categoriesRef,
    where('userId', '==', userId),
    where('type', '==', type),
    where('parentId', '==', null)
  );

  const snapshot = await getDocs(q);
  const categories = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Category[];
  
  return categories.sort((a, b) => a.name.localeCompare(b.name));
}

// Buscar todas as categorias (raiz + subcategorias) organizadas hierarquicamente
export async function getCategoriesHierarchy(
  userId: string,
  type: CategoryType
): Promise<Array<Category & { subcategories?: Category[] }>> {
  // Buscar todas as categorias do tipo
  const allCategories = await getCategoriesByType(userId, type);
  
  // Separar categorias raiz e subcategorias
  const rootCategories = allCategories.filter(cat => !cat.parentId);
  const subcategoriesMap = new Map<string, Category[]>();
  
  allCategories.forEach(cat => {
    if (cat.parentId) {
      if (!subcategoriesMap.has(cat.parentId)) {
        subcategoriesMap.set(cat.parentId, []);
      }
      subcategoriesMap.get(cat.parentId)!.push(cat);
    }
  });
  
  // Montar hierarquia
  return rootCategories.map(root => ({
    ...root,
    subcategories: subcategoriesMap.get(root.id) || [],
  }));
}

// Deletar categoria e suas subcategorias
export async function deleteCategoryAndSubcategories(
  userId: string,
  categoryId: string
): Promise<void> {
  const category = await getCategoryById(categoryId);
  
  if (!category) {
    throw new Error('Categoria não encontrada');
  }
  
  // Proteger categorias essenciais
  if (category.name === 'Renda' && category.type === 'income') {
    throw new Error('A categoria Renda não pode ser removida pois é essencial para o sistema.');
  }
  
  if (category.name === 'Outros') {
    throw new Error('A categoria Outros não pode ser removida pois é essencial para o sistema.');
  }
  
  if (category.isMetaCategory || category.name === 'Meta') {
    throw new Error('A categoria Meta não pode ser removida pois é usada para lançamentos de objetivos.');
  }
  
  // Buscar subcategorias
  const subcategories = await getSubcategories(userId, categoryId);
  
  // Deletar em batch
  const batch = writeBatch(db);
  
  // Deletar categoria principal
  const mainDocRef = doc(db, COLLECTIONS.CATEGORIES, categoryId);
  batch.delete(mainDocRef);
  
  // Deletar subcategorias
  subcategories.forEach(sub => {
    const subDocRef = doc(db, COLLECTIONS.CATEGORIES, sub.id);
    batch.delete(subDocRef);
  });
  
  await batch.commit();
}
