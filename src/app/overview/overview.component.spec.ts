import { HttpEvent } from '@angular/common/http';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { createComponentFactory, Spectator } from '@ngneat/spectator/jest';
import { TranslateModule } from '@ngx-translate/core';
import { BookDTO, BookstoreBffService } from '@openapi';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Observable, of } from 'rxjs';

import { BookCrudComponent } from './book-crud/book-crud.component';
import { OverviewComponent } from './overview.component';

describe('OverviewComponent (Spectator)', () => {
  let spectator: Spectator<OverviewComponent>;

  const createComponent = createComponentFactory({
    component: OverviewComponent,
    imports: [TranslateModule.forRoot()],
    providers: [
      provideNoopAnimations(),
      { provide: BookstoreBffService, useValue: { getBooks: jest.fn() } },
      { provide: ConfirmationService, useValue: {} },
      { provide: MessageService, useValue: {} },
    ],
  });

  beforeEach(() => {
    spectator = createComponent();

    const mockService = spectator.inject(BookstoreBffService);
    mockService.getBooks.mockReturnValue(
      of([{ id: '1', title: 'Test Book', pageCount: 100, price: 50, onSale: true }]) as unknown as Observable<
        HttpEvent<BookDTO[]>
      >
    );
  });

  // ───────────────────────────────
  // Initialization
  // ───────────────────────────────
  describe('Initialization', () => {
    it('should create the component', () => {
      expect(spectator.component).toBeTruthy();
    });

    it('should fetch books on init', () => {
      const mockService = spectator.inject(BookstoreBffService);
      expect(mockService.getBooks).toHaveBeenCalledWith({ onSale: false });
    });
  });

  // ───────────────────────────────
  // Dialogs
  // ───────────────────────────────
  describe('Dialogs', () => {
    it('should open add book dialog and render BookCrudComponent', () => {
      spectator.component.onAddNewBook();
      spectator.detectChanges();

      expect(spectator.component.bookCrudDialogShow).toBe(true);
      expect(spectator.component.selectedBook).toBeNull();
      expect(spectator.component.crudDialogHeader).toBe('New Book');

      const crudComp = spectator.debugElement.query(By.directive(BookCrudComponent));
      expect(crudComp).toBeTruthy();
    });

    it('should open edit book dialog and render BookCrudComponent', () => {
      const book = { id: '1', title: 'Book', onSale: true } as any;
      spectator.component.onEditBook(book);
      spectator.detectChanges();

      expect(spectator.component.bookCrudDialogShow).toBe(true);
      expect(spectator.component.selectedBook).toBe(book);
      expect(spectator.component.crudDialogHeader).toBe('Edit Book');

      const crudComp = spectator.debugElement.query(By.directive(BookCrudComponent));
      expect(crudComp).toBeTruthy();
    });

    it('should open info dialog', () => {
      const book = { id: '1', title: 'Book' } as any;
      spectator.component.onViewDetails(book);

      expect(spectator.component.bookInfoDialogShow).toBe(true);
      expect(spectator.component.selectedBook).toBe(book);
    });
  });

  // ───────────────────────────────
  // Table and Filtering
  // ───────────────────────────────
  describe('Table and Filtering', () => {
    it('should filter globally using table reference', () => {
      spectator.component.dataTableElement = { filterGlobal: jest.fn() };
      const event = { target: { value: 'search' } };
      spectator.component.onFilterGlobal(event);
      expect(spectator.component.dataTableElement.filterGlobal).toHaveBeenCalledWith('search', 'contains');
    });

    it('should refresh data when getData is called', () => {
      const mockService = spectator.inject(BookstoreBffService);
      spectator.component.getData();
      expect(mockService.getBooks).toHaveBeenCalled();
    });
  });

  // ───────────────────────────────
  // Book CRUD Save
  // ───────────────────────────────
  describe('Book CRUD Save', () => {
    it('should refresh data after CRUD save', () => {
      const spy = jest.spyOn(spectator.component, 'getData');
      spectator.component.onBookCrudSave();
      expect(spy).toHaveBeenCalled();
      expect(spectator.component.bookCrudDialogShow).toBe(false);
    });
  });
});
