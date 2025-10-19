import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { TranslateModule } from '@ngx-translate/core';
import { BookDTO, BookstoreBffService } from '@openapi';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { Observable } from 'rxjs';

import { ColumnFieldType, DataTableColumn } from '../domain/models/data-table-col-type.model';
import { BookCrudComponent } from './book-crud/book-crud.component';

@Component({
  selector: 'mxs-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    MatCardModule,
    TableModule,
    DialogModule,
    ToggleSwitchModule,
    BookCrudComponent,
  ],
})
export class OverviewComponent implements OnInit {
  @ViewChild('dt') dataTableElement: any;

  constructor(private bookstoreService: BookstoreBffService) {
    this.selectedBook = null;
    this.cols = [
      { header: 'Title', field: 'title' },
      { header: 'Page Count', field: 'pageCount' },
      { header: 'Price', field: 'price', type: ColumnFieldType.currency },
      { header: 'On Sale', field: 'onSale', type: ColumnFieldType.checkbox },
    ];

    // filter on every column
    this.globalFilterFields = this.cols.map(x => x.field!);
  }

  getAllBooks$: Observable<BookDTO[]> | null = null;

  cols: DataTableColumn[];
  selectedBook: BookDTO | null;
  globalFilterFields: string[];
  onSaleFilterValue: boolean = false;

  //info dialog
  bookInfoDialogShow: boolean = false;

  // crud dialog
  crudDialogHeader: string = '';
  bookCrudDialogShow: boolean = false;

  ngOnInit(): void {
    this.getData();
  }

  getData() {
    this.getAllBooks$ = this.bookstoreService.getBooks({ onSale: this.onSaleFilterValue });
  }

  onFilterGlobal(event: any) {
    this.dataTableElement.filterGlobal(event.target.value, 'contains');
  }

  onViewDetails(selection: BookDTO) {
    this.selectedBook = selection;
    this.bookInfoDialogShow = true;
  }

  onAddNewBook() {
    this.crudDialogHeader = 'New Book';
    this.selectedBook = null;
    this.bookCrudDialogShow = true;
  }

  onEditBook(selection: any) {
    this.crudDialogHeader = 'Edit Book';
    this.selectedBook = selection;
    this.bookCrudDialogShow = true;
  }

  onBookCrudSave() {
    this.bookCrudDialogShow = false;
    this.getData();
  }
}
