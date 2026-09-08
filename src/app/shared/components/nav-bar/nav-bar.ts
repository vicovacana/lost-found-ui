import { Component, Signal, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ChatHubService } from '../../../core/services/chat-hub.service';

@Component({
  selector: 'app-nav-bar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './nav-bar.html',
  styleUrl: './nav-bar.scss',
})
export class NavBar {
  protected confirmingLogout = signal(false);
  protected readonly hasUnread: Signal<boolean>;

  constructor(
    protected readonly auth: AuthService,
    private readonly chatHub: ChatHubService,
    private readonly router: Router,
  ) {
    this.hasUnread = this.chatHub.hasUnread;
  }

  askLogout(): void {
    this.confirmingLogout.set(true);
  }

  cancelLogout(): void {
    this.confirmingLogout.set(false);
  }

  confirmLogout(): void {
    this.confirmingLogout.set(false);
    this.auth.logout();
    this.router.navigateByUrl('/');
  }
}
