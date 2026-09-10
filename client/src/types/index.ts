export interface RequestDto {
  id: string;
  name: string;
  payload: string;
  type: string;
  status: 'Pending' | 'Processed' | 'Failed';
  createdAt: string;
}

export interface CreateRequestCommand {
  name: string;
  payload: string;
  type: string;
}

export interface OfflineRequestItem extends CreateRequestCommand {
  localId?: number;
  createdAt: string;
  synced: boolean;
}