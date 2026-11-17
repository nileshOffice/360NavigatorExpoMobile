
import AppIcon, { IconFamily } from '@/src/common/components/ui/AppIcon';
import Button from '@/src/common/components/ui/Button/Button';
import { useToast } from '@/src/common/components/ui/toast/ToastProvider';
import { AppText } from '@/src/common/components/ui/Typography';
import { APP_ROUTES } from '@/src/common/config/routes';
import { Modules } from '@/src/common/constants/global_enum';
import { useScreenHeader } from '@/src/common/hooks/useScreenHeader';
import { useAppDispatch, useAppSelector } from '@/src/lib/store/hooks';
import { RootState } from '@/src/lib/store/store';
import { useGetAssetUpdateFieldByClientsQuery, useGetFileListByObjectIdQuery, useUpdateAssetStatusForDataCleansingMutation, walkdownApi } from '@/src/main/modules/walkdown/api/walkdownApi';
import { AssetSection } from '@/src/main/modules/walkdown/formConfig/assetForm.types';
import { getMissingMandatoryFields, mapSelectedAssetUpdatedToForm } from '@/src/main/modules/walkdown/formConfig/formConfig';
import { setUpdateAssetForm } from '@/src/main/modules/walkdown/redux/walkDownSlice/assetFormSlice';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, View } from 'react-native';



