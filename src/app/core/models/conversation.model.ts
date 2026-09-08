import { ConversationStatus } from './enums';

export interface Conversation {
  conversationId: number;
  createdAt: string;
  status: ConversationStatus;
  listingId: number;
  listingTitle: string;
  locationDescription: string | null;
  hasUnread: boolean;
}
