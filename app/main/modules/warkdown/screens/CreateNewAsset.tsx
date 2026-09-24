import AppIcon, { IconFamily } from "@/app/common/components/ui/AppIcon";
import AppTreeView from "@/app/common/components/ui/AppTreeView";
import Button from "@/app/common/components/ui/Button/Button";
import { AppText, Heading } from "@/app/common/components/ui/Typography";
import AppBottomSheet from "@/app/common/components/ui/bottom_sheet";
import Screen from "@/app/common/layouts/Screen";
import { useAppDispatch, useAppSelector } from "@/app/lib/store/hooks";
import { RootState } from "@/app/lib/store/store";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Image, ScrollView, useWindowDimensions, View } from "react-native";
import {
  useGetAssetUpdateFieldByClientsQuery,
  useGetClientClassStructureDataQuery,
  useGetLocationHierarchyBySidIdQuery,
  useInsertAssetDocumentsMutation,
  useLazyGetMasterDataUpdateAssetInformationQuery,
  useSaveAssetWalkDownDetailsMutation
  // useGetMasterDataUpdateAssetInformationQuery
} from "../api/walkdownApi";
import AssetFormField from "../components/AssetFormField";
import {
  apiFieldMap,
  AssetField,
  assetStepConfig,
  categorySectionMap,
  initialAssetForm,
} from "../formConfig/formConfig";

import AppDatePicker from "@/app/common/components/ui/AppDatePicker";
import AppStepper from "@/app/common/components/ui/AppStepper";
import ImageUpload from "@/app/common/components/ui/ImageUpload";
import { useToast } from "@/app/common/components/ui/toast";
import { APP_ROUTES } from "@/app/common/config/routes";
import { formatDateForStorage, parseStoredDate } from "@/app/lib/utils";
import { buildAssetDataString } from "@/app/utils/assetPayload";
import { buildLocationTree } from "@/app/utils/locationTreeUtils";
import { router } from "expo-router";
import AssetSelectionDrawer from "../components/AssetSelectionDrawer";
import CalculateAssetEcr from "../components/CalculateAssetEcr";
import {
  resetAssetForm,
  updateAssetField as updateAssetFieldAction,
} from "../redux/walkDownSlice/assetFormSlice";

type AssetForm = typeof initialAssetForm;

type AssetSection = keyof AssetForm;



const CreateNewAsset = () => {
  // =========================================================
  // SCREEN
  // =========================================================

  const { height: screenHeight } = useWindowDimensions();
  const { danger, success } = useToast();

  /*
   * Keep some space for:
   * - bottom navigation
   * - drawer/header
   * - selected footer
   *
   * AppTreeView itself uses FlatList, so only visible rows
   * are rendered.
   */
  const treeHeight = Math.max(280, screenHeight - 420);
  const selectedListHeight = Math.max(280, screenHeight - 310)

  // =========================================================
  // REDUX
  // =========================================================

  const dispatch = useAppDispatch();
  const assetForm = useAppSelector((state: RootState) => state.assetForm);
  const { currentUser, selectedSite } = useAppSelector((state) => state.auth);

  console.log(assetForm)


  // =========================================================
  // LOCAL STATE
  // =========================================================

  const [currentStep, setCurrentStep] = useState(0);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [isCreateAssetConfirmationVisible, setIsCreateAssetConfirmationVisible] = useState(false);
  const [activeField, setActiveField] = useState<AssetField | null>(null);
  const [activeDrawer, setActiveDrawer] = useState<string | null>(null);
  const [isActiveListDrawer, setIsActiveListDrawer] = useState<boolean>(false);
  const [isActivateCriticality,  setIsActivateCriticality] = useState<boolean>(false);
  const [searchParentNumber, setSearchParentNumber] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    null
  );

  const isAssetNameValid = assetForm.general.assetName.trim().length > 0;
   const selectedActivity = useAppSelector(
          state => state.assetWalkDown.selectedActivity
      );
  // =========================================================
  // ASSET FIELD API DTO
  // =========================================================

  const fieldApiDto = useMemo(
    () => ({
      id21: currentUser?.siteId,
      id: selectedSite?.orgid,
      id1: undefined,
      id22: 2,
      id23: currentUser?.userId,
    }),
    [currentUser?.siteId, currentUser?.userId, selectedSite?.orgid],
  );

  // =========================================================
  // GET BACKEND FIELD CONFIGURATION
  // =========================================================

  const {
    data: myAssetUpdateFields = [],
    isLoading: isFieldsLoading,
    isFetching: isFieldsFetching,
    isError: isFieldsError,
  } = useGetAssetUpdateFieldByClientsQuery(fieldApiDto);


  // =========================================================
  // LOCATION API
  // =========================================================

  const {
    data: locationResponse,
    isLoading: isLocationLoading,
    isError: isLocationError,
    refetch: refetchLocationHierarchy,
  } = useGetLocationHierarchyBySidIdQuery(
    { id: selectedSite?.siteName ?? "" },
    { skip: !selectedSite?.siteName },
  );


  // Client Structure Data Loader
  const {
    data: clientStructureResponse,
    isLoading: isClientStructureLoading,
    isError: isClientStructureError,
    refetch: refetchClientClassStructureData,
  } = useGetClientClassStructureDataQuery(
    { id: selectedSite?.siteName ?? "" },
    { skip: !selectedSite?.siteName },
  );


  // ================  Add New Asset  ==========================

 const [saveAssetWalkDownDetails,
  {
    isLoading: isSavingAsset,
  },
] = useSaveAssetWalkDownDetailsMutation();


  // ====================  Insert Images  ======================


