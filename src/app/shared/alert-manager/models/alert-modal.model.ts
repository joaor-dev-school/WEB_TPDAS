export interface AlertModalModel {
  id: number;
  type: 'success' | 'danger' | 'info' | 'warning';
  message: string;
  timeout?: number;
}
