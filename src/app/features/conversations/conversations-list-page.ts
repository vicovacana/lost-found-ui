import { DatePipe } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ConversationStatus } from '../../core/models/enums';
import { Conversation } from '../../core/models/conversation.model';
import { ChatHubService } from '../../core/services/chat-hub.service';
import { ConversationService } from '../../core/services/conversation.service';
import { StatusTag } from '../../shared/components/status-tag/status-tag';

type Tab = ConversationStatus;

@Component({
  selector: 'app-conversations-list-page',
  imports: [RouterLink, StatusTag, DatePipe],
  templateUrl: './conversations-list-page.html',
  styleUrl: './conversations-list-page.scss',
})
export class ConversationsListPage {
  protected readonly ConversationStatus = ConversationStatus;

  protected conversations = signal<Conversation[]>([]);
  protected loading = signal(true);
  protected tab = signal<Tab>(ConversationStatus.Open);

  protected withUnread = computed(() =>
    this.conversations().map((r) => ({
      ...r,
      hasUnread: r.hasUnread || this.chatHub.unreadConversationIds().has(r.conversationId),
    })),
  );

  protected filtered = computed(() =>
    this.withUnread().filter((r) => r.status === this.tab()),
  );

  protected openCount = computed(
    () => this.conversations().filter((r) => r.status === ConversationStatus.Open).length,
  );
  protected closedCount = computed(
    () => this.conversations().filter((r) => r.status === ConversationStatus.Closed).length,
  );

  constructor(
    private readonly conversationService: ConversationService,
    protected readonly chatHub: ChatHubService,
  ) {
    this.conversationService.getMine().subscribe({
      next: (data) => {
        this.conversations.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  setTab(tab: Tab): void {
    this.tab.set(tab);
  }
}
