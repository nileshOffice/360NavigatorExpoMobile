import { router } from 'expo-router';

import AppIcon, { IconFamily } from '@/app/common/components/ui/AppIcon';
import Button from '@/app/common/components/ui/Button/Button';
import { AppText } from '@/app/common/components/ui/Typography';
import { APP_ROUTES } from '@/app/common/config/routes';
import { Modules } from '@/app/common/constants/global_enum';
import { resetHeader, setHeader } from '@/app/common/hooks/headerSlice';
import { useAppDispatch, useAppSelector } from '@/app/lib/store/hooks';
import { RootState } from '@/app/lib/store/store';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Image, ScrollView, View } from 'react-native';
import { useGetAssetUpdateFieldByClientsQuery, useLazyGetFileListByObjectIdQuery } from '../api/walkdownApi';
import { AssetSection } from '../formConfig/assetForm.types';
import { mapSelectedAssetUpdatedToForm } from '../formConfig/formConfig';
import { updateAssetField as assetAssetFormAction, setUpdateAssetForm } from '../redux/walkDownSlice/assetFormSlice';



const UpdateDeleteAsset = () => {

    const assetForm = useAppSelector((state: RootState) => state.assetForm);
    const selectedAssetData = useAppSelector(
        state => state.selectedAssetData
    );
    const dispatch = useAppDispatch();
    const { currentUser, selectedSite } = useAppSelector((state) => state.auth);


    console.log('selectedAssetData', assetForm)

    useEffect(() => {

        dispatch(
            setHeader({
                title: 'Submit Asset',
                showBack: true,
                showMenu: false,
                showLogo: false,
                backAction: 'goBack',
            })
        );

        return () => {
            dispatch(resetHeader());
        };

    }, [dispatch]);


    // =========================================================
    // GET BACKEND FIELD CONFIGURATION
    // =========================================================


    // =========================================================
    // ASSET FIELD API DTO
    // =========================================================

    const fieldApiDto = useMemo(
        () => ({
            id21: currentUser?.siteId,
            id: selectedSite?.orgid,
            id1: selectedAssetData?.id?.toString() || "",
            id22: 1,
            id23: currentUser?.userId,
        }),
        [currentUser?.siteId, currentUser?.userId, selectedSite?.orgid, selectedAssetData?.id],
    );



    const {
        data: myAssetUpdateFields = [],
        isLoading: isFieldsLoading,
        isFetching: isFieldsFetching,
        isError: isFieldsError,
    } = useGetAssetUpdateFieldByClientsQuery(fieldApiDto);

    console.log('myAssetUpdateFields', myAssetUpdateFields)





    useEffect(() => {
        if (!selectedAssetData?.id) return;

        if (!myAssetUpdateFields?.length) return;

        const mappedForm = mapSelectedAssetUpdatedToForm(
            myAssetUpdateFields,
        );

        dispatch(setUpdateAssetForm(mappedForm));
    }, [
        selectedAssetData?.id,
        myAssetUpdateFields,
        dispatch,
    ]);







    const [
        getFileListByObjectId,
        {
            currentData: uploadedImages,
            isLoading: isUploadedImagesLoading,
            isFetching: isUploadedImagesFetching,
        },
    ] = useLazyGetFileListByObjectIdQuery();
    const hydratedImagesAssetId = useRef<number | null>(null);

    useEffect(() => {
        if (!selectedAssetData?.id) return;
        getFileListByObjectId(
            {
                id: "A",
                id21: Modules.BPMOOptimization,
                id22: 0,
                id23: selectedAssetData?.id || 0,
            }
        );
    }, [selectedAssetData?.id, getFileListByObjectId])

    useEffect(() => {
        if (!selectedAssetData?.id || !uploadedImages) return;
        if (hydratedImagesAssetId.current === selectedAssetData.id) return;
        hydratedImagesAssetId.current = selectedAssetData.id;

        const currentPhotos = assetForm?.updateAssetForm?.custom?.uploadePhotos ?? [];
        if (currentPhotos.length > 0) return;

        const existingPhotos = uploadedImages.flatMap((image) => {
            const filePath = image.url;
            if (!filePath) return [];

            const uri = filePath
                ? filePath
                : `${filePath.replace(/\/$/, '')}/${filePath.replace(/^\/+/, '')}`;

            return [{
                id: String(image.id ?? image.fileName ?? filePath),
                uri,
                fileName: image.fileName ?? image.displayName ?? null,
            }];
        });

        if (existingPhotos.length > 0) {
            dispatch(
                assetAssetFormAction({
                    section: "custom",
                    field: "uploadePhotos",
                    value: existingPhotos,
                }),
            );
        }
    }, [
        uploadedImages,
        selectedAssetData?.id,
        assetForm?.updateAssetForm?.custom?.uploadePhotos,
        dispatch,
    ]);



    // =========================================================
    // SECTION INFORMATION
    // =========================================================

    const getSectionInformation = useCallback(
        (
            section: AssetSection,
        ): {
            title: string;
            description: string;
            icon: string;
            family: IconFamily;
        } => {
            switch (section) {
                case "general":
                    return {
                        title: "General Information",
                        description: "Enter the basic information about asset",
                        icon: "information-outline",
                        family: "MaterialCommunityIcons",
                    };

                case "location":
                    return {
                        title: "Location Information",
                        description: "Specify where the asset is located",
                        icon: "location-outline",
                        family: "Ionicons",
                    };

                case "custom":
                    return {
                        title: "Upload Photos",
                        description: "Add photos of the asset",
                        icon: "camera-outline",
                        family: "Ionicons",
                    };


                case "classification":
                    return {
                        title: "Classification",
                        description: "Define asset classification information",
                        icon: "tag-outline",
                        family: "MaterialCommunityIcons",
                    };

                case "technical":
                    return {
                        title: "Manufacturer & Technical Details",
                        description: "Enter manufacturer and technical information",
                        icon: "cog-outline",
                        family: "MaterialCommunityIcons",
                    };


                default:
                    return {
                        title: "Additional Information",
                        description: "Enter additional information",
                        icon: "information",
                        family: "MaterialCommunityIcons",
                    };
            }
        },
        [],
    );


    const buildReviewPayload = useCallback(() => {
        const reviewData = {
            general: {
                assetName: {
                    original:
                        assetForm?.updateAssetForm?.general
                            ?.originalAssetName || "Not selected",

                    updated:
                        assetForm?.updateAssetForm?.general
                            ?.updatedAssetName || "Not selected",
                },
            },

            location: {
                location: {
                    original:
                        assetForm?.updateAssetForm?.location
                            ?.originalLocation?.name ?? "Not selected",

                    updated:
                        assetForm?.updateAssetForm?.location
                            ?.updatedLocation?.name ?? "Not selected",
                },
            },

            classification: {
                assetType: {
                    original:
                        assetForm?.updateAssetForm?.classification
                            ?.originalAssetType?.name ?? "Not selected",

                    updated:
                        assetForm?.updateAssetForm?.classification
                            ?.updatedAssetType?.name ?? "Not selected",
                },

                assetClass: {
                    original:
                        assetForm?.updateAssetForm?.classification
                            ?.originalAssetClass?.name ?? "Not selected",

                    updated:
                        assetForm?.updateAssetForm?.classification
                            ?.updatedAssetClass?.name ?? "Not selected",
                },

                serialNumber: {
                    original:
                        assetForm?.updateAssetForm?.classification
                            ?.originalSerialNumber || "Not selected",

                    updated:
                        assetForm?.updateAssetForm?.classification
                            ?.updatedSerialNumber || "Not selected",
                },
            },

            technical: {
                manufacturer: {
                    original:
                        assetForm?.updateAssetForm?.technical
                            ?.originalManufacturer?.name ?? "Not selected",

                    updated:
                        assetForm?.updateAssetForm?.technical
                            ?.updatedManufacturer?.name ?? "Not selected",
                },

                model: {
                    original:
                        assetForm?.updateAssetForm?.technical
                            ?.originalModel || "Not selected",

                    updated:
                        assetForm?.updateAssetForm?.technical
                            ?.updatedModel || "Not selected",
                },

                installedDate: {
                    original:
                        assetForm?.updateAssetForm?.technical
                            ?.originalInstalledDate ?? "Not selected",

                    updated:
                        assetForm?.updateAssetForm?.technical
                            ?.updatedInstalledDate ?? "Not selected",
                },
            },

            custom: {
                uploadedPhotosCount:
                    assetForm?.updateAssetForm?.custom
                        ?.uploadePhotos?.length ?? 0,
            },
        };

        return reviewData;
    }, [assetForm]);



    const renderReviewScreen = useCallback(() => {
        const reviewData = buildReviewPayload();


        const uploadedPhotos = assetForm?.updateAssetForm?.custom.uploadePhotos ?? [];

        return (
            <>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingVertical: 12,
                        paddingBottom: 24,
                        flexGrow: 1,
                    }}
                    style={{ flex: 1 }}
                >
                    <View className="gap-2">
                        {/* <View className="rounded-2xl border border-slate-200 bg-slate-50 p-2 px-4">
                        <Heading level={5}>Review & Update</Heading>
                        <AppText variant="caption" className="mt-1 text-slate-500">
                            Please review the asset information before saving.
                        </AppText>
                    </View> */}

                        {Object.entries(reviewData).map(([sectionKey, sectionValue]) => {
                            const sectionConfig = getSectionInformation(sectionKey as AssetSection);
                            const sectionTitle =
                                sectionKey === "general"
                                    ? "General Information"
                                    : sectionKey === "location"
                                        ? "Location"
                                        : sectionKey === "classification"
                                            ? "Classification"
                                            : sectionKey === "technical"
                                                ? "Technical Details"
                                                : `Asset Images (${uploadedPhotos.length})`;

                            return (
                                <View
                                    key={sectionKey}
                                    className="rounded-2xl border border-slate-200 bg-white p-2 px-4"
                                >
                                    <View className="mb-3 flex-row items-center gap-2">
                                        <View className="h-7 w-7 items-center justify-center rounded-lg bg-primary-light">
                                            <AppIcon
                                                name={sectionConfig.icon}
                                                family={sectionConfig.family}
                                                size={18}
                                                color="#2563EB"
                                            />
                                        </View>

                                        <AppText variant="bodyLarge" weight="semibold" className="text-slate-800">
                                            {sectionTitle}
                                        </AppText>
                                    </View>

                                    {sectionKey === "custom" ? (
                                        uploadedPhotos.length > 0 ? (
                                            <ScrollView
                                                horizontal
                                                showsHorizontalScrollIndicator={false}
                                                contentContainerStyle={{ gap: 10 }}
                                            >
                                                {uploadedPhotos.map((photo) => (
                                                    <Image
                                                        key={photo.id}
                                                        source={{ uri: photo?.uri }}
                                                        accessibilityLabel={
                                                            photo.fileName ?? "Selected asset photo"
                                                        }
                                                        className="h-24 w-24 rounded-xl bg-slate-100"
                                                        resizeMode="cover"
                                                    />
                                                ))}
                                            </ScrollView>
                                        ) : (
                                            <AppText className="text-slate-500">
                                                No images selected
                                            </AppText>
                                        )
                                    ) : (
                                        Object.entries(
                                            sectionValue as Record<string, any>
                                        ).map(([fieldKey, fieldValue]) => {
                                            const originalValue = fieldValue?.original;
                                            const updatedValue = fieldValue?.updated;

                                            return (
                                                <View
                                                    key={fieldKey}
                                                    className="mb-3 flex-col gap-3"
                                                >
                                                    {/* FIELD NAME + STATUS */}
                                                    <View className="flex-row items-center justify-between">
                                                        <View className="w-[72%]">
                                                            <AppText className="flex-1 text-slate-500">
                                                                {fieldKey
                                                                    .replace(/([A-Z])/g, " $1")
                                                                    .replace(/^./, (char) =>
                                                                        char.toUpperCase()
                                                                    )}
                                                            </AppText>
                                                        </View>

                                                        <View className="w-[22%] flex-1 items-center rounded-3xl border border-green-200 bg-green-100 p-1 px-2">
                                                            <AppText
                                                                variant="bodySmall"
                                                                weight="medium"
                                                                className="text-green-800!"
                                                            >
                                                                Unchanged
                                                            </AppText>
                                                        </View>
                                                    </View>

                                                    {/* ORIGINAL / UPDATED VALUES */}
                                                    <View className="flex-row items-center justify-between rounded-lg bg-slate-100 p-2 px-4">

                                                        {/* ORIGINAL */}
                                                        <View className="w-1/2 flex-col gap-2 pr-2">
                                                            <AppText
                                                                variant="bodySmall"
                                                                weight="semibold"
                                                            >
                                                                Original
                                                            </AppText>

                                                            <AppText
                                                                className="text-slate-800"
                                                                numberOfLines={2}
                                                            >
                                                                {originalValue ?? "Not selected"}
                                                            </AppText>
                                                        </View>

                                                        {/* UPDATED */}
                                                        <View className="w-1/2 flex-col gap-2 pl-2">
                                                            <AppText
                                                                variant="bodySmall"
                                                                weight="semibold"
                                                            >
                                                                Updated
                                                            </AppText>

                                                            <AppText
                                                                className="text-slate-800"
                                                                numberOfLines={2}
                                                            >
                                                                {updatedValue ?? "Not selected"}
                                                            </AppText>
                                                        </View>

                                                    </View>
                                                </View>
                                            );
                                        })
                                    )}
                                </View>
                            );
                        })}
                    </View>
                </ScrollView>

                <View className=" flex-col gap-3 py-3">
                    <View className="flex-row gap-3 justify-around">
                        <Button variant="outline" className="border border-error" >
                            <View className="flex-row items-center justify-center gap-2">
                                <AppIcon
                                    name="trash-can-outline"
                                    family="MaterialCommunityIcons"
                                    color="#EF4444"
                                    size={18}
                                />
                                <AppText className="text-error! font-bold" >Delete Asset</AppText>
                            </View>

                        </Button>
                        <Button className=""  onPress={() => { router.push(APP_ROUTES.updateAssetDetail)}}>
                            <View className="flex-row items-center justify-center gap-2">
                                <AppIcon
                                    name="pencil-outline"
                                    family="MaterialCommunityIcons"
                                    color="#fff"
                                    size={18}
                                />
                                <AppText variant="body" weight="semibold" className="text-white">
                                    Update Assets
                                </AppText>

                            </View>
                        </Button>
                    </View>
                    <Button>
                        <View className="flex-row items-center justify-center gap-2">
                            <AppIcon
                                name="check"
                                family="MaterialCommunityIcons"
                                color="#fff"
                                size={20}
                            />
                            <AppText variant="body" weight="semibold" className="text-white">
                                Submit Asset
                            </AppText>

                        </View>
                    </Button>

                </View>
            </>




        );
    }, [assetForm?.updateAssetForm?.custom.uploadePhotos, buildReviewPayload, getSectionInformation]);




    return (
        <>

            {renderReviewScreen()}



        </>
    )
}

export default UpdateDeleteAsset;
