export interface IdDto {
  id21: number;
  id22: number;
  id23: number;
  id24: number;
  id: string;
  id25: number;
  id26: number;
}

export interface IdDto1 {
  id: any;
  id21: number;
  id22: any;
  id1: any;
  id2: string;
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

export interface AssetListByActivity {
  aX_AssetClass: string | null;
  aX_AssetName: string | null;
  aX_AssetType: string | null;
  aX_CurrentCondition: string | null;
  aX_InstalledDate: string | null;
  aX_Location: string | null;
  aX_LocationDescription: string | null;
  aX_MakeModel: string | null;
  aX_Manufacturer: string | null;
  aX_Ref_Parent_Number: string | null;
  aX_SerialNum: string | null;
  aX_Specifications: string | null;
  aX_StatusName: string | null;
  aX_Vendor: string | null;

  activityId: string | null;
  additionalInformation: string | null;
  assetBucketStatus: string | null;
  assetClass: string | null;
  assetClasswiseSeparatorFlag: number | null;
  assetCurrentCondition: string | null;
  assetNum: string | null;
  assetProgressStatus: number | null;
  assetType: string | null;
  classStructureId: string | null;

  comment_AssetClass: string | null;
  comment_AssetType: string | null;
  comment_CurrentCondtion: string | null;
  comment_InstalledYear: string | null;
  comment_IsMovable: string | null;
  comment_Location: string | null;
  comment_Manufacturer: string | null;
  comment_Model: string | null;
  comment_Name: string | null;
  comment_ParentAsset: string | null;
  comment_SerialNo: string | null;
  comment_Specification: string | null;
  comment_Status: string | null;
  comment_TFAssetNum: string | null;
  comment_Vendor: string | null;
  comment_WalkDownComment: string | null;

  currentcondition: string | null;
  eCRRanking: string | null;

  id: number;

  installedDate: string | null;
  isAssetExist: boolean | null;
  isAssetOrInstrument: string | null;
  isAssetOrSystem: boolean;
  isMovable: boolean | null;
  isNew: boolean | null;
  isStandaloneAsset: boolean;
  isVerifyData: boolean | null;

  location: string | null;
  locationDescription: string | null;
  makeModel: string | null;
  manufacturer: string | null;
  manufacturerId: string | null;
  name: string | null;
  notes: string | null;

  parentAsset: string | null;
  parentAssetName: string | null;
  ref_Id: string | null;

  serialNum: string | null;
  specification: string | null;
  statusId: string | null;
  statusName: string | null;

  suggestedActionId_AssetClass: string | null;
  suggestedActionId_AssetType: string | null;
  suggestedActionId_CurrentCondtion: string | null;
  suggestedActionId_InstalledYear: string | null;
  suggestedActionId_IsMovable: string | null;
  suggestedActionId_Location: string | null;
  suggestedActionId_Manufacturer: string | null;
  suggestedActionId_Model: string | null;
  suggestedActionId_Name: string | null;
  suggestedActionId_ParentAsset: string | null;
  suggestedActionId_SerialNo: string | null;
  suggestedActionId_Specification: string | null;
  suggestedActionId_Status: string | null;
  suggestedActionId_TFAssetNum: string | null;
  suggestedActionId_Vendor: string | null;
  suggestedActionId_WalkDownComment: string | null;

  tF_AssetNum: string | null;
  vendor: string | null;
  vendorDescription: string | null;
}

export interface AssetColumn {
  aXColunmName: string;
  aXColunmNameData: string | null;
  assetnum: string | null;
  category: number;
  colorIndicator: number;
  colunmName: string;
  colunmNameData: string | null;
  displayColnumName: string;
  displayOrder: number;
  flag: number;
  id: number;
  isMandatory: number;
  suggested: string | null;
  suggestedname: string | null;
}
