import AppIcon, { IconFamily } from "@/src/common/components/ui/AppIcon";
import AppTreeView from "@/src/common/components/ui/AppTreeView";
import Button from "@/src/common/components/ui/Button/Button";
import { AppText, Heading } from "@/src/common/components/ui/Typography";
import AppBottomSheet from "@/src/common/components/ui/bottom_sheet";
import Screen from "@/src/common/layouts/Screen";
import { useAppDispatch, useAppSelector } from "@/src/lib/store/hooks";
import { RootState } from "@/src/lib/store/store";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Image, ScrollView, useWindowDimensions, View } from "react-native";
import {
  useGetAssetUpdateFieldByClientsQuery,
  useGetClientClassStructureDataQuery,
  useGetLocationHierarchyBySidIdQuery,
  useInsertAssetDocumentsMutation,
  useLazyGetMasterDataUpdateAssetInformationQuery,
  useSaveAssetWalkDownDetailsMutation
  // useGetMasterDataUpdateAssetInformationQuery
} from "@/src/main/modules/walkdown/api/walkdownApi";
import AssetFormField from "@/src/main/modules/walkdown/components/AssetFormField";
import {
  apiFieldMap,
  AssetField,
  assetStepConfig,
  categorySectionMap,
  initialAssetForm,
} from "@/src/main/modules/walkdown/formConfig/formConfig";

import AppDatePicker from "@/src/common/components/ui/AppDatePicker";
import AppStepper from "@/src/common/components/ui/AppStepper";
import ImageUpload from "@/src/common/components/ui/UploadSection/ImageUpload";
import {
  ASSET_IMAGE_FOLDER_TYPE,
  extractCreatedAssetId,
  getUploadErrorMessage,
  isLocalFileUri,
  useUploadToFolder,
} from "@/src/common/components/ui/UploadSection/uploadFilesToRootFolder";
import { useToast } from "@/src/common/components/ui/toast";
import { APP_ROUTES } from "@/src/common/config/routes";
import { useHeaderBackHandler, useScreenHeader } from "@/src/common/hooks/useScreenHeader";
import { formatDateForStorage, parseStoredDate } from "@/src/lib/utils";
import { buildAssetDataString } from "@/src/utils/assetPayload";
import { buildLocationTree } from "@/src/utils/locationTreeUtils";
import { router } from "expo-router";
import AssetSelectionDrawer from "@/src/main/modules/walkdown/components/AssetSelectionDrawer";
import CalculateAssetEcr from "@/src/main/modules/walkdown/components/CalculateAssetEcr";
import {
  saveAssetForm as assetAssetFormAction,
  resetSaveAssetForm,
} from "@/src/main/modules/walkdown/redux/walkDownSlice/assetFormSlice";

type AssetForm = typeof initialAssetForm;

type AssetSection = keyof AssetForm;



const CreateNewAsset = () => {
  // =========================================================
  // SCREEN
  // =========================================================

  const { height: screenHeight } = useWindowDimensions();
  const { danger, success, warning } = useToast();
  const { uploadToFolder, isLoading: isUploadingFiles } = useUploadToFolder();

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

  const isAssetNameValid = assetForm?.saveAssetForm?.general.assetName.trim().length > 0;
   const selectedActivity = useAppSelector(
          state => state.assetWalkDown.selectedActivity
      );


  
  useScreenHeader({ title: 'Add Asset', showBack: true, showMenu: false, showLogo: false, backAction: 'custom', });

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

  const dynamicFields: AssetField[] = myAssetUpdateFields.map((item: any) => {
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

  const saveAssetField = useCallback(
    (section: AssetSection, field: string, value: any) => {
      dispatch(
        assetAssetFormAction({
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
      const sectionData = assetForm?.saveAssetForm[field.section];
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
        } else if (field.fieldName === "assetClass") {
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
    clientStructureData,
    selectedSite?.orgid,
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
              saveAssetField(field.section, field.fieldName, text)
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
              saveAssetField(field.section, field.fieldName, text)
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
              saveAssetField(field.section, field.fieldName, normalizedDate);
            }}
          />
        );
      }

      if (field.flag === 27) {
        return (
          <ImageUpload
            key={field.id}
            photos={assetForm?.saveAssetForm?.custom?.uploadePhotos ?? []}
            onChange={(updatedPhotos) => {
              saveAssetField(
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
    [getFieldValue, handleFieldPress, saveAssetField],
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
        assetName: assetForm?.saveAssetForm?.general.assetName || "Not selected",
      },
      location: {
        location: assetForm?.saveAssetForm?.location.location?.name ?? "Not selected",
      },
      classification: {
        assetType: assetForm?.saveAssetForm?.classification.assetType?.name ?? "Not selected",
        assetClass: assetForm?.saveAssetForm?.classification.assetClass?.name ?? "Not selected",
        serialNumber: assetForm?.saveAssetForm?.classification.serialNumber || "Not selected",
      },
      technical: {
        manufacturer: assetForm?.saveAssetForm?.technical.manufacturer?.name ?? "Not selected",
        model: assetForm?.saveAssetForm?.technical.model || "Not selected",
        installedDate:
          assetForm?.saveAssetForm?.technical.installedDate ?? "Not selected",
      },
      custom: {
        uploadedPhotosCount: assetForm?.saveAssetForm?.custom.uploadePhotos?.length ?? 0,
      },
    };

    return reviewData;
  }, [assetForm]);

  const renderReviewScreen = useCallback(() => {
    const reviewData = buildReviewPayload();
    const uploadedPhotos = assetForm?.saveAssetForm?.custom.uploadePhotos ?? [];

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
  }, [assetForm?.saveAssetForm?.custom.uploadePhotos, buildReviewPayload, getSectionInformation]);

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

  const getMissingMandatoryFields = useCallback(
    (fields: AssetField[]) =>
      fields.filter(
        (field) =>
          field.isMandatory &&
          field.section !== "custom" &&
          String(getFieldValue(field) ?? "").trim() === "",
      ),
    [getFieldValue],
  );

  const handleContinue = useCallback(() => {
    if (!isReviewMode && currentStepData) {
      const missing = getMissingMandatoryFields(currentStepData.fields);

      if (missing.length > 0) {
        warning({
          title: "Required fields",
          message: `Please fill in: ${missing.map((field) => field.label).join(", ")}`,
        });
        return;
      }
    }

    if (currentStep < totalSteps - 1) {
      setCurrentStep((previous) => previous + 1);
      return;
    }

    if (!isReviewMode) {
      setIsReviewMode(true);
      return;
    }

    if (!isAssetNameValid) {
      warning({ title: "Asset name", message: "Asset name is required." });
      return;
    }

    setIsCreateAssetConfirmationVisible(true);
  }, [
    currentStep,
    currentStepData,
    getMissingMandatoryFields,
    isAssetNameValid,
    isReviewMode,
    totalSteps,
    warning,
  ]);

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
      return;
    }

    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(APP_ROUTES.assetAssignment);
    }
  }, [currentStep, isReviewMode]);

  // Header back arrow + Android hardware back step through the wizard.
  useHeaderBackHandler(handleBack);

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

  const isSubmitting = isSavingAsset || isUploadingFiles || isUploadingImages;

  const addNewAsset = useCallback(async () => {
    if (isSubmitting) return;

    setIsCreateAssetConfirmationVisible(false);

    const form = assetForm?.saveAssetForm;

    const finalString = buildAssetDataString({
      assetName: form?.general.assetName,
      location: form?.location.location?.name,
      assetType: form?.classification.assetType?.name,
      assetClass: form?.classification.assetClass?.name,
      serialNumber: form?.classification.serialNumber,
      manufacturer: form?.technical.manufacturer?.name,
      model: form?.technical.model,
      installedDate: form?.technical.installedDate,
    });

    const payload = {
      id21: Number(currentUser?.userId),
      id22: Number(currentUser?.siteId),
      id23: Number(currentUser?.companyId),
      id: finalString,
      id24: Number(selectedActivity?.woId ?? 0),
    };

    // 1. Upload photos FIRST. Uploads are not tied to an asset (objectId "0"),
    //    so if this fails nothing has been created yet and the user can fix
    //    the problem and press Save again without creating a duplicate.
    const localPhotos = (form?.custom?.uploadePhotos ?? []).filter((photo) =>
      isLocalFileUri(photo.uri),
    );
    let filePaths: string[] = [];

    if (localPhotos.length > 0) {
      try {
        filePaths = await uploadToFolder({
          files: localPhotos,
          companyCode: currentUser?.companyCode ?? "",
          folderType: ASSET_IMAGE_FOLDER_TYPE,
          objectId: "0",
          fileFlag: "I",
        });
      } catch (error) {
        if (__DEV__) console.warn("Asset image upload failed:", error);
        danger({
          title: "Photo upload failed",
          message: `${getUploadErrorMessage(error)} The asset was not saved yet.`,
          duration: 6000,
        });
        return;
      }
    }

    // 2. Save the asset.
    let saveResponse: unknown;
    try {
      saveResponse = await saveAssetWalkDownDetails(payload).unwrap();
    } catch (error) {
      if (__DEV__) console.warn("Save asset error:", error);
      danger({
        title: "Save Failed",
        message: "Unable to save asset. Please try again.",
        duration: 5000,
      });
      return;
    }

    // 3. Link the uploaded photos to the new asset. The asset exists now, so a
    //    failure here must NOT say "try again" (that would duplicate it).
    let linkFailed = false;

    if (filePaths.length > 0) {
      // The update flow links photos to the ASSET id (id21). The old create
      // code used the walkdown activity id instead, which attached photos to
      // the wrong record. Fall back to it only if the API returns no id.
      const newAssetId = extractCreatedAssetId(saveResponse);
      if (__DEV__ && newAssetId == null) {
        console.warn(
          "[CreateNewAsset] saveAssetWalkDownDetails returned no asset id; linking photos to the activity id. Response:",
          saveResponse,
        );
      }

      try {
        await insertAssetDocuments({
          id21: Number(newAssetId ?? selectedActivity?.woId ?? 0),
          id22: 0,
          id32: Number(currentUser?.userId),
          id67: "A",
          idArrayStr: filePaths,
        }).unwrap();
      } catch (error) {
        if (__DEV__) console.warn("Linking asset images failed:", error);
        linkFailed = true;
      }
    }

    if (linkFailed) {
      warning({
        title: "Asset Created",
        message: "The asset was saved, but the photos could not be attached. Add them from the asset's update screen.",
        duration: 6000,
      });
    } else {
      success({
        title: "Asset Created",
        message: "Your new asset has been added.",
        duration: 5000,
      });
    }

    dispatch(resetSaveAssetForm());
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(APP_ROUTES.assetAssignment);
    }
  }, [
    isSubmitting,
    assetForm,
    currentUser,
    selectedActivity,
    saveAssetWalkDownDetails,
    uploadToFolder,
    insertAssetDocuments,
    success,
    warning,
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
            loading={isReviewMode && isSubmitting}
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
                  
                    onContinue={(node) => {

                      if (activeField) {
                        saveAssetField(
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
                      Loading asset classes...
                    </AppText>
                  </View>
                ) : isClientStructureError ? (
                  <View className="flex-1 items-center justify-center">
                    <AppText className="text-slate-500">
                      Unable to load asset classes.
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
                   
                    onContinue={(node) => {
                     

                      if (activeField) {
                        saveAssetField(
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
                Loading...
              </AppText>
            </View>

          ) : isAssetInformationError ? (
            <View className="flex-1 items-center justify-center">
              <AppText className="text-slate-500">
                Unable to load the list.
              </AppText>

              <Button
                className="mt-4"
                onPress={() => activeField && handleFieldPress(activeField)}
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
                  title={activeField?.label ?? "Item"}
                  showSelectedFooter={true}
                  showContinue={true}
                  Height={selectedListHeight}
                  onSelect={(item) => {
                    const selectedValue =
                      activeField?.flag === 9
                        ? item?.parentId
                        : item?.info;

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


                    if (activeField) {
                      saveAssetField(
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
            <Button title="Yes" fullWidth loading={isSubmitting} onPress={addNewAsset} />
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
