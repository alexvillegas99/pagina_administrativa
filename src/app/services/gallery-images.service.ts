import { Injectable } from '@angular/core';
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
import { Observable, combineLatest, from, map } from 'rxjs';
import { addDoc, deleteDoc, getDocs, orderBy, where } from 'firebase/firestore';
import { GalleryImage,Image } from '../interfaces';
@Injectable({
  providedIn: 'root'
})
export class GalleryImagesService {

  constructor(private firestore: Firestore) {}


  createGalleryImageDocument(galleryImage: GalleryImage): Observable<any> {
    const today = Timestamp.fromDate(new Date());
    galleryImage.creationDate = today;
    const ref = doc(this.firestore, 'gallery-images', uuidv4());
    return from(setDoc(ref, galleryImage));
  }
  
  deleteGalleryDocument(galleryImageId: string): Observable<any> {
    const ref = doc(this.firestore, 'gallery-images', galleryImageId);
  
    return from(getDoc(ref).then((docSnapshot) => {
      if (docSnapshot.exists()) {
        // Eliminar la galería
        return deleteDoc(ref);
      }
      return Promise.resolve();
    }));
  }
  

  addImageToGalleryDocument(galleryImageId: string, newImage: Image): Observable<any> {
    const ref = doc(this.firestore, 'gallery-images', galleryImageId);
    const imageRef = collection(this.firestore, 'gallery-images', galleryImageId, 'imagenes');
    const today = Timestamp.fromDate(new Date());
  
    return combineLatest([
      from(addDoc(imageRef, {
        url: newImage.url,
        creationDate: today,
      })),
      from(getDoc(ref).then((docSnapshot) => {
        if (docSnapshot.exists()) {
          const galleryImageData = docSnapshot.data() as GalleryImage;
          // Obtener la lista de imágenes actual o inicializarla como una matriz vacía si es undefined
          const currentImages = galleryImageData.images || [];
          // Actualizar el campo "images" en el documento "gallery-images" con la nueva imagen
          return updateDoc(ref, {
            images: [...currentImages, newImage],
          });
        }
        return Promise.resolve();
      })),
    ]);
  }
  
  deleteImageFromGalleryDocument(galleryImageId: string, imageUrl: string): Observable<any> {
    const ref = doc(this.firestore, 'gallery-images', galleryImageId);
  
    const imageRef = collection(this.firestore, 'gallery-images', galleryImageId, 'imagenes');
  
    return from(getDoc(ref).then((docSnapshot) => {
      if (docSnapshot.exists()) {
        const galleryImageData = docSnapshot.data() as GalleryImage;
        // Filter the images array, keeping only the images whose URL does not match the URL of the image to be deleted
        const updatedImageList = galleryImageData.images?.filter(img => img.url !== imageUrl) || [];
        // Update the "images" field in the "gallery-images" document with the updated images list
        return updateDoc(ref, { images: updatedImageList })
          .then(() => {
            // Delete the image from the "imagenes" subcollection
            const queryRef = query(imageRef, where('url', '==', imageUrl));
            return getDocs(queryRef).then((querySnapshot) => {
              querySnapshot.forEach((doc) => deleteDoc(doc.ref));
            });
          });
      }
      return Promise.resolve();
    }));
  }

  

  getGalleryCollection$(): Observable<GalleryImage[]> {
    const ref = collection(this.firestore, 'gallery-images');
    const queryAll = query(ref, orderBy('creationDate', 'desc'));
  
    return new Observable<GalleryImage[]>((observer) => {
      getDocs(queryAll).then((querySnapshot) => {
        const galleryImages: GalleryImage[] = [];
        const imageObservables: Observable<Image[]>[] = [];
  
        querySnapshot.forEach((doc) => {
          const data = doc.data() as GalleryImage;
          const galleryId = doc.id;
          const imageRef = collection(this.firestore, 'gallery-images', galleryId, 'imagenes');
          const imageQuery = query(imageRef, orderBy('creationDate', 'asc'));
  
          // Create a new Observable to fetch images for each gallery
          imageObservables.push(from(getDocs(imageQuery)).pipe(
            map((imageQuerySnapshot) => {
              const images: Image[] = [];
  
              imageQuerySnapshot.forEach((imageDoc) => {
                const imageData = imageDoc.data() as Image;
                const imageId = imageDoc.id;
                images.push({ uid: imageId, ...imageData });
              });
  
              // Images are sorted by 'creationDate' in ascending order
              return images;
            })
          ));
  
          galleryImages.push({ uid: galleryId, ...data });
        });
  
        // Combine all Observables to wait for all data to be available
        combineLatest(imageObservables).subscribe((imagesArrays) => {
          for (let i = 0; i < imagesArrays.length; i++) {
            galleryImages[i].images = imagesArrays[i];
          }
  
          observer.next(galleryImages);
          observer.complete();
        });
      }).catch((error) => {
        observer.error(error);
      });
    });
  }
  
  
  
}
