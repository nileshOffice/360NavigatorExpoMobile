import AppDatePicker from '@/src/common/components/ui/AppDatePicker';
import AppIcon, { IconFamily } from '@/src/common/components/ui/AppIcon';
import Button from "@/src/common/components/ui/Button/Button";
import { useToast } from '@/src/common/components/ui/toast/ToastProvider';
import { AppText, Heading } from '@/src/common/components/ui/Typography';
import { APP_ROUTES } from '@/src/common/config/routes';
import Screen from "@/src/common/layouts/Screen";
import { useAppDispatch, useAppSelector } from '@/src/lib/store/hooks';
import { RootState } from '@/src/lib/store/store';
import { formatDateForStorage, parseStoredDate } from '@/src/lib/utils';
import {
  useGetAssetUpdateFieldByClientsQuery, useGetClientClassStructureDataQuery,
  useGetFileListByObjectIdQuery,
  useGetLocationHierarchyBySidIdQuery, useInsertAssetDocumentsMutation,
  useLazyGetMasterDataUpdateAssetInformationQuery,
  useUpdateAssetWalkDownDetailsMutation,
  walkdownApi
} from '@/src/main/modules/walkdown/api/walkdownApi';
import AssetFormField from '@/src/main/modules/walkdown/components/AssetFormField';
import { AssetSection } from '@/src/main/modules/walkdown/formConfig/assetForm.types';
import { apiFieldMap, AssetField, assetStepConfig, categorySectionMap } from '@/src/main/modules/walkdown/formConfig/formConfig';
import { buildLocationTree } from '@/src/utils/locationTreeUtils';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, useWindowDimensions, View } from 'react-native';

import AppStepper from '@/src/common/components/ui/AppStepper';
import AppTreeView from '@/src/common/components/ui/AppTreeView';
import AppBottomSheet from '@/src/common/components/ui/bottom_sheet';
import ImageUpload from '@/src/common/components/ui/UploadSection/ImageUpload';
import { ASSET_IMAGE_FOLDER_TYPE, getUploadErrorMessage, isLocalFileUri, useUploadToFolder } from '@/src/common/components/ui/UploadSection/uploadFilesToRootFolder';
import { Modules } from '@/src/common/constants/global_enum';
import { useHeaderBackHandler, useScreenHeader } from '@/src/common/hooks/useScreenHeader';
import AssetSelectionDrawer from '@/src/main/modules/walkdown/components/AssetSelectionDrawer';
import CalculateAssetEcr from '@/src/main/modules/walkdown/components/CalculateAssetEcr';
import {
  updateAssetField as assetAssetFormAction,
  resetUpdateAssetForm
} from "@/src/main/modules/walkdown/redux/walkDownSlice/assetFormSlice";