const [
  insertAssetDocuments,
  {
    isLoading: isUploadingImages,
  },
] = useInsertAssetDocumentsMutation();





  
  // console.log(clientStructureResponse)

  // =========================================================
  // CREATE FORM FIELDS
  // =========================================================

const formFields = useMemo<AssetField[]>(() => {
  if (!myAssetUpdateFields?.length) {
    return [];
  }

  const dynamicFields: AssetField[] = myAssetUpdateFields
    .map((item: any) => {
      const fieldName = apiFieldMap[item.aXColunmName];

      const section = categorySectionMap[item.category];

      /*
       * Backend can contain fields
       * which this mobile app does
       * not support yet.
       */
      if (!fieldName || !section) {
        return null;
      }

      return {
        id: item.id,
        fieldName,
        apiFieldName: item.aXColunmName,
        label: item.displayColnumName || item.colunmName,
        category: item.category,
        section,
        flag: item.flag,
        isMandatory: item.isMandatory === 1,
        suggested: item.suggested,
        suggestedName: item.suggestedname,
        displayOrder: item.displayOrder,
        value: null,
      } as AssetField;
    })
    .filter((item): item is AssetField => item !== null);

  // Custom Upload Images field
  const uploadImagesField: AssetField = {
    id: Number(27),
    fieldName: "uploadImages",
    apiFieldName: "uploadImages",
    label: "Upload Images",
    category: Number(27),
    section: "custom",
    flag: 27,
    isMandatory: false,
    suggested: false,
    suggestedName: "",
    displayOrder: 999,
    value: null,
  };

  return [...dynamicFields, uploadImagesField].sort(
    (a, b) => a.displayOrder - b.displayOrder
  );
}, [myAssetUpdateFields]);


  console.log(myAssetUpdateFields)


  


  // =========================================================
  // DYNAMIC STEPS
  // =========================================================

  const steps = useMemo(() => {
    return assetStepConfig
      .map((step) => {
        const fields = formFields
          .filter((field) => step.sections.includes(field.section))
          .sort((a, b) => a.displayOrder - b.displayOrder);

        return {
          ...step,
          fields,
        };
      })
    // .filter((step) => step.fields.length > 0);
  }, [formFields]);


 


  const totalSteps = steps.length;
  const safeCurrentStep = Math.min(currentStep, Math.max(totalSteps - 1, 0));
  const currentStepData = steps[safeCurrentStep];
  const treeResponse = activeDrawer === "location" ? locationResponse : activeDrawer === "assetClass" ? clientStructureResponse : undefined;

  // console.log(activeDrawer, "activeDrawer");

  // =========================================================
  // LOCATION DATA
  // =========================================================
  const nativeTreeResponse = useMemo(
    () => buildLocationTree(treeResponse),
    [treeResponse]
  );


  // =========================================================
  // LOCATION LOADER
  // =========================================================

  const loadLocationHierarchy = useCallback(async () => {
    if (!selectedSite?.siteName) {
      return;
    }

    try {
      await refetchLocationHierarchy();
    } catch (error) {
      console.error("Error loading location hierarchy:", error);
    }
  }, [refetchLocationHierarchy, selectedSite?.siteName]);

  // Client Structure Data Loader (Placeholder)
  const clientStructureData = useCallback(async () => {
    if (!selectedSite?.siteName) {
      return;
    }

    try {
      await refetchClientClassStructureData();
    } catch (error) {
      console.error("Error loading client structure data:", error);
    }
  }, [refetchClientClassStructureData, selectedSite?.siteName,]);


 

  //------------------------------  Work area Field -------------------------------------------


