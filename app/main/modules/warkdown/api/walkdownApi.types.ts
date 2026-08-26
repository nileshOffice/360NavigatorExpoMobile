export interface IdDto {
  id21: number;
  id22: number;
  id23: number;
  id24: number;
  id: string;
  id25: number;
  id26: number;
}

export interface AssetWalkDownActivity {
  id: number;
  woId: string;
  userId: number;
  userName: string;
  scheduleDate: string;
  description: string;
  assetCount: number;
  status: string;
  statusId: number;
  inprogress: number;
  completed: number;
  approve: number;
  cmms: number;
}



export interface AssetListByActivityId {
    id: number;
    woId: string;
    userId: number;
    userName: string;
    scheduleDate: string;
    description: string;
    assetCount: number;
    status: string;
    statusId: number;
    inprogress: number;
    completed: number;
    approve: number;
    cmms: number;
}