import { api as baseApi } from "@/app/lib/api/baseApi";
import { AssetListByActivityId, AssetWalkDownActivity, IdDto } from "./walkdownApi.types";





export const worlkdownApi = baseApi.injectEndpoints({
    endpoints: builder => ({
        getAssetWalkDownActivityList: builder.query<AssetWalkDownActivity[], IdDto>({
            query: idDto => ({
                url: '/api/dqa/getAssetWalkDownActivityList',
                method: 'POST',
                body: idDto,
            }),
        }),


        getAssetListByActivityId: builder.query<AssetListByActivityId[], {id21:number,id22:number ,id23:number}>({
            query: idDto => ({
                url: '/api/dqa/getAssetListByActivityId',
                method: 'POST',
                body: idDto,
            }),
        })


    })
})



export const {useGetAssetWalkDownActivityListQuery , useGetAssetListByActivityIdQuery} = worlkdownApi