import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Message, MessageCreate } from '../models/message.model';

@Injectable({ providedIn: 'root' })
export class MessageService {
  private readonly api = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getForConversation(conversationId: number) {
    return this.http.get<Message[]>(`${this.api}/razgovori/${conversationId}/poruke`);
  }

  create(conversationId: number, dto: MessageCreate) {
    return this.http.post<Message>(`${this.api}/razgovori/${conversationId}/poruke`, dto);
  }

  markAsRead(conversationId: number) {
    return this.http.patch<void>(`${this.api}/razgovori/${conversationId}/procitano`, {});
  }
}
