import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { User } from 'src/app/interfaces';
import { AuthService } from 'src/app/services/auth.service';
import { MessagesService } from 'src/app/services/messages.service';
import { UsersService } from 'src/app/services/users.service';
import { HotToastService } from '@ngneat/hot-toast';
import { Observable, Subscription, of, switchMap } from 'rxjs';
import { Message } from 'src/app/interfaces/message.interface';

@Component({
  selector: 'app-messages-client',
  templateUrl: './messages-client.component.html',
  styleUrls: ['./messages-client.component.scss'],
})
export class MessagesClientComponent implements OnInit,OnDestroy {
  constructor(
    private readonly messageService: MessagesService,
    private readonly userService: UsersService,
    private readonly authService: AuthService,
    private readonly fb: FormBuilder,
    private toast: HotToastService
  ) {}

  viewChat = false;

  user$ = this.userService.currentUserProfile$;
  otherUser: User = {
    uid: 'vBUHdGXAO9e9SV3raL7ivsyxB7Z2',
    email: 'av058554@gmail.com',
  };

  ngOnInit(): void {
  
    if (this.user$) {
      this.createChat(this.otherUser);

      this.user$.pipe().subscribe(
        (userData) => {
          /*   console.log(userData); */
        },
        (error) => {
          console.error('Error:', error);
        }
      );
    }
  }
  emailForm = this.fb.group({
    email: ['av054558@gmail.com', [Validators.email, Validators.required]],
  });

  messages$: Observable<Message[]> | undefined;

  loginOrRegister() {
    const email = this.emailForm.controls.email.value!;
    this.authService
      .login(email, email)
      .pipe()
      .subscribe(
        () => {
          // Success callback
          this.createChat(this.otherUser);
        },
        (error) => {
          this.authService
            .signUp(email!, email!)
            .pipe(
              switchMap(({ user: { uid } }) =>
                this.userService.addUser({ uid, email, isAdmin: false })
              )
            )
            .subscribe(() => {
              this.createChat(this.otherUser);
            });
        }
      );
  }
  chatId = '';
  createChat(user: User) {
    this.messageService
      .isExistingChat(user.uid)
      .pipe(
        switchMap((chatId) => {
          if (!chatId) {
            return this.messageService.createChat(user);
          } else {
            return of(chatId);
          }
        })
      )
      .subscribe((chatId) => {
        this.chatId = chatId;
        this.messages$ = this.messageService.getChatMessages$(this.chatId);
        this.messagesSubscription = this.messages$.subscribe(
          (messages: Message[]) => {
           this.scrollToBottom()
          },
          (error) => {
            
          }
        );
        this.scrollToBottom();
      });
  }
  messageControl = new FormControl('');
  message = '';
  messagesSubscription: Subscription ;
  ngOnDestroy() {
    // Es importante desuscribirse cuando el componente se destruye para evitar posibles fugas de memoria.
    this.messagesSubscription.unsubscribe();
  }
  sendMessage() {
    if (this.message && this.chatId) {
      this.messageService
        .addChatMessage(this.chatId, this.message)
        .subscribe(() => {
          this.scrollToBottom();
        });
      this.message = '';
    }
  }
  @ViewChild('scrollContainer', { static: false }) scrollContainer: ElementRef;

  scrollToBottom() {
    setTimeout(() => {
      if (this.scrollContainer && this.scrollContainer.nativeElement) {
        const container = this.scrollContainer.nativeElement;
        container.scrollTop = container.scrollHeight;
      }
    }, 500);
  }
  showMessage() {
    this.viewChat = !this.viewChat;
    this.scrollToBottom()
  }
}
