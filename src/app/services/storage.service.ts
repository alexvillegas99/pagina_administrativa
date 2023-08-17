import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';

import { deleteObject, getStorage, ref, uploadString } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import {
  UploadBase64,
  UploadPDF,
} from '../interfaces/upload-base-64.interface';
import { environment } from 'src/environment/environment';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  /**
   * Configuración de firebase
   */
  private firebaseConfig = environment.firebase;

  firebaseApp;

  storageBucket = `gs://${this.firebaseConfig.storageBucket}`;

  constructor() {
    this.firebaseApp = initializeApp(this.firebaseConfig);
  }
  async uploadBase64(body: UploadBase64) {
    const imageName = uuidv4();
    const imageData = body.image.includes('data:')
      ? body.image.split(',')[1]
      : body.image;
    const storage = getStorage(this.firebaseApp, this.storageBucket);

    const storageRef = ref(storage, `${body.route}/${imageName}`);

    const result = await uploadString(storageRef, imageData, 'base64', {
      contentType: 'image/jpeg',
    });

    const bucket = result.metadata.bucket;
    const imagePath = result.metadata.fullPath;

    const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(
      imagePath
    )}?alt=media`;

    return { imageUrl };
  }

  async uploadPDF(body: UploadPDF) {
    if (!body.pdf.includes('data:application/pdf')) {
      throw new Error('El archivo debe ser un PDF.');
    }

    const pdfName = uuidv4();
    const pdfData = body.pdf.split(',')[1];
    const storage = getStorage(this.firebaseApp, this.storageBucket);

    const storageRef = ref(storage, `${body.route}/${pdfName}.pdf`);

    const result = await uploadString(storageRef, pdfData, 'base64', {
      contentType: 'application/pdf', // Cambiar el tipo de contenido a "application/pdf"
    });

    const bucket = result.metadata.bucket;
    const pdfPath = result.metadata.fullPath;

    const pdfUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(
      pdfPath
    )}?alt=media`;
    return { pdfUrl };
  }

  async deleteImageByUrl(imageUrl: string) {
    const decodedUrl = decodeURIComponent(imageUrl);
    const startIndex = decodedUrl.indexOf('/o/');

    const imagePath = decodedUrl.substring(
      startIndex + 3,
      decodedUrl.indexOf('?')
    );
    const storage = getStorage();
    const imageRef = ref(storage, imagePath);

    const data = await deleteObject(imageRef);
    return true;
  }
}
