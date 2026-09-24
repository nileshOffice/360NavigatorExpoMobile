import { api as baseApi } from "@/app/lib/api/baseApi";
import { AssetColumn, AssetWalkDownActivity, IdDto, IdDto1 } from "./walkdownApi.types";

type LocationHierarchyResponse = any[]
    | {
        data?: any[];
        result?: any[];
    };


type ClientClassStructureResponse = any[]
    | {
        data?: any[];
        result?: any[];
    };

export interface AssetInformation {
    id: any;
    keyName: string;
    value: string | null;
    flag: number;
    aXColumn: string;
    aXValue: string | null;
    isChange: number;
    existsFlag: number;
    nullConditionCheck: number;
    isMandatory: number;
}

export interface SaveAssetWalkDownDetailsRequest {
  id21: number;
  id22: number;
  id23: number;
  id: string;
  id24: number;
}

export interface InsertAssetDocumentsRequest {
  id32: number;
  id21: number;
  id67: string;
  idArrayStr: string[];
  id22: number;
}



export const worlkdownApi = baseApi.injectEndpoints({
    endpoints: builder => ({
        getAssetWalkDownActivityList: builder.query<AssetWalkDownActivity[], IdDto>({
            query: idDto => ({
                url: '/api/dqa/getAssetWalkDownActivityList',
                method: 'POST',
                body: idDto,
            }),
        }),


        getAssetListByActivityId: builder.query<any[], {id21:number,id22:number ,id23:number}>({
            query: idDto => ({
                url: '/api/dqa/getAssetListByActivityId',
                method: 'POST',
                body: idDto,
            }),
        }),

         getAssetUpdateFieldByClients: builder.query<AssetColumn[], {id21:string,id:any ,id1:any,id22:any,id23:any}>({
           
            query: idDto => ({ 
                url: '/api/dqa/getAssetUpdateFieldByClients',
                method: 'POST',
                body: idDto,
            }),
        }),

        getLocationHierarchyBySidId: builder.query<LocationHierarchyResponse,{ id: any }>({
            query: (idDto) => ({
                url: '/api/dqa/getLocationHierarchyBySidId',
                method: 'POST',
                body: idDto,
            }),
        }),

        getClientClassStructureData: builder.query<ClientClassStructureResponse, { id: any }>({
            query: (idDto) => ({
                url: '/api/dqa/getClientClassStructureData',
                method: 'POST',
                body: idDto,
            }),
        }),

        getMasterDataUpdateAssetInformation: builder.query<AssetInformation[], IdDto1>({
            query: (idDto) => ({
                url: '/api/dqa/getMasterDataUpdateAssetInformation',
                method: 'POST',
                body: idDto,
            }),
        }),

        saveAssetWalkDownDetails: builder.mutation<any, SaveAssetWalkDownDetailsRequest>({
            query: (payload) => ({
                url: "/api/dqa/saveAssetWalkDownDetails",
                method: "POST",
                body: payload,
            }),
        }),

        insertAssetDocuments: builder.mutation< any,InsertAssetDocumentsRequest>({
            query: (payload) => ({
                url: "/api/pmo/insertAssetDocuments",
                method: "POST",
                body: payload,
            }),
        }),



    }),
});

export const {
    useGetAssetWalkDownActivityListQuery,
    useGetAssetListByActivityIdQuery,
    useGetAssetUpdateFieldByClientsQuery,
    useGetLocationHierarchyBySidIdQuery,
    useGetClientClassStructureDataQuery,
    // useGetMasterDataUpdateAssetInformationQuery,
    useLazyGetMasterDataUpdateAssetInformationQuery,
    useSaveAssetWalkDownDetailsMutation,
    useInsertAssetDocumentsMutation
} = worlkdownApi;