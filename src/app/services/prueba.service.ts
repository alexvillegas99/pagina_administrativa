import { Injectable } from '@angular/core';
import {
  CollectionReference,
  DocumentReference,
  Firestore,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { User } from '../interfaces';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class PruebaService {
  private usersCollection: CollectionReference;

  constructor(private firestore: Firestore) {
    this.usersCollection = collection(
      this.firestore,
      'users'
    ) as CollectionReference<User>;
  }

  async addUser(user: User) {
    try {
      const documentReference = await addDoc(this.usersCollection, user);
      const documentSnapshot = await getDoc(documentReference);
      const createdUser = documentSnapshot.data() as User;
      console.log('Usuario creado:', createdUser);
      return createdUser;
    } catch (error) {
      console.error('Error al crear el documento:', error);
      return null;
    }
  }

  async getUserById(id: string) {
    try {
      const userDoc = await getDoc(doc(this.usersCollection, id));
      if (userDoc.exists()) {
        const user = userDoc.data();
        user['id'] = userDoc.id;
        console.log('Usuario encontrado:', user);
        return user;
      } else {
        console.log('No se encontró ningún usuario con el ID proporcionado.');
        return null;
      }
    } catch (error) {
      console.error('Error al obtener el usuario:', error);
      return null;
    }
  }

  // Método para actualizar un usuario en la base de datos
  async updateUser(id: string, data: Partial<User>): Promise<void> {
    try {
      await updateDoc(doc(this.usersCollection, id), data);
      console.log('Usuario actualizado correctamente.');
    } catch (error) {
      console.error('Error al actualizar el usuario:', error);
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const querySnapshot = await getDocs(this.usersCollection);
      const users: User[] = [];
      querySnapshot.forEach((documentSnapshot) => {
        const user = documentSnapshot.data() as User;
        user.uid = documentSnapshot.id; // Agregamos el ID del documento al usuario
        users.push(user);
      });
      console.log('Usuarios obtenidos:', users);
      return users;
    } catch (error) {
      console.error('Error al obtener los usuarios:', error);
      return [];
    }
  }
  // Método para eliminar un usuario de la base de datos
  async deleteUser(id: string): Promise<void> {
    try {
      await deleteDoc(doc(this.usersCollection, id));
      console.log('Usuario eliminado correctamente.');
    } catch (error) {
      console.error('Error al eliminar el usuario:', error);
    }
  }
}
