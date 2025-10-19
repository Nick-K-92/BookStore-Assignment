export enum ColumnFieldType {
  text = 'text',
  checkbox = 'checkbox',
  date = 'date',
  currency = 'currency',
}

export class DataTableColumn {
  field?: string;
  header?: string;
  type?: ColumnFieldType;
}
