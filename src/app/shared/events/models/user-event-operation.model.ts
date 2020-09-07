export interface UserEventOperationModel {
  userId: number;
}

export function createOperationModel(userId: number): UserEventOperationModel {
  return { userId };
}