const UpdateDeleteAsset = () => {

    const assetForm = useAppSelector((state: RootState) => state.assetForm);
    const selectedAssetData = useAppSelector(
        state => state.selectedAssetData
    );
    const dispatch = useAppDispatch();
    const { currentUser, selectedSite } = useAppSelector((state) => state.auth);
    const assetId = selectedAssetData?.id ?? null;

    useScreenHeader({ title: 'Submit Asset', showBack: true, showMenu: false, showLogo: false, backAction: 'goBack', });

    // =========================================================
    // BACKEND FIELD CONFIGURATION + EXISTING PHOTOS
    // =========================================================

    const fieldApiDto = useMemo(
        () => ({
            id21: currentUser?.siteId,
            id: selectedSite?.orgid,
            id1: assetId?.toString() || "",
            id22: 1,
            id23: currentUser?.userId,
        }),
        [currentUser?.siteId, currentUser?.userId, selectedSite?.orgid, assetId],
    );

    const {
        data: myAssetUpdateFields,
        isLoading: isFieldsLoading,
        isError: isFieldsError,
        refetch: refetchFields,
    } = useGetAssetUpdateFieldByClientsQuery(fieldApiDto, { skip: !assetId });

    const {
        data: uploadedImages,
        isLoading: isImagesLoading,
    } = useGetFileListByObjectIdQuery(
        {
            id: "A",
            id21: Modules.BPMOOptimization,
            id22: 0,
            id23: Number(assetId ?? 0),
        },
        { skip: !assetId },
    );

    /**
     * Builds the update form (fields + photos) for the selected asset in one
     * step, every time this screen gains focus.
     *
     * Previously fields and photos were hydrated by two separate effects and
     * photos were skipped when the form "already had photos", so opening a
     * second asset could show the first asset's photos. Re-hydrating on focus
     * also restores the form after "Discard changes" on the update screen.
     */
    const hydrateForm = useCallback(() => {
        if (!assetId || !myAssetUpdateFields?.length || !uploadedImages) {
            return;
        }

        const mappedForm = mapSelectedAssetUpdatedToForm(myAssetUpdateFields);
        mappedForm.custom.uploadePhotos = uploadedImages.flatMap((image) =>
            image.url
                ? [{
                    id: String(image.id ?? image.fileName ?? image.url),
                    uri: image.url,
                    fileName: image.fileName ?? image.displayName ?? null,
                }]
                : [],
        );

        dispatch(setUpdateAssetForm(mappedForm));
    }, [assetId, myAssetUpdateFields, uploadedImages, dispatch]);

    useFocusEffect(hydrateForm);

    const isPreparing = !!assetId && (isFieldsLoading || isImagesLoading);

    // =========================================================
    // SUBMIT ASSET
    // =========================================================

    const { danger, success } = useToast();
    const [updateAssetStatusForDataCleansing] = useUpdateAssetStatusForDataCleansingMutation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const companyId = Number(currentUser?.companyId);
    const siteId = Number(currentUser?.siteId);
    const userId = Number(currentUser?.userId);

    const submitAsset = useCallback(async () => {
        if (isSubmitting || !assetId) return;
        setIsSubmitting(true);

        try {
            // Validate against the server's current values: the cached fields
            // can be stale right after the asset was edited on the update screen.
            const latestFields = await dispatch(
                walkdownApi.endpoints.getAssetUpdateFieldByClients.initiate(fieldApiDto, {
                    forceRefetch: true,
                    subscribe: false,
                }),
            ).unwrap();

            const missingFields = getMissingMandatoryFields(latestFields);
            if (missingFields.length > 0) {
                danger({
                    title: "Mandatory Fields Missing",
                    message: `${missingFields.join(", ")} field(s) are mandatory. Please fill all mandatory fields before completing the selected assets.`,
                    duration: 6000,
                });
                return;
            }

            const isCompleted = await updateAssetStatusForDataCleansing({
                id21: 3,
                id22: null,
                id25: companyId,
                id26: siteId,
                id27: userId,
                id1: assetId.toString(),
            }).unwrap();

            if (isCompleted === false) {
                throw new Error("Server returned false");
            }

            success({
                title: "Asset Submitted",
                message: "Completed successfully!",
                duration: 5000,
            });

            // Back to the list (refreshed through the invalidated tags).
            if (router.canDismiss()) {
                router.dismissTo(APP_ROUTES.assetAssignment);
            } else {
                router.replace(APP_ROUTES.assetAssignment);
            }
        } catch (error) {
            if (__DEV__) console.warn("Submit asset error:", error);

            danger({
                title: "Submit Failed",
                message: "Unable to submit asset. Please try again.",
                duration: 5000,
            });
        } finally {
            setIsSubmitting(false);
        }
    }, [isSubmitting, assetId, dispatch, fieldApiDto, danger, success, updateAssetStatusForDataCleansing, companyId, siteId, userId]);

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
                        paddingBottom: 20,
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
                                            const isChanged =
                                                String(originalValue ?? '').trim() !==
                                                String(updatedValue ?? '').trim();

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

                                                        <View className={`w-[22%] flex-1 items-center rounded-3xl border p-1 px-2 ${isChanged ? 'border-amber-200 bg-amber-50' : 'border-green-200 bg-green-100'}`}>
                                                            <AppText
                                                                variant="bodySmall"
                                                                weight="medium"
                                                                className={isChanged ? 'text-amber-800!' : 'text-green-800!'}
                                                            >
                                                                {isChanged ? 'Changed' : 'Unchanged'}
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
                        {/* TODO: no delete endpoint wired yet - disabled instead of a dead button. */}
                        {/* <Button variant="outline" className="border border-error" disabled>
                            <View className="flex-row items-center justify-center gap-2">
                                <AppIcon
                                    name="trash-can-outline"
                                    family="MaterialCommunityIcons"
                                    color="#EF4444"
                                    size={18}
                                />
                                <AppText className="text-error! font-bold" >Delete Asset</AppText>
                            </View>

                        </Button> */}
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
                        <Button loading={isSubmitting} onPress={submitAsset}>
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
                   

                </View>
            </>




        );
    }, [assetForm?.updateAssetForm?.custom.uploadePhotos, buildReviewPayload, getSectionInformation, isSubmitting, submitAsset]);




    if (!assetId) {
        return (
            <View className="flex-1 items-center justify-center">
                <AppText className="text-slate-500">No asset selected.</AppText>
            </View>
        );
    }

    if (isPreparing) {
        return (
            <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#2563EB" />
                <AppText className="mt-3">Loading asset...</AppText>
            </View>
        );
    }

    if (isFieldsError) {
        return (
            <View className="flex-1 items-center justify-center gap-4">
                <AppText className="text-slate-500">Unable to load the asset.</AppText>
                <Button title="Retry" onPress={refetchFields} />
            </View>
        );
    }

    return (
        <>

            {renderReviewScreen()}



        </>
    )
}

export default UpdateDeleteAsset;
