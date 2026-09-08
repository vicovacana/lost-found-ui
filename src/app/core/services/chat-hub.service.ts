import { Injectable, computed, effect, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Message } from '../models/message.model';
import { AuthService } from './auth.service';
import { ConversationService } from './conversation.service';

@Injectable({ providedIn: 'root' })
export class ChatHubService {
  private connection?: signalR.HubConnection;

  private readonly unreadIds = signal<Set<number>>(new Set());
  readonly unreadConversationIds = this.unreadIds.asReadonly();
  readonly hasUnread = computed(() => this.unreadIds().size > 0);

  private readonly messageReceivedSubject = new Subject<Message>();
  readonly messageReceived$ = this.messageReceivedSubject.asObservable();

  constructor(
    private readonly auth: AuthService,
    private readonly conversationService: ConversationService,
  ) {
    effect(() => {
      if (this.auth.isAuthenticated()) {
        this.connect();
      } else {
        this.disconnect();
      }
    });
  }

  joinConversation(conversationId: number): void {
    this.connection?.invoke('JoinConversation', conversationId).catch(() => {});
  }

  leaveConversation(conversationId: number): void {
    this.connection?.invoke('LeaveConversation', conversationId).catch(() => {});
  }

  markAsRead(conversationId: number): void {
    this.unreadIds.update((ids) => {
      if (!ids.has(conversationId)) return ids;
      const next = new Set(ids);
      next.delete(conversationId);
      return next;
    });
  }

  private connect(): void {
    if (this.connection) return;

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(environment.hubUrl, { accessTokenFactory: () => this.auth.token ?? '' })
      .withAutomaticReconnect()
      .build();

    this.connection.on('ReceiveMessage', (message: Message) => {
      this.messageReceivedSubject.next(message);
    });

    this.connection.on('NewMessageNotification', (payload: { conversationId: number }) => {
      this.unreadIds.update((ids) => new Set(ids).add(payload.conversationId));
    });

    this.connection
      .start()
      .then(() => this.seedUnreadState())
      .catch(() => {});
  }

  private disconnect(): void {
    this.connection?.stop().catch(() => {});
    this.connection = undefined;
    this.unreadIds.set(new Set());
  }

  private seedUnreadState(): void {
    this.conversationService.getMine().subscribe((conversations) => {
      this.unreadIds.set(new Set(conversations.filter((c) => c.hasUnread).map((c) => c.conversationId)));
    });
  }
}
