import { CommonModule } from '@angular/common';
import { HttpEvent } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { createComponentFactory, Spectator } from '@ngneat/spectator/jest';
import { TranslateModule } from '@ngx-translate/core';
import { BookstoreBffService } from '@openapi';
import { ConfirmationService, MessageService } from 'primeng/api';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { Observable, of, throwError } from 'rxjs';

import { BookCrudComponent } from './book-crud.component';

describe('BookCrudComponent (Spectator)', () => {
  let spectator: Spectator<BookCrudComponent>;
  const createComponent = createComponentFactory({
    component: BookCrudComponent,
    imports: [
      CommonModule,
      ReactiveFormsModule,
      ToggleSwitchModule,
      InputGroupModule,
      InputGroupAddonModule,
      TranslateModule.forRoot(),
    ],
    providers: [BookstoreBffService, ConfirmationService, MessageService],
    mocks: [BookstoreBffService, ConfirmationService, MessageService],
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  describe('Initialization', () => {
    it('should create', () => {
      expect(spectator.component).toBeTruthy();
    });

    it('should initialize form for new book', () => {
      expect(spectator.component.form).toBeTruthy();
    });
  });

  describe('Create - Update book', () => {
    it('should call updateBook when book exists', () => {
      const mockService = spectator.inject(BookstoreBffService);
      mockService.updateBook.mockReturnValue(of({}) as unknown as Observable<HttpEvent<any>>);

      spectator.component.book = { id: '1', title: 'Test', onSale: true } as any;
      spectator.component.ngOnInit();
      spectator.component.submit();

      expect(mockService.updateBook).toHaveBeenCalled();
    });

    it('should call createBook when book does not exist', () => {
      const mockService = spectator.inject(BookstoreBffService);
      mockService.createBook.mockReturnValue(of({}) as unknown as Observable<HttpEvent<any>>);

      spectator.component.book = null;
      spectator.component.ngOnInit();
      spectator.component.submit();

      expect(mockService.createBook).toHaveBeenCalled();
    });

    it('should handle update error', () => {
      const mockService = spectator.inject(BookstoreBffService);
      const messageService = spectator.inject(MessageService);

      mockService.updateBook.mockReturnValue(
        throwError(() => new Error('fail')) as unknown as Observable<HttpEvent<any>>
      );

      spectator.component.book = { id: '1', title: 'Test', onSale: true } as any;
      spectator.component.ngOnInit();
      spectator.component.submit();

      expect(messageService.add).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
    });

    it('should handle create error', () => {
      const mockService = spectator.inject(BookstoreBffService);
      const messageService = spectator.inject(MessageService);

      mockService.createBook.mockReturnValue(
        throwError(() => new Error('fail')) as unknown as Observable<HttpEvent<any>>
      );

      spectator.component.book = null; // new book (no ID)
      spectator.component.ngOnInit();
      spectator.component.submit();

      expect(messageService.add).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
    });
  });

  describe('Delete book', () => {
    it('should call deleteBook on confirmation', () => {
      const mockService = spectator.inject(BookstoreBffService);
      mockService.deleteBook.mockReturnValue(of({}) as unknown as Observable<HttpEvent<any>>);

      const confirmation = spectator.inject(ConfirmationService);
      jest.spyOn(confirmation, 'confirm').mockImplementation(({ accept }) => accept!());

      spectator.component.book = { id: '1', title: 'Book', onSale: false } as any;
      spectator.component.onDelete();

      expect(mockService.deleteBook).toHaveBeenCalledWith({ bookId: '1' });
    });

    it('should handle delete error', () => {
      const mockService = spectator.inject(BookstoreBffService);
      const messageService = spectator.inject(MessageService);

      mockService.deleteBook.mockReturnValue(
        throwError(() => new Error('fail')) as unknown as Observable<HttpEvent<any>>
      );

      const confirmation = spectator.inject(ConfirmationService);
      jest.spyOn(confirmation, 'confirm').mockImplementation(({ accept }) => accept!());

      spectator.component.book = { id: '1', title: 'Book', onSale: false } as any;
      spectator.component.onDelete();

      expect(messageService.add).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
    });

    it('should skip delete when no book is set', () => {
      const confirmation = spectator.inject(ConfirmationService);
      const confirmSpy = jest.spyOn(confirmation, 'confirm');
      spectator.component.book = null;
      spectator.component.onDelete();
      expect(confirmSpy).not.toHaveBeenCalled();
    });
  });

  it('should emit cancel event', () => {
    const cancelSpy = jest.spyOn(spectator.component.cancelAction, 'emit');
    spectator.component.onCancel();
    expect(cancelSpy).toHaveBeenCalled();
  });
});
