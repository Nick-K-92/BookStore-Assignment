import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'mxs-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [RouterOutlet, CommonModule, ConfirmDialogModule, ToastModule, TranslateModule],
  providers: [ConfirmationService, MessageService],
})
export class AppComponent {
  private translateService: TranslateService = inject(TranslateService);

  constructor() {
    this.translateService.setDefaultLang('en');
    this.translateService.use('en');
  }

  switchLang(lang: string): void {
    this.translateService.use(lang);
  }
}
