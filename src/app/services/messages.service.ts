
import { Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  collectionData,
  doc,
  Firestore,
  getDoc,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { concatMap, from, map, Observable, take, tap } from 'rxjs';

import { UsersService } from './users.service';
import { Chat, Message } from '../interfaces/message.interface';
import { User } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class MessagesService {
  constructor(
    private firestore: Firestore,
    private usersService: UsersService
  ) {}

  get myChats$(): Observable<Chat[]> {
    const ref = collection(this.firestore, 'chats');
    return this.usersService.currentUserProfile$.pipe(
      concatMap((user) => {
        const myQuery = query(
          ref,
          where('userIds', 'array-contains', user?.uid)
        );
        return collectionData(myQuery, { idField: 'id' }).pipe(
          map((chats: any) => this.addChatNameAndPic(user?.uid, chats))
        ) as Observable<Chat[]>;
      })
    );
  }

  createChat(otherUser: User): Observable<string> {
    const ref = collection(this.firestore, 'chats');
    return this.usersService.currentUserProfile$.pipe(
      take(1),
      concatMap((user) =>
        addDoc(ref, {
          userIds: [user?.uid, otherUser?.uid],
          users: [
            {
              email: user?.email ?? '',
             
            },
            {
              email: otherUser.email ?? '',
             
            },
          ],
        })
      ),
      map((ref) => ref.id)
    );
  }

  isExistingChat(otherUserId: string): Observable<string | null> {
    return this.myChats$.pipe(
      take(1),
      map((chats) => {
        for (let i = 0; i < chats.length; i++) {
          if (chats[i].userIds.includes(otherUserId)) {
            return chats[i].id;
          }
        }

        return null;
      })
    );
  }

  addChatMessage(chatId: string, message: string): Observable<any> {
    const ref = collection(this.firestore, 'chats', chatId, 'messages');
    const chatRef = doc(this.firestore, 'chats', chatId);
    const today = Timestamp.fromDate(new Date());
    return this.usersService.currentUserProfile$.pipe(
      take(1),
      concatMap((user) =>
        addDoc(ref, {
          text: message,
          senderId: user?.uid,
          sentDate: today,
        })
      ),
      concatMap(() =>
        updateDoc(chatRef, { lastMessage: message, lastMessageDate: today })
      )
    );
  }

  getChatMessages$(chatId: string): Observable<Message[]> {
    const ref = collection(this.firestore, 'chats', chatId, 'messages');
    const queryAll = query(ref, orderBy('sentDate', 'asc'));
    return collectionData(queryAll) as Observable<Message[]>;
  }

  addChatNameAndPic(currentUserId: string | undefined, chats: Chat[]): Chat[] {
    chats.forEach((chat: Chat) => {
      const otherUserIndex =
        chat.userIds.indexOf(currentUserId ?? '') === 0 ? 1 : 0;
      const { email } = chat.users[otherUserIndex];
      chat.chatName = email;
    });

    return chats;
  }
}