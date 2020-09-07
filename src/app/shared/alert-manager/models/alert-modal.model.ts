export interface AlertModalModel {
  id?: number;
  type: AlertModalType;
  message: string;
  dismiss?: boolean;
  timeout?: number;
}

type AlertModalType = 'success' | 'danger' | 'info' | 'warning';

export function createListErrorAlert(message: string): AlertModalModel {
  return {
    dismiss: true,
    type: 'danger',
    message
  };
}

export function createFormSuccessAlert(message: string): AlertModalModel {
  return createFormAlert('success', message);
}

export function createFormErrorAlert(message: string): AlertModalModel {
  return createFormAlert('danger', message);
}

function createFormAlert(type: AlertModalType, message: string): AlertModalModel {
  return {
    dismiss: true,
    timeout: 5000,
    type,
    message
  };
}
