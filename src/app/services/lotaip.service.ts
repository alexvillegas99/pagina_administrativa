import { Injectable } from '@angular/core';
import { Observable, combineLatest, from } from 'rxjs';
import { addDoc, deleteDoc, getDocs, orderBy } from 'firebase/firestore';
import {
  collection,
  collectionData,
  doc,
  docData,
  Firestore,
  query,
  setDoc,
  updateDoc,
  Timestamp,
  arrayUnion,
  getDoc,
} from '@angular/fire/firestore';
import { v4 as uuidv4 } from 'uuid';
import { LotaipCategory, LotaipDocument, LotaipItem } from '../interfaces/lotaip.interface';

@Injectable({
  providedIn: 'root',
})
export class LotaipService {
  constructor(private firestore: Firestore) {}


  createLotaipDocument(lotaipDocument: LotaipDocument): Observable<any> {
    const today = Timestamp.fromDate(new Date());
    lotaipDocument.creationDate = today;
    const ref = doc(this.firestore, 'lotaip', uuidv4());
    return from(setDoc(ref, lotaipDocument));
  }
  deleteLotaipDocument(documentId: string): Observable<any> {
    const ref = doc(this.firestore, 'lotaip', documentId);
    return from(deleteDoc(ref));
  }
  
  addCategoryToLotaipDocument(lotaipDocumentName: string, newCategory: LotaipCategory): Observable<any> {
    const ref = doc(this.firestore, 'lotaip', lotaipDocumentName);
  console.log(lotaipDocumentName,newCategory)
    const categoryRef = collection(this.firestore, 'lotaip', lotaipDocumentName, 'category');
    const today = Timestamp.fromDate(new Date());
  
    return combineLatest([
      from(addDoc(categoryRef, {
        name: newCategory.name,
        creationDate: today,
        items: newCategory.items,
      })),
      from(getDoc(ref).then((docSnapshot) => {
        if (docSnapshot.exists()) {
          const lotaipDocumentData = docSnapshot.data() as LotaipDocument;
          // Obtener la categoría actual o inicializarla como una matriz vacía si es undefined
          const currentCategory = lotaipDocumentData.category || [];
          // Actualizar el campo "category" en el documento "lotaip" con la nueva categoría
          return updateDoc(ref, {
            category: [...currentCategory, newCategory],
          });
        }
        return Promise.resolve();
      })),
    ]);
  }
  deleteCategoryFromLotaipDocument(lotaipDocumentName: string, categoryName: string): Observable<any> {
    const ref = doc(this.firestore, 'lotaip', lotaipDocumentName);
  
    const categoryRef = collection(this.firestore, 'lotaip', lotaipDocumentName, 'category');
  
    return from(getDoc(ref).then((docSnapshot) => {
      if (docSnapshot.exists()) {
        const lotaipDocumentData = docSnapshot.data() as LotaipDocument;
        // Filtrar las categorías manteniendo solo aquellas cuyo nombre no coincide con el nombre de la categoría a eliminar
        const updatedCategoryList = lotaipDocumentData.category?.filter(cat => cat.name !== categoryName) || [];
        // Actualizar el campo "category" en el documento "lotaip" con la lista de categorías actualizada
        return updateDoc(ref, { category: updatedCategoryList })
          .then(() => {
            // Eliminar la categoría de la subcolección "category"
            return deleteDoc(doc(categoryRef, categoryName));
          });
      }
      return Promise.resolve();
    }));
  }

  addItemToCategorySubcollection(lotaipDocumentName: string, categoryName: string, newItem: LotaipItem): Observable<any> {
    const categoryRef = doc(this.firestore, 'lotaip', lotaipDocumentName, 'category', categoryName);
    const itemsCollectionRef = collection(categoryRef, 'items');
    const today = Timestamp.fromDate(new Date());
  
    return from(addDoc(itemsCollectionRef, {
      name: newItem.name,
      urlPDF: newItem.urlPDF,
      creationDate: today,
    }));
  }
  deleteItemFromCategorySubcollection(lotaipDocumentName: string, categoryName: string, itemId: string): Observable<any> {
    const categoryRef = doc(this.firestore, 'lotaip', lotaipDocumentName, 'category', categoryName);
    const itemRef = doc(categoryRef, 'items', itemId);
    return from(deleteDoc(itemRef));
  }


  getLotaipCollection$(): Observable<LotaipDocument[]> {
    const ref = collection(this.firestore, 'lotaip');
    const queryAll = query(ref, orderBy('creationDate', 'desc')); // Cambiamos el orden a 'desc'
  
    return new Observable<LotaipDocument[]>((observer) => {
      getDocs(queryAll).then((querySnapshot) => {
        const lotaipDocuments: LotaipDocument[] = [];
        const categoryObservables: Observable<LotaipCategory[]>[] = [];
  
        querySnapshot.forEach((doc) => {
          const data = doc.data() as LotaipDocument;
          const id = doc.id;
          const categoryRef = collection(this.firestore, 'lotaip', id, 'category');
          const categoryQuery = query(categoryRef, orderBy('creationDate', 'asc')); // Ordenamos las categorías por 'creationDate' en 'desc'
  
          // Creamos un nuevo Observable para obtener las categorías de cada documento "lotaip"
          categoryObservables.push(from(getDocs(categoryQuery).then((categoryQuerySnapshot) => {
            const categories: LotaipCategory[] = [];
  
            categoryQuerySnapshot.forEach((categoryDoc) => {
              const categoryData = categoryDoc.data() as LotaipCategory;
              const categoryId = categoryDoc.id;
              const itemsCollectionRef = collection(categoryRef, categoryId, 'items');
              const itemsQuery = query(itemsCollectionRef, orderBy('creationDate', 'asc')); // Ordenamos los items por 'creationDate' en 'desc'
  
              return from(getDocs(itemsQuery).then((itemsQuerySnapshot) => {
                const items: LotaipItem[] = [];
  
                itemsQuerySnapshot.forEach((itemDoc) => {
                  const itemData = itemDoc.data() as LotaipItem;
                  const itemId = itemDoc.id;
                  items.push({ uid: itemId, ...itemData });
                });
  
                // Agregamos los items a la categoría, ya están ordenados por 'creationDate' en 'desc'
                categoryData.items = items;
                categories.push({ uid: categoryId, ...categoryData });
  
                return categories;
              }));
            });
  
            return categories;
          })));
  
          lotaipDocuments.push({ uid:id, ...data });
        });
  
        // Combinamos todos los Observables para esperar a que todos los datos estén disponibles
        combineLatest(categoryObservables).subscribe((categoriesArrays) => {
          for (let i = 0; i < categoriesArrays.length; i++) {
            lotaipDocuments[i].category = categoriesArrays[i];
          }
  
          observer.next(lotaipDocuments);
          observer.complete();
        });
      }).catch((error) => {
        observer.error(error);
      });
    });
  }


}