const [
  getMasterDataUpdateAssetInformation,
  {
    data: assetInformation,
    isLoading: isAssetInformationLoading,
    isFetching: isAssetInformationFetching,
    isError: isAssetInformationError,
    error: masterDataError,
  },
] = useLazyGetMasterDataUpdateAssetInformationQuery();
  
// console.log(activeField?.fieldName , assetInformation)


  // =========================================================
  // UPDATE FORM FIELD
  // =========================================================

  const updateAssetField = useCallback(
    (section: AssetSection, field: string, value: any) => {
      dispatch(
        updateAssetFieldAction({
          section,
          field,
          value,
        }),
      );
    },
    [dispatch],
  );

  // =========================================================
  // GET FIELD VALUE
  // =========================================================

  const getFieldValue = useCallback(
    (field: AssetField) => {
      const sectionData = assetForm[field.section];
      if (!sectionData || typeof sectionData !== "object") {
        return "";
      }

      const value = (sectionData as any)[field.fieldName];
      if (value && typeof value === "object" && "name" in value) {
        return value.name;
      }

      return value ?? "";
    },
    [assetForm],
  );


  

  // =========================================================
  // FIELD PRESS
  // =========================================================

const handleFieldPress = useCallback(
  async (field: AssetField) => {
    setActiveField(field);

    const listFields = [
      "assetType",
      "manufacturer",
      // "vendor",
      // "priority",
      // "workGroup",
      // "failureClass",
    ];

    if (listFields.includes(field.fieldName)) {
      setIsActiveListDrawer(true);

      const requestPayload = {
        id: field.fieldName,
        id1: selectedSite?.orgid,
        id2: searchParentNumber || "",
        id21: currentUser?.siteId,
        id22: currentUser?.userId,
      };

      try {
        await getMasterDataUpdateAssetInformation(requestPayload).unwrap();
      } catch (error) {
        console.error("Master data API error:", error);
      }

      return;
    }
    
    switch (field.flag) {
     
      case 4: {
        setActiveDrawer(field.fieldName);
        if (field.fieldName === "location") {
          await loadLocationHierarchy();
        } else if (field.fieldName === "AssetClass") {
          await clientStructureData();
        }
      }
       break;
      case 5:
      case 3:
        setIsActiveListDrawer(true);
        if (field.fieldName !== "Ref_Parent_Number") {
            const requestPayload = {
              id: field.fieldName,
              id1: selectedSite?.orgid,
              id2: searchParentNumber || "",
              id21: currentUser?.siteId,
              id22: currentUser?.userId,
             
             
            };

            try {
              const response =
                await getMasterDataUpdateAssetInformation(requestPayload).unwrap();
            
              // You can store response in drawer state here
              // setDrawerData(response);
            } catch (error) {
              console.error(
                "Master data API error:",
                error
              );
            }
        }
       break;

       case 8: {
        setIsActivateCriticality(true);
         break;
       }

      
      case 9: {
        setIsActiveListDrawer(true);
       
        const requestPayload = {
          id: field.fieldName,
          id1: selectedSite?.orgid,
          id2: searchParentNumber || "",
          id21: currentUser?.siteId,
          id22: currentUser?.userId,
        };

        try {
          const response =
            await getMasterDataUpdateAssetInformation(requestPayload).unwrap();

          // You can store response in drawer state here
          // setDrawerData(response);
        } catch (error) {
          console.error(
            "Master data API error:",
            error
          );
        }
        break;
      }

    

      default: {
        setActiveDrawer(field.fieldName);
        break;
      }
    }
  },
  [
    loadLocationHierarchy,
    getMasterDataUpdateAssetInformation,
    currentUser?.siteId,
    currentUser?.userId,
    currentUser?.orgId,
    searchParentNumber,
  ]
);







  // =========================================================
  // DRAWER TITLE
  // =========================================================

  const drawerTitle = useMemo(() => {
    if (!activeField) {
      return "Select";
    }

    switch (activeField.fieldName) {
      case "location":
        return "Select Location";

      case "workArea":
        return "Select Work Area";

      case "assetType":
        return "Select Asset Type";

      case "assetClass":
        return "Select Asset Class";

      case "priority":
        return "Select Priority";

      case "workGroup":
        return "Select Work Group";

      case "manufacturer":
        return "Select Manufacturer";

      case "vendor":
        return "Select Vendor";

      case "failureClass":
        return "Select Failure Class";
        
          case "criticality":
        return "Select Failure Class";

      default:
        return `Select ${activeField.label}`;
    }
  }, [activeField]);

  // =========================================================
  // RENDER FIELD
  // =========================================================


  const renderField = useCallback(
    (field: AssetField) => {
      const value = getFieldValue(field);

      // ---------------------------------------------
      // TEXT
      // ---------------------------------------------

      if (field.flag === 1) {
        return (
          <AssetFormField
            key={field.id}
            required={field.isMandatory}
            label={field.label}
            value={value}
            rightIcon
            type="text"
            onChangeText={(text) =>
              updateAssetField(field.section, field.fieldName, text)
            }
          />
        );
      }
      

      // ---------------------------------------------
      // NUMBER
      // ---------------------------------------------

      if (field.flag === 2) {
        return (
          <AssetFormField
            key={field.id}
            required={field.isMandatory}
            label={field.label}
            value={value}
            type="text"
            rightIcon={null}
            onChangeText={(text) =>
              updateAssetField(field.section, field.fieldName, text)
            }
          />
        );
      }

      // ---------------------------------------------
      // DATE
      // ---------------------------------------------

      if (field.flag === 7) {
        const fieldDateValue = parseStoredDate(value);

        return (
          <AppDatePicker
            key={field.id}
            label={field.label}
            placeholder={field.label}
            value={fieldDateValue ?? selectedDate}
            dateFormat="YYYY-MM-DD"
            onChange={(date) => {
              const normalizedDate = formatDateForStorage(date);
              setSelectedDate(date);
              updateAssetField(field.section, field.fieldName, normalizedDate);
            }}
          />
        );
      }

      if (field.flag === 27) {
        return (
          <ImageUpload
            key={field.id}
            photos={assetForm?.custom?.uploadePhotos ?? []}
            onChange={(updatedPhotos) => {
              updateAssetField(
                "custom",
                "uploadePhotos",
                updatedPhotos
              );
            }}
            maxPhotos={5}
            imageSize={96}
          />
        );
      }

      


      console.log(selectedDate)

      // ---------------------------------------------
      // SELECT / LOOKUP / LOCATION
      // ---------------------------------------------

      return (
        <AssetFormField
          key={field.id}
          required={field.isMandatory}
          label={field.label}
          value={value}
          type="select"
          rightIcon={
            <AppIcon
              family="Feather"
              name="chevron-right"
              size={20}
              color="#000000"
            />
          }
          onPress={() => handleFieldPress(field)}
        />
      );
    },
    [getFieldValue, handleFieldPress, updateAssetField],
  );

  // =========================================================
  // SECTION HEADER
  // =========================================================

  const AssetSectionHeader = useCallback(
    ({
      title,
      description,
      icon,
      family,
    }: {
      title: string;
      description: string;
      icon: string;
      family: IconFamily;
    }) => {
      return (
        <View className="flex-row items-center gap-3 my-5">
          <View className="w-12 h-12 bg-primary-light rounded-xl items-center justify-center">
            <AppIcon name={icon} family={family} color="#2563EB" size={24} />
          </View>

          <View className="flex-1">
            <Heading level={5}>{title}</Heading>

            <AppText variant="caption">{description}</AppText>
          </View>
        </View>
      );
    },
    [],
  );

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

        // case "financial":
        //   return {
        //     title: "Financial Details",
        //     description: "Enter financial information",
        //     icon: "cash",
        //     family: "MaterialCommunityIcons",
        //   };

        // case "lifecycle":
        //   return {
        //     title: "Lifecycle Information",
        //     description: "Enter lifecycle information",
        //     icon: "refresh",
        //     family: "MaterialCommunityIcons",
        //   };

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

  // =========================================================
  // CURRENT STEP
  // =========================================================

  const buildReviewPayload = useCallback(() => {
    const reviewData = {
      general: {
        assetName: assetForm.general.assetName || "Not selected",
      },
      location: {
        location: assetForm.location.location?.name ?? "Not selected",
      },
      classification: {
        assetType: assetForm.classification.assetType?.name ?? "Not selected",
        assetClass: assetForm.classification.assetClass?.name ?? "Not selected",
        serialNumber: assetForm.classification.serialNumber || "Not selected",
      },
      technical: {
        manufacturer: assetForm.technical.manufacturer?.name ?? "Not selected",
        model: assetForm.technical.model || "Not selected",
        installedDate:
          assetForm.technical.installedDate ?? "Not selected",
      },
      custom: {
        uploadedPhotosCount: assetForm.custom.uploadePhotos?.length ?? 0,
      },
    };

    return reviewData;
  }, [assetForm]);

  const renderReviewScreen = useCallback(() => {
    const reviewData = buildReviewPayload();
    const uploadedPhotos = assetForm.custom.uploadePhotos ?? [];

    return (
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
          <View className="rounded-2xl border border-slate-200 bg-slate-50 p-2 px-4">
            <Heading level={5}>Review & Save</Heading>
            <AppText variant="caption" className="mt-1 text-slate-500">
              Please review the asset information before saving.
            </AppText>
          </View>

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
                          accessibilityLabel={photo.fileName ?? "Selected asset photo"}
                          className="h-24 w-24 rounded-xl bg-slate-100"
                          resizeMode="cover"
                        />
                      ))}
                    </ScrollView>
                  ) : (
                    <AppText className="text-slate-500">No images selected</AppText>
                  )
                ) : (
                  Object.entries(sectionValue as Record<string, any>).map(([fieldKey, fieldValue]) => (
                    <View key={fieldKey} className="mb-3 flex-row justify-between gap-3">
                      <AppText className="flex-1 text-slate-500">
                        {fieldKey
                          .replace(/([A-Z])/g, " $1")
                          .replace(/^./, (char) => char.toUpperCase())}
                      </AppText>
                      <AppText className="flex-1 text-right text-slate-800" numberOfLines={2}>
                        {typeof fieldValue === "number"
                          ? String(fieldValue)
                          : fieldValue ?? "Not selected"}
                      </AppText>
                    </View>
                  ))
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    );
  }, [assetForm.custom.uploadePhotos, buildReviewPayload, getSectionInformation]);

  const renderCurrentStep = useCallback(() => {
    if (isReviewMode) {
      return renderReviewScreen();
    }

    if (!currentStepData) {
      return null;
    }

    return (
      <View>
        {currentStepData.sections.map((section) => {
          const sectionFields = currentStepData.fields.filter(
            (field) => field.section === section,
          );

          if (sectionFields.length === 0) {
            return null;
          }

          const sectionInfo = getSectionInformation(section);

          return (
            <View key={section}>
              <AssetSectionHeader
                title={sectionInfo.title}
                description={sectionInfo.description}
                icon={sectionInfo.icon}
                family={sectionInfo.family}
              />

              {sectionFields.map(renderField)}
            </View>
          );
        })}
      </View>
    );
  }, [AssetSectionHeader, currentStepData, getSectionInformation, isReviewMode, renderField, renderReviewScreen]);

  // =========================================================
  // CONTINUE
  // =========================================================

  const handleContinue = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((previous) => previous + 1);
      return;
    }

    if (!isReviewMode) {
      setIsReviewMode(true);
      return;
    }

    if (!isAssetNameValid) {
      return;
    }

    setIsCreateAssetConfirmationVisible(true);
  }, [currentStep, isAssetNameValid, isReviewMode, totalSteps]);

  // =========================================================
  // BACK
  // =========================================================

  const handleBack = useCallback(() => {
    if (isReviewMode) {
      setIsReviewMode(false);
      return;
    }

    if (currentStep > 0) {
      setCurrentStep((previous) => previous - 1);
    }
  }, [currentStep, isReviewMode]);

  // =========================================================
  // CLOSE DRAWER
  // =========================================================

  const closeDrawer = useCallback(() => {
    setActiveDrawer(null);
    setActiveField(null);
  }, []);

  const closeListDrawer = useCallback(() => {
    setIsActiveListDrawer(false);
    setActiveField(null);
  }, []);



  // ========================================================
     //  Add New Asset

  const addNewAsset = useCallback(async () => {
    // Close confirmation modal
    setIsCreateAssetConfirmationVisible(false);

    // Build final asset string
    const finalString = buildAssetDataString({
      assetName: assetForm.general.assetName,
      location: assetForm.location.location?.name,
      assetType: assetForm.classification.assetType?.name,
      assetClass: assetForm.classification.assetClass?.name,
      serialNumber: assetForm.classification.serialNumber,
      manufacturer: assetForm.technical.manufacturer?.name,
      model: assetForm.technical.model,
      installedDate: assetForm.technical.installedDate,
    });

    console.log(assetForm)

    console.log(
      "Final asset data string:",
      finalString
    );

    // Prepare API payload
    const payload = {
      id21: Number(currentUser?.userId),
      id22: Number(currentUser?.siteId),
      id23: Number(currentUser?.companyId),
      id: finalString,
      id24: Number(selectedActivity?.woId ?? 0),
    };


    console.log(
      "Save asset API payload:",
      payload
    );

    try {
      const response = await saveAssetWalkDownDetails(payload).unwrap();

      console.log("Asset save successful. Response:", response);

      const uploadedPhotos = assetForm.custom?.uploadePhotos ?? [];
      const imageList = uploadedPhotos
        .map((image) => image.uri)
        .filter(Boolean);

      if (imageList.length > 0) {
        const imagePayload = {
          id21: Number(selectedActivity?.woId ?? 0),
          id22: 0,
          id32: Number(currentUser?.userId),
          id67: "A",
          idArrayStr: imageList,
        };

        console.log("Insert image payload:", imagePayload);
        const imageResponse = await insertAssetDocuments(imagePayload).unwrap();

        console.log("Image upload successful. Response:", imageResponse);
      }

      success({
        title: "Asset Created",
        message: "Your new asset has been added.",
        duration: 5000,
      });

      dispatch(resetAssetForm());
      router.replace(APP_ROUTES.assetAssignment);
    } catch (error) {
      console.error(
        "Save asset error:",
        error
      );

      danger({
        title: "Save Failed",
        message: "Unable to save asset. Please try again.",
        duration: 5000,
      });
    }
  }, [
    assetForm,
    currentUser,
    selectedActivity,
    saveAssetWalkDownDetails,
    insertAssetDocuments,
    success,
    danger,
    dispatch,
  ]);

  // ========================================================



  // =========================================================
  // MAIN LOADING
  // =========================================================

  if (isFieldsLoading || isFieldsFetching) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563EB" />

          <AppText className="mt-3">Loading asset fields...</AppText>
        </View>
      </Screen>
    );
  }

  // =========================================================
  // MAIN ERROR
  // =========================================================

  if (isFieldsError) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <AppText>Unable to load asset fields.</AppText>
        </View>
      </Screen>
    );
  }

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <Screen>
      {/* =================================================
                PROGRESS
            ================================================== */}

      {/* <View>
        <AppText className="mb-2">
          Step {totalSteps === 0 ? 0 : currentStep + 1} of {totalSteps}
        </AppText>

        <View className="flex-row gap-1">
          {steps.map((step, index) => {
            const completed = index <= currentStep;

            return (
              <View
                key={step.key}
                className={`h-1.5 flex-1 rounded-full ${completed ? "bg-blue-600" : "bg-slate-200"
                  }`}
              />
            );
          })}
        </View>
      </View> */}
      <AppStepper
        steps={steps}
        currentStep={safeCurrentStep}
        totalSteps={totalSteps}
      />

      {/* =================================================
                CURRENT STEP
            ================================================== */}

      <View className="flex-1">{renderCurrentStep()}</View>

      {/* =================================================
                NAVIGATION
            ================================================== */}

      {totalSteps > 0 && (
        <View className="flex-row gap-3 py-3">
          {currentStep > 0 && (
            <Button
              variant="outline"
              className="border border-primary!"
              onPress={handleBack}
            >
              <View className="flex-row items-center gap-2">
                <AppIcon
                  name="arrow-left"
                  family="Feather"
                  size={20}
                  color="#2563EB"
                />

                <AppText className="text-primary! font-bold">Back</AppText>
              </View>
            </Button>
          )}

          <Button
            fullWidth={currentStep === 0}
            disabled={isReviewMode && !isAssetNameValid}
            className={currentStep > 0 ? "flex-1" : ""}
            onPress={handleContinue}
          >
            <View className="flex-row items-center justify-center gap-2">
              <AppText variant="body" weight="semibold" className="text-white">
                {isReviewMode ? "Save Asset" : currentStep === totalSteps - 1 ? "Review" : "Continue"}
              </AppText>

              {!isReviewMode && (
                <AppIcon
                  name="arrow-right"
                  family="Feather"
                  color="#fff"
                  size={20}
                />
              )}
            </View>
          </Button>
        </View>
      )}

      {/* =================================================
                DYNAMIC DRAWER
            ================================================== */}

      <AppBottomSheet
        visible={activeDrawer !== null}
        onClose={closeDrawer}
        enableContentPanningGesture={true}
        enablePanDownToClose={true}
        title={drawerTitle}
        size="Xlarge"
      >
        <View
          style={{
            flex: 1,
          }}
        >
          {/* -----------------------------------------
                        LOCATION
                    ------------------------------------------ */}

          {(activeField?.fieldName === "location" ||
            activeField?.fieldName === "assetClass") && (

              activeField.fieldName === "location" ? (

                // =========================
                // LOCATION
                // =========================

                isLocationLoading ? (
                  <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#2563EB" />

                    <AppText className="mt-3 text-slate-500">
                      Loading locations...
                    </AppText>
                  </View>
                ) : isLocationError ? (
                  <View className="flex-1 items-center justify-center">
                    <AppText className="text-slate-500">
                      Unable to load locations.
                    </AppText>

                    <Button
                      className="mt-4"
                      onPress={loadLocationHierarchy}
                    >
                      <AppText className="text-white">
                        Retry
                      </AppText>
                    </Button>
                  </View>
                ) : (
                  <AppTreeView
                    data={nativeTreeResponse}
                    Height={treeHeight}
                    title="Location"
                    showSearch={true}
                    showContinue={true}
                    showSelectedFooter={true}
                    onSelect={(node) => {
                      console.log("Selected location:", node);
                    }}
                    onContinue={(node) => {
                      console.log("Confirmed location:", node);

                      if (activeField) {
                        updateAssetField(
                          activeField.section,
                          activeField.fieldName,
                          node
                        );
                      }

                      closeDrawer();
                    }}
                  />
                )

              ) : (

                // =========================
                // WORK AREA
                // =========================

                isClientStructureLoading ? (
                  <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#2563EB" />

                    <AppText className="mt-3 text-slate-500">
                      Loading work areas...
                    </AppText>
                  </View>
                ) : isClientStructureError ? (
                  <View className="flex-1 items-center justify-center">
                    <AppText className="text-slate-500">
                      Unable to load work areas.
                    </AppText>

                    <Button
                      className="mt-4"
                      onPress={clientStructureData}
                    >
                      <AppText className="text-white">
                        Retry
                      </AppText>
                    </Button>
                  </View>
                ) : (
                  <AppTreeView
                    data={nativeTreeResponse}
                    Height={treeHeight}
                    title={drawerTitle}
                    showSearch={true}
                    showContinue={true}
                    showSelectedFooter={true}
                    onSelect={(node) => {
                      console.log("Selected work area:", node);
                    }}
                    onContinue={(node) => {
                      console.log("Confirmed work area:", node);

                      if (activeField) {
                        updateAssetField(
                          activeField.section,
                          activeField.fieldName,
                          node
                        );
                      }

                      closeDrawer();
                    }}
                  />
                )

              )
            )}

          {/* -----------------------------------------
                        WORK AREA
                    ------------------------------------------ */}

          {/* {activeField &&
            activeField.fieldName !== "location" &&
            activeField.fieldName !== "workArea" && (
            <View className="flex-1 items-center justify-center">
              <AppText className="text-slate-500">Work Area</AppText>
            </View>
          )} */}

          {/* -----------------------------------------
                        OTHER LOOKUPS
                    ------------------------------------------ */}

          {/* {activeField &&
            activeField.fieldName !== "location" &&
            activeField.fieldName !== "workArea" && (
              <View className="flex-1 items-center justify-center">
                <AppText className="text-slate-500">{drawerTitle}</AppText>
              </View>
            )} */}
        </View>
      </AppBottomSheet>



      {/* ------------------------------------- List Drawer Section ------------------------------------------  */}

      <AppBottomSheet
        visible={isActiveListDrawer}
        onClose={closeListDrawer}
        enableContentPanningGesture={true}
        enablePanDownToClose={true}
        title={drawerTitle}
        size="large"
        description=""
      >
        <View className="flex-1">

          {isAssetInformationLoading || isAssetInformationFetching ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator
                size="large"
                color="#2563EB"
              />

              <AppText className="mt-3 text-slate-500">
                Loading work areas...
              </AppText>
            </View>

          ) : isAssetInformationError ? (
            <View className="flex-1 items-center justify-center">
              <AppText className="text-slate-500">
                Unable to load work areas.
              </AppText>

              <Button
                className="mt-4"
                onPress={clientStructureData}
              >
                <AppText className="text-white">
                  Retry
                </AppText>
              </Button>
            </View>

          ) : (
                <AssetSelectionDrawer
                  data={assetInformation ?? []}
                  selectedId={null}
                  title="Asset Type"
                  showSelectedFooter={true}
                  showContinue={true}
                  Height={selectedListHeight}
                  onSelect={(item) => {
                    const selectedValue =
                      activeField?.flag === 9
                        ? item?.parentId
                        : item?.info;

                    console.log("Selected item:", selectedValue);
                  }}
                  onContinue={(item) => {
                    const selectedValue =
                      activeField?.flag === 9
                        ? item?.parentId
                        : activeField?.fieldName === "manufacturer" ||
                            activeField?.fieldName === "assetType"
                          ? {
                              id: item?.id,
                              name: item?.info ?? item?.name ?? "",
                            }
                        : item?.info;

                    console.log("Continue with:", selectedValue);

                    if (activeField) {
                      updateAssetField(
                        activeField.section,
                        activeField.fieldName,
                        selectedValue
                      );
                    }

                    closeListDrawer();
                  }}
/>
          )}

        </View>
      </AppBottomSheet>
  
   
     {/* ------------------------------------- Criticality Tabs ------------------------------------------  */}
     
      <AppBottomSheet
        visible={isActivateCriticality}
        onClose={() => setIsActivateCriticality(false)}
        enableContentPanningGesture={true}
        enablePanDownToClose={true}
        title={drawerTitle}
        size="Xlarge"
        description="">

        <View>
          <CalculateAssetEcr />
        </View>

      </AppBottomSheet>

        

      <AppBottomSheet
       enableContentPanningGesture={true}
        enablePanDownToClose={false}
        visible={isCreateAssetConfirmationVisible}
        onClose={() => setIsCreateAssetConfirmationVisible(false)}
        size="medium"
      >
        <View>

          <View className="flex flex-col items-center justify-center gap-2">
            <View className="w-20 h-20 rounded-full bg-warning/25 border-warning/30 border-2  flex items-center justify-center text-center">
              <AppIcon family="Ionicons" name="alert" size={30} color="#F59E0B" />
            </View>

            <Heading level={3} className="">Are You Sure ?</Heading>
            <AppText className="text-text-secondary text-center w-2/3 mb-2">
              Do you want  to create New Asset ?
            </AppText>
          </View>



          <View className="flex flex-col gap-2 mt-2">
            <Button title="Yes" fullWidth onPress={addNewAsset} />
            <Button variant="outline" fullWidth className="border border-error"  onPress={() => setIsCreateAssetConfirmationVisible(false)}>
              <AppText className="text-error! font-bold" >Cancel</AppText>
            </Button>
          </View>



        </View>

      </AppBottomSheet>

    </Screen>
  );
};

export default CreateNewAsset;
function danger(arg0: { title: string; message: string; duration: number; }) {
  throw new Error("Function not implemented.");
}