const UpdateAssetDetail = () => {

  const { danger, success, warning } = useToast();
  const { height: screenHeight } = useWindowDimensions()
  const treeHeight = Math.max(280, screenHeight - 420);
  const selectedListHeight = Math.max(280, screenHeight - 310)
  const dispatch = useAppDispatch();
  const { currentUser, selectedSite } = useAppSelector((state) => state.auth);

  // =========================================================
  // REDUX
  // =========================================================

  const assetForm = useAppSelector((state: RootState) => state.assetForm);

  // =========================================================
  // LOCAL STATE
  // =========================================================

  const [currentStep, setCurrentStep] = useState(0);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [isCreateAssetConfirmationVisible, setIsCreateAssetConfirmationVisible] = useState(false);
  const [activeField, setActiveField] = useState<AssetField | null>(null);
  const [activeDrawer, setActiveDrawer] = useState<string | null>(null);
  const [isActiveListDrawer, setIsActiveListDrawer] = useState<boolean>(false);
  const [isActivateCriticality, setIsActivateCriticality] = useState<boolean>(false);
  const [searchParentNumber, setSearchParentNumber] = useState<string | null>(
    null,
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const isAssetNameValid = assetForm?.updateAssetForm?.general.updatedAssetName.trim().length > 0;
  const selectedActivity = useAppSelector(
    state => state.assetWalkDown.selectedActivity
  );

  // Same args as My Assignment, so the refresh below updates its cache entry.
  const assetListArgs = useMemo(
    () => ({
      id21: Number(currentUser?.companyId ?? 0),
      id22: Number(selectedSite?.id ?? 0),
      id23: Number(selectedActivity?.woId ?? 0),
    }),
    [currentUser?.companyId, selectedSite?.id, selectedActivity?.woId],
  );

  // True for the whole save (fields → photos → refresh list); drives the
  // spinner on the Update Asset button.
  const [isSaving, setIsSaving] = useState(false);
  const [fileFormatErrorMessage, setFileFormatErrorMessage] = useState(false)


  const selectedAssetData = useAppSelector(
    state => state.selectedAssetData
  );






  useEffect(() => {
    if (!selectedAssetData?.id) return;

    // Hydrate original + updated values here
  }, [selectedAssetData?.id]);




  const normalizeValue = (value: any) => {
    if (value === null || value === undefined || value === "") {
      return "";
    }

    return String(value).trim();
  };


  // =========================================================
  // ASSET FIELD API DTO
  // =========================================================

  const fieldApiDto = useMemo(
    () => ({
      id21: currentUser?.siteId,
      id: selectedSite?.orgid,
      id1: undefined,
      id22: 1,
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

  const [updateAssetWalkDownDetails,
    {
      isLoading: isUpdatingAsset,
    },
  ] = useUpdateAssetWalkDownDetailsMutation();


  // ====================  Insert Images  ======================


  const [
    insertAssetDocuments,
    {
      isLoading: isUploadingImages,
    },
  ] = useInsertAssetDocumentsMutation();








  const { uploadToFolder, isLoading: isUploading, } = useUploadToFolder();

  /**
   * Uploads only photos taken/picked on this device. Photos that already
   * exist on the server (http URLs) were previously re-sent as files too,
   * which fails on Android and would duplicate them.
   */
  const uploadAssetImages = async () => {
    const localPhotos = (assetForm?.updateAssetForm?.custom?.uploadePhotos ?? []).filter(
      (photo) => isLocalFileUri(photo.uri),
    );

    if (!localPhotos.length) {
      return;
    }

    const uploadedFiles = await uploadToFolder({
      files: localPhotos,
      companyCode: currentUser?.companyCode ?? "",
      folderType: ASSET_IMAGE_FOLDER_TYPE,
      objectId: "0",
      fileFlag: "I",
    });

    const imageList = uploadedFiles;

    if (imageList.length) {
      await insertAssetDocuments({
        id32: Number(currentUser?.userId),
        id21: Number(selectedAssetData?.id),
        id67: 'A',
        idArrayStr: imageList,
        id22: 0,
      }).unwrap();
    }
  };

  // The review screen (UpdateDeleteAsset) already loaded the asset's photos
  // into the form; here we only need the server list to detect changes.
  // Same args as the review screen, so this is served from the RTK cache.
  const { data: uploadedImages } = useGetFileListByObjectIdQuery(
    {
      id: "A",
      id21: Modules.BPMOOptimization,
      id22: 0,
      id23: Number(selectedAssetData?.id ?? 0),
    },
    { skip: !selectedAssetData?.id },
  );

  const serverImageUris = useMemo(
    () =>
      (uploadedImages ?? [])
        .map((image) => image.url)
        .filter((url): url is string => Boolean(url)),
    [uploadedImages],
  );

  useScreenHeader({ title: 'Update Asset', showBack: true, showMenu: false, showLogo: false, backAction: 'custom', });






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


  // Insted of Save I want to use update Fild API to update the field value in backend. So I will use this function to save the field value in redux store and then call the update field API to update the value in backend.

  const updateAssetField = useCallback(
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


  const assetFieldKeyMap: Record<
    string,
    { original: string; updated: string }
  > = {
    assetName: {
      original: "originalAssetName",
      updated: "updatedAssetName",
    },
    location: {
      original: "originalLocation",
      updated: "updatedLocation",
    },
    assetType: {
      original: "originalAssetType",
      updated: "updatedAssetType",
    },
    assetClass: {
      original: "originalAssetClass",
      updated: "updatedAssetClass",
    },
    serialNumber: {
      original: "originalSerialNumber",
      updated: "updatedSerialNumber",
    },
    manufacturer: {
      original: "originalManufacturer",
      updated: "updatedManufacturer",
    },
    model: {
      original: "originalModel",
      updated: "updatedModel",
    },
    installedDate: {
      original: "originalInstalledDate",
      updated: "updatedInstalledDate",
    },
  };

  const getUpdatedFieldKey = (field: AssetField): string =>
    assetFieldKeyMap[field.fieldName]?.updated ?? field.fieldName;

  const getOriginalFieldValue = (field: AssetField): any => {
    const sectionData = assetForm.updateAssetForm[field.section];
    const originalKey = assetFieldKeyMap[field.fieldName]?.original;

    if (!sectionData || !originalKey) {
      return null;
    }

    return (sectionData as Record<string, any>)[originalKey] ?? null;
  };

  const getDisplayValue = (value: any): string => {
    if (value === null || value === undefined || value === "") {
      return "Not selected";
    }

    if (typeof value === "object") {
      return String(
        value.name ?? value.label ?? value.info ?? "Not selected"
      );
    }

    return String(value);
  };


  // =========================================================
  // GET FIELD VALUE
  // =========================================================

  const getFieldValue = useCallback(
    (field: AssetField) => {
      const sectionData = assetForm.updateAssetForm[field.section];

      if (!sectionData || typeof sectionData !== "object") {
        return "";
      }

      const updatedKey = getUpdatedFieldKey(field);

      const value = (sectionData as Record<string, any>)[updatedKey];

      if (value && typeof value === "object" && "name" in value) {
        return value.name;
      }

      return value ?? "";
    },
    [assetForm],
  );







  const renderFieldComparison = (field: AssetField) => {
    if (field.section === "custom") {
      return null;
    }

    const original = getDisplayValue(getOriginalFieldValue(field));
    const updated = getDisplayValue(getFieldValue(field));

    const isChanged =
      normalizeValue(original) !== normalizeValue(updated);

    return (
      <View className="mb-2 ">
        {/* Field label and status */}
        <View className="mb-2 flex-row items-center justify-end">
          {/* <AppText weight="medium" className="text-slate-900">
            {field.label}
            {field.isMandatory ? " *" : ""}
          </AppText> */}

          <View
            className={`rounded-full border px-2 py-1 ${isChanged
              ? "border-green-200 bg-green-50"
              : "border-blue-200 bg-blue-50"
              }`}
          >
            <AppText
              variant="bodySmall"
              className={isChanged ? " text-green-700!" : "text-blue-700!"}
            >
              {isChanged ? "Changed" : "Unchanged"}
            </AppText>
          </View>
        </View>

        {/* Original and updated comparison */}
        <View
          className={`flex-row rounded-lg p-3 ${isChanged ? "bg-slate-100" : " bg-blue-50"
            }`}
        >
          <View className="w-1/2 border-r border-slate-200 pr-3">
            <AppText variant="caption" className="text-slate-500">
              Original value
            </AppText>

            <AppText className="mt-1 text-slate-800">
              {original}
            </AppText>
          </View>

          <View className="w-1/2 pl-3">
            <AppText
              variant="caption"
              className={isChanged ? " text-green-700!" : "text-blue-600!"}
            >
              New value (Current)
            </AppText>

            <AppText className="mt-1 text-slate-900">
              {updated}
            </AppText>
          </View>
        </View>
      </View>
    );
  };


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

      // Keep your existing image section
      if (field.flag === 27) {
        return (
          <ImageUpload
            key={field.id}
            photos={assetForm.updateAssetForm.custom.uploadePhotos ?? []}
            onChange={(updatedPhotos) => {
              updateAssetField("custom", "uploadePhotos", updatedPhotos);
            }}
            maxPhotos={5}
            imageSize={96}
          />
        );
      }

      const updatedKey = getUpdatedFieldKey(field);

      const comparison = renderFieldComparison(field);

      // Text and number inputs
      if (field.flag === 1 || field.flag === 2) {
        return (
          <View key={field.id} className="mb-1">
            {comparison}

            <AssetFormField
              required={field.isMandatory}
              label={field.label}
              value={String(value ?? "")}
              rightIcon={field.flag === 1}
              type={field.flag === 2 ? "number" : "text"}
              onChangeText={(text) =>
                updateAssetField(field.section, updatedKey, text)
              }
            />
          </View>
        );
      }

      // Date picker
      if (field.flag === 7) {
        const fieldDateValue = parseStoredDate(value);

        return (
          <View key={field.id} className="mb-1">
            {comparison}

            <AppDatePicker
              label={field.label}
              placeholder={field.label}
              value={fieldDateValue ?? selectedDate}
              dateFormat="YYYY-MM-DD"
              onChange={(date) => {
                setSelectedDate(date);

                updateAssetField(
                  field.section,
                  updatedKey,
                  formatDateForStorage(date)
                );
              }}
            />
          </View>
        );
      }

      // Select, lookup, and location fields
      return (
        <View key={field.id} className="mb-1">
          {comparison}

          <AssetFormField
            required={field.isMandatory}
            label={field.label}
            value={String(value ?? "")}
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
        </View>
      );
    },
    [
      assetForm,
      getFieldValue,
      handleFieldPress,
      selectedDate,
      updateAssetField,
    ],
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
        <View className="flex-row items-center gap-3 mt-2 py-2">
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




  //  <View className="flex-row items-center justify-between rounded-lg bg-slate-100 p-2 px-2">

  //      {/*start This section represet the original and updated values of the asset fields. */}
  //       <View className="w-1/2 flex-col gap-2 pr-2">
  //         <AppText
  //           variant="bodySmall"
  //           weight="semibold"
  //         >
  //           Original
  //         </AppText>

  //         <AppText
  //           className="text-slate-800"
  //           numberOfLines={2}
  //         >
  //           Original value
  //         </AppText>
  //       </View>

  //        {/*end This section represet the original and updated values of the asset fields. */}

  //       {/* UPDATED */}
  //       <View className="w-1/2 flex-col gap-2 pl-2">
  //         <AppText
  //           variant="bodySmall"
  //           weight="semibold"
  //         >
  //           Updated
  //         </AppText>

  //         <AppText
  //           className="text-slate-800"
  //           numberOfLines={2}
  //         >
  //           Updated Value
  //         </AppText>
  //       </View>

  //     </View>



  const renderReviewScreen = useCallback(() => {
    const reviewData = buildReviewPayload();
    const uploadedPhotos =
      assetForm?.updateAssetForm?.custom.uploadePhotos ?? [];

    const getDisplayValue = (value: any): string => {
      if (value === null || value === undefined || value === "") {
        return "Not selected";
      }

      if (typeof value === "object") {
        return String(value?.name ?? value?.label ?? "Not selected");
      }

      return String(value);
    };

    return (
      <View className="flex-1">
        <View className="gap-2 py-3">
          {/* Review heading */}
          <View className="rounded-2xl border border-slate-200 bg-slate-50 p-2 px-4">
            <Heading level={5}>Review & Update</Heading>
            <AppText variant="caption" className="mt-1 text-slate-500">
              Please review the asset information before saving.
            </AppText>
          </View>

          {Object.entries(reviewData).map(([sectionKey, sectionValue]) => {
            const sectionConfig = getSectionInformation(
              sectionKey as AssetSection,
            );

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
                {/* Section header */}
                <View className="mb-3 flex-row items-center gap-2">
                  <View className="h-7 w-7 items-center justify-center rounded-lg bg-primary-light">
                    <AppIcon
                      name={sectionConfig.icon}
                      family={sectionConfig.family}
                      size={18}
                      color="#2563EB"
                    />
                  </View>

                  <AppText
                    variant="bodyLarge"
                    weight="semibold"
                    className="text-slate-800"
                  >
                    {sectionTitle}
                  </AppText>
                </View>

                {/* Keep the existing image section */}
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
                  /* Original / Updated field rows */
                  Object.entries(
                    sectionValue as Record<string, any>,
                  ).map(([fieldKey, fieldValue]) => {
                    const originalValue = fieldValue?.original;
                    const updatedValue = fieldValue?.updated;

                    const originalDisplay =
                      getDisplayValue(originalValue);
                    const updatedDisplay =
                      getDisplayValue(updatedValue);

                    const isChanged =
                      originalDisplay !== updatedDisplay;

                    const fieldLabel = fieldKey
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (char) => char.toUpperCase());

                    return (
                      <View key={fieldKey} className="mb-4">
                        {/* Field name + change status */}
                        <View className="mb-2 flex-row items-center justify-between">
                          <AppText
                            className="flex-1 text-slate-700"
                            weight="medium"
                          >
                            {fieldLabel}
                          </AppText>

                          <View
                            className={`rounded-3xl border px-3 py-1 ${isChanged
                              ? "border-green-200 bg-green-100 "
                              : "  border-blue-200 bg-blue-100"
                              }`}
                          >
                            <AppText
                              variant="bodySmall"
                              weight="medium"
                              className={
                                isChanged
                                  ? "text-green-800!"
                                  : " text-blue-800!"
                              }
                            >
                              {isChanged ? "Changed" : "Unchanged"}
                            </AppText>
                          </View>
                        </View>

                        {/* Original and Updated side by side */}
                        <View
                          className={`flex-row rounded-lg p-3 ${isChanged ? "bg-slate-100" : " bg-blue-50"
                            }`}
                        >
                          {/* Original */}
                          <View className="w-1/2 border-r border-slate-200 pr-3">
                            <AppText
                              variant="caption"
                              className="text-slate-500"
                            >
                              Original value
                            </AppText>

                            <AppText
                              className="mt-1 text-slate-800"
                            >
                              {originalDisplay}
                            </AppText>
                          </View>

                          {/* Updated */}
                          <View className="w-1/2 pl-3">
                            <AppText
                              variant="caption"
                              className={
                                isChanged
                                  ? "text-green-700! "
                                  : " text-blue-600!"
                              }
                            >
                              New value (Current)
                            </AppText>

                            <AppText
                              className={
                                isChanged
                                  ? "mt-1 font-semibold text-slate-800"
                                  : "mt-1  text-blue-800"
                              }
                            >
                              {updatedDisplay}
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
      </View>
    );
  }, [
    assetForm?.updateAssetForm,
    buildReviewPayload,
    getSectionInformation,
  ]);

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

            <View key={section} >
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

  const goToPreviousScreen = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(APP_ROUTES.assetAssignment);
    }
  }, [router]);

  const hasFormChanges = useMemo(() => {
    // =========================================================
    // CHECK NORMAL FORM FIELDS
    // =========================================================

    const fieldChanged = formFields.some((field) => {

      if (field.section === 'custom') {
        return false;
      }

      const original = getDisplayValue(
        getOriginalFieldValue(field)
      );

      const updated = getDisplayValue(
        getFieldValue(field)
      );

      return (
        normalizeValue(original) !==
        normalizeValue(updated)
      );
    });

    if (fieldChanged) {
      return true;
    }

    // =========================================================
    // CHECK IMAGES
    // =========================================================

    // Previously compared the photo list with itself, so added/removed
    // photos never counted as a change.
    const currentImageUris = (assetForm?.updateAssetForm?.custom?.uploadePhotos ?? [])
      .map((photo) => photo.uri)
      .sort();
    const sortedServerUris = [...serverImageUris].sort();

    return (
      currentImageUris.length !== sortedServerUris.length ||
      currentImageUris.some((uri, index) => uri !== sortedServerUris[index])
    );

  }, [
    formFields,
    assetForm,
    serverImageUris,
  ]);


  const handleBack = useCallback(() => {
    // Ignore back while saving: leaving mid-save hides the result.
    if (isSaving) return;

    // Review → previous step
    if (isReviewMode) {
      setIsReviewMode(false);
      return;
    }

    // Step 3 → Step 2
    // Step 2 → Step 1
    if (currentStep > 0) {
      setCurrentStep((previous) => previous - 1);
      return;
    }

    // Step 1 → leave screen
    if (hasFormChanges) {

      Alert.alert(
        'Discard Changes?',
        'You have edited the asset information. If you go back, your changes will be reset.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
              dispatch(resetUpdateAssetForm());
              goToPreviousScreen();
            },
          },
        ],
      );

      return;
    }

    // No changes
    goToPreviousScreen();

  }, [
    currentStep,
    isReviewMode,
    hasFormChanges,
    isSaving,
    dispatch,
    router,
  ]);



  // Previously this effect re-ran whenever handleBack changed (i.e. on every
  // keystroke once the back arrow had been pressed once), popping the
  // "Discard changes?" dialog or leaving the screen while the user typed.
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



  const getAssetFieldValue = useCallback(
    (columnName: string) => {
      const form = assetForm?.updateAssetForm;

      switch (columnName) {
        // --------------------------------
        // GENERAL
        // --------------------------------

        case "Name":
          return form?.general?.updatedAssetName ?? "";

        // --------------------------------
        // TECHNICAL
        // --------------------------------

        case "Manufacturer":
          return form?.technical?.updatedManufacturer?.name ?? "";

        case "MakeModel":
          return form?.technical?.updatedModel ?? "";



        case "InstalledDate":
          return form?.technical?.updatedInstalledDate ?? "";

        // --------------------------------
        // CLASSIFICATION
        // --------------------------------

        case "AssetType":
          return form?.classification?.updatedAssetType?.name ?? "";

        case "SerialNum":
          return form?.classification?.updatedSerialNumber ?? "";

        case "AssetClass":
          return form?.classification?.updatedAssetClass?.name ?? "";


        // --------------------------------
        // LOCATION
        // --------------------------------

        case "Location":
          return form?.location?.updatedLocation?.name ?? "";


        // --------------------------------
        // DEFAULT
        // --------------------------------

        default:
          return "";
      }
    },
    [assetForm]
  );


  // ========================================================
  //  Update Asset

  const updateSingleAssetField = async (
    field: typeof myAssetUpdateFields[number],
    assetId: string
  ) => {
    const columnName =
      currentUser?.companyCode === "JNJ"
        ? field.aXColunmName
        : field.colunmName;

    const payload = {
      id21: Number(currentUser?.siteId),
      id: columnName,
      id1: getAssetFieldValue(field.colunmName) ?? "",
      id2: assetId,
      id22: Number(currentUser?.userId),
      id23: Modules.CMMSDataQuality,
      id24: 0,
      id25: 0,
      id3: "",
    };

    try {
      await updateAssetWalkDownDetails(payload).unwrap();
      return { success: true, field: columnName };
    } catch (error: any) {
      return { success: false, field: columnName, error };
    }
  };

  /**
   * Backend columns that this screen can edit AND whose value changed.
   *
   * The old code sent an update for every column returned by the API. Columns
   * the app does not support resolved to "" in getAssetFieldValue, so saving
   * silently blanked them on the server.
   */
  const getChangedBackendFields = () => {
    const changedFieldIds = new Set(
      formFields
        .filter((field) => field.section !== 'custom')
        .filter(
          (field) =>
            normalizeValue(getDisplayValue(getOriginalFieldValue(field))) !==
            normalizeValue(getDisplayValue(getFieldValue(field))),
        )
        .map((field) => field.id),
    );

    return myAssetUpdateFields.filter((item) => changedFieldIds.has(item.id as number));
  };


  const updateNewAsset = async () => {
    if (isSaving) return;
    setIsCreateAssetConfirmationVisible(false);

    const assetId = String(selectedAssetData?.id ?? "").trim();

    if (!assetId) {
      danger({
        title: "Update Failed",
        message: "Asset ID is missing.",
        duration: 5000,
      });
      return;
    }

    setIsSaving(true);

    try {
      const failedFields: string[] = [];

      for (const field of getChangedBackendFields()) {
        const result = await updateSingleAssetField(field, assetId);
        if (!result.success) {
          failedFields.push(field.displayColnumName || field.colunmName);
        }
      }

      let imagesFailed = false;
      let imageErrorMessage = "";
      try {
        await uploadAssetImages();
      } catch (error) {
        if (__DEV__) console.warn("Asset image upload failed:", error);
        imagesFailed = true;
        imageErrorMessage = getUploadErrorMessage(error);
      }

      if (failedFields.length > 0 || imagesFailed) {
        // Keep the form so the user can retry what failed.
        warning({
          title: "Partially Updated",
          message: [
            failedFields.length ? `Not saved: ${failedFields.join(", ")}.` : "",
            imagesFailed ? `Photos: ${imageErrorMessage}` : "",
          ].filter(Boolean).join(" "),
          duration: 6000,
        });
        return;
      }

      success({
        title: "Asset Updated",
        message: "Asset information and images updated successfully.",
        duration: 5000,
      });

      // Reload the asset list BEFORE leaving, so My Assignment opens with the
      // updated asset instead of the old cached list.
      try {
        await dispatch(
          walkdownApi.endpoints.getAssetListByActivityId.initiate(assetListArgs, {
            forceRefetch: true,
            subscribe: false,
          }),
        ).unwrap();
      } catch (error) {
        // Not fatal: My Assignment still refetches on its own.
        if (__DEV__) console.warn("[UpdateAssetDetail] Asset list refresh failed:", error);
      }

      dispatch(resetUpdateAssetForm());
      // Go back to the list instead of stacking a second copy of it.
      if (router.canDismiss()) {
        router.dismissTo(APP_ROUTES.assetAssignment);
      } else {
        router.replace(APP_ROUTES.assetAssignment);
      }
    } catch (error) {
      if (__DEV__) console.warn("Update asset error:", error);

      danger({
        title: "Update Failed",
        message: "Unable to update asset. Please try again.",
        duration: 5000,
      });
    } finally {
      setIsSaving(false);
    }
  };

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



  return (
    <Screen>
      {/* =================================================
                PROGRESS
            ================================================== */}


      <AppStepper
        steps={steps}
        currentStep={safeCurrentStep}
        totalSteps={totalSteps}
      />

      {/* =================================================
                CURRENT STEP
            ================================================== */}

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        // iOS: keep the focused input above the keyboard.
        automaticallyAdjustKeyboardInsets
        contentContainerStyle={{
          paddingVertical: 12,
          paddingBottom: 24,
          flexGrow: 1,
        }}
      >

        {renderCurrentStep()}
      </ScrollView>

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
            loading={isReviewMode && isSaving}
            className={currentStep > 0 ? "flex-1" : ""}
            onPress={handleContinue}
          >
            <View className="flex-row items-center justify-center gap-2">
              <AppText variant="body" weight="semibold" className="text-white">
                {isReviewMode ? "Update Asset" : currentStep === totalSteps - 1 ? "Review" : "Continue"}
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
                        updateAssetField(
                          activeField.section,
                          getUpdatedFieldKey(activeField),
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
                        updateAssetField(
                          activeField.section,
                          getUpdatedFieldKey(activeField),
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
                  updateAssetField(
                    activeField.section,
                    getUpdatedFieldKey(activeField),
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
        size="medium">
        <View>
          <View className="flex flex-col items-center justify-center gap-2">
            <View className="w-20 h-20 rounded-full border-2 border-warning  flex items-center justify-center text-center">
              <AppIcon family="Ionicons" name="alert" size={30} color="#F59E0B" />
            </View>

            <Heading level={3} className="">Are You Sure ?</Heading>
            <AppText className="text-text-secondary text-center w-2/3 mb-2">
              Do you want  to Update Asset ?
            </AppText>
          </View>
          <View className="flex flex-col gap-2 mt-2">
            <Button title="Yes" fullWidth loading={isSaving} onPress={updateNewAsset} />
            <Button variant="outline" fullWidth className="border border-error" onPress={() => setIsCreateAssetConfirmationVisible(false)}>
              <AppText className="text-error! font-bold" >Cancel</AppText>
            </Button>
          </View>
        </View>
      </AppBottomSheet>
    </Screen>
  );
}

export default UpdateAssetDetail
