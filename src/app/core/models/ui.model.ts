export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
  durationMs: number;
}

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'danger';
  icon?: string;
}

export interface PageQuery {
  pageIndex: number;
  pageSize: number;
  searchTerm?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
}
