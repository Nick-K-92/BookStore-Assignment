import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BookCreateDTO, BookDTO, BookstoreBffService, BookUpdateDTO } from '@openapi';
import { ConfirmationService, MessageService } from 'primeng/api';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

@Component({
  selector: 'mxs-book-crud',
  imports: [CommonModule, ReactiveFormsModule, ToggleSwitchModule, InputGroupModule, InputGroupAddonModule],
  templateUrl: './book-crud.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookCrudComponent implements OnInit {
  @Input() book: BookDTO | null = null;

  @Output() save: EventEmitter<any> = new EventEmitter();
  @Output() cancelAction: EventEmitter<any> = new EventEmitter();

  constructor(
    private bookstoreBffService: BookstoreBffService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  form: FormGroup | null = null;
  ngOnInit() {
    if (this.book) {
      this.form = new FormGroup({
        title: new FormControl('', Validators.required),
        lastUpdated: new FormControl(''),
        onSale: new FormControl(false, Validators.required),
        pageCount: new FormControl('', [Validators.min(0)]),
        price: new FormControl('', [Validators.min(0)]),
        author: new FormControl(''),
      });

      this.form.patchValue(this.book);
    } else {
      this.form = new FormGroup({
        title: new FormControl('', Validators.required),
        onSale: new FormControl(false, Validators.required),
        pageCount: new FormControl('', [Validators.min(0)]),
        price: new FormControl('', [Validators.min(0)]),
        author: new FormControl(''),
      });
    }
  }

  onSubmit() {
    this.confirmationService.confirm({
      header: this.book != null ? 'Update Book' : 'Add Book',
      message: 'Are you sure you want to continue?',
      icon: 'fas fa-exclamation-circle',
      accept: () => {
        this.submit();
      },
    });
  }

  submit() {
    if (this.book) {
      const bookUpdateDto: BookUpdateDTO = this.form!.value;
      this.bookstoreBffService.updateBook({ bookId: this.book.id, bookUpdateDTO: bookUpdateDto }).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Book Updated!' });
          this.save.emit();
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Ooops', detail: 'Something went wrong!' });
        },
      });
    } else {
      const bookCreateDto: BookCreateDTO = this.form!.value;
      this.bookstoreBffService.createBook({ bookCreateDTO: bookCreateDto }).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Book Saved!' });
          this.save.emit();
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Ooops', detail: 'Something went wrong!' });
        },
      });
    }
  }

  onDelete() {
    if (!this.book) return;

    this.confirmationService.confirm({
      header: 'Delete Book',
      message: 'Are you sure you want to delete this book?',
      icon: 'fas fa-exclamation-circle',
      accept: () => {
        this.bookstoreBffService.deleteBook({ bookId: this.book?.id! }).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Book Deleted!' });
            this.save.emit();
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Ooops', detail: 'Something went wrong!' });
          },
        });
      },
    });
  }

  onCancel() {
    this.cancelAction.emit();
  }
}
