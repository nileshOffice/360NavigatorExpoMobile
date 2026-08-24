import { api as baseApi } from "@/app/lib/api/baseApi";



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

export const worlkdownApi = baseApi.injectEndpoints({
    endpoints: builder => ({
        getAssetWalkDownActivityList: builder.query<AssetWalkDownActivity[], IdDto>({
            query: idDto => ({
                url: '/api/dqa/getAssetWalkDownActivityList',
                method: 'POST',
                body: idDto,
            }),
        })
    })
})



export const {useGetAssetWalkDownActivityListQuery} = worlkdownApi