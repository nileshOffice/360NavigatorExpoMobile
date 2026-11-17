import { Site } from '@/src/auth/auth.types';
import { useUpdateUserSessionOnSiteChangeMutation } from '@/src/auth/authApi';
import { setCredentials, setSelectedSite, setSiteSelectionOpen } from '@/src/auth/authSlice';
import { useGetModuleListByUserSidMutation, useGetSiteListByCompanyIdMutation, useGetsiteListByUserIdMutation, useLazyGetCompanyListQuery } from '@/src/common/api/commonApi';
import AppBottomSheet from '@/src/common/components/ui/bottom_sheet';
import { AppText } from '@/src/common/components/ui/Typography';
import Heading from '@/src/common/components/ui/Typography/Heading';
import { APP_ROUTES } from '@/src/common/config/routes';
import { Roles } from '@/src/common/constants/global_enum';
import { useScreenHeader } from '@/src/common/hooks/useScreenHeader';
import Screen from '@/src/common/layouts/Screen';
import { setModuleList } from '@/src/common/redux/homeSlice/moduleSlice';
import { getErrorStatus } from '@/src/common/utils/errorHandler';
import { useAppDispatch, useAppSelector } from '@/src/lib/store/hooks';
import { RootState } from '@/src/lib/store/store';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';
import { useSelector } from 'react-redux';
import ModuleList from '@/src/main/modules/common/ModuleList';
import SiteList from '@/src/main/modules/common/SiteList';


const Home = () => {

  const {
    currentUser,
  } = useAppSelector((state) => state.auth);

  const {
  moduleList,
  moduleSiteId,
  moduleLoaded,
} = useAppSelector((state) => state.allModules);

  

  const dispatch = useAppDispatch();
  const router = useRouter();
  const [sites, setSites] = useState<Site[]>([]);
 

 const siteSelectionOpen = useSelector(
    (state: RootState) => state.auth.siteSelectionOpen
  );


  const selectedSite = useSelector(
  (state: RootState) => state.auth.selectedSite
);



    useScreenHeader({ title: '', showBack: false, showMenu: true, showLogo: false, backAction: 'goBack', });


  const [
    getSiteListUserId,
    { isLoading: isSiteListByUserIdLoading },
  ] = useGetsiteListByUserIdMutation();

  const [
    getSiteListCompanyId,
    { isLoading: isSiteListByCompanyIdLoading },
  ] = useGetSiteListByCompanyIdMutation();

  const [getCompanyList, { isLoading: isGetCompanyListLoading },] = useLazyGetCompanyListQuery()
  const [updateSessionSiteChange, {isLoading:isUpdateSessionSiteLoading} ] = useUpdateUserSessionOnSiteChangeMutation()

    const [
    getModuleListSid,
    { isLoading: isGetModuleListLoading },
  ] = useGetModuleListByUserSidMutation();


  




const getSiteList = async () => {
  if (!currentUser) return;

  if (currentUser.isCompanyAccess === true) {
    getCompanyListData();
  }

  const isCompanyAdmin =
    Number(currentUser.roleId) === Roles.companyAdmin;

  const idDto = {
    id: isCompanyAdmin
      ? currentUser.companyId
      : currentUser.userId,
    id22: currentUser.userId,
  };

  try {
    const response = isCompanyAdmin
      ? await getSiteListCompanyId(idDto).unwrap()
      : await getSiteListUserId(idDto).unwrap();

    // Replace (not append): appending duplicated every site when reloaded.
    const nextSites = (Array.isArray(response) ? response : []) as Site[];

    // Keep the complete list locally for drawer/site selection
    setSites(nextSites as Site[]);

    // --------------------------------
    // No sites
    // --------------------------------
    if (nextSites.length === 0) {
       dispatch(setSiteSelectionOpen(false));
      return;
    }

     if (selectedSite) {
      const existingSite = nextSites.find(
        site => Number(site.id) === Number(selectedSite.id)
      );

      if (existingSite) {
        // Keep the persisted selected site
        dispatch(setSelectedSite(existingSite));

        // Make sure drawer stays closed
        dispatch(setSiteSelectionOpen(false));

        // Load modules
        await getMobModuleListBySId(Number(existingSite.id));

        return;
      }
    }

    // --------------------------------
    // Multiple sites
    // → Open site selection drawer
    // --------------------------------
    if (nextSites.length > 1) {
      dispatch(setSiteSelectionOpen(true));
      return;
    }

    // --------------------------------
    // Exactly one site
    // → Automatically select it
    // --------------------------------
    
    const onlySiteSelected = nextSites[0] as Site;
    dispatch(setSelectedSite(onlySiteSelected));
    dispatch(setSiteSelectionOpen(false));

    const siteId = Number(onlySiteSelected.id);

    if (!siteId) {
      return;
    }
    // Load modules for selected site
    await getMobModuleListBySId(siteId);
  } catch (error) {
    const status = getErrorStatus(error);

    if (status === 401) {
      return;
    }

    console.error('Failed to load site list:', error);
  }
};





const getCompanyListData = async () => {
  // Result is not used yet; errors are surfaced by the global API alert.
  await getCompanyList().unwrap().catch(() => {});
}


const handleSiteSubmit = async (selectedSite: Site | null) => {
  if (!selectedSite) return;

  const idDto = {
    id1: currentUser?.id1,
    id2: currentUser?.id2,
    id3: currentUser?.id3,
    id4: currentUser?.id4,
    id5: currentUser?.id5,
    id6: currentUser?.id6,
    id7: currentUser?.id7,
    id8: currentUser?.id8,

    id21: Number(currentUser?.sessionId),
    id22: Number(currentUser?.userId),
    id23: Number(currentUser?.siteId),
    id24: Number(currentUser?.companyId),
  };

  try {
    // NOTE: id23 is the *current* (old) site as in the original code.
    // Confirm with the backend whether it expects the newly selected site.
    const session = await updateSessionSiteChange(idDto).unwrap();

    // Update session information
    // Update Redux/auth state
    dispatch(
      setCredentials({
        currentUser: {
          ...currentUser,
          sessionId: Number(session?.sessionId),
          sessionToken: session?.sessionToken,
        },
      })
    )

    dispatch(setSelectedSite(selectedSite));
    dispatch(setSiteSelectionOpen(false));




   // Load modules for selected site
    getMobModuleListBySId(selectedSite?.id);
  } catch (error) {
    console.error("Failed to update user session:", error);
  }
};


  const getMobModuleListBySId = async (sId: number) => {
    const siteId = Number(sId);

    if (!siteId) return;

    // Don't call API if modules
    // are already loaded for this site
    if (
      moduleLoaded &&
      Number(moduleSiteId) === siteId
    ) {
      return;
    }

    const idDto = {
      id21: Number(currentUser?.companyId),
      id22: siteId,
      id23: Number(currentUser?.userId),
    };

    try {
      const response = await getModuleListSid(idDto).unwrap();

      dispatch(
        setModuleList({
          moduleList: response,
          siteId,
        })
      );
    } catch {
      // Error already shown by the global API alert.
    }
  };


  const onHandleSelectModule = (item:any) => {
    if(item.redirectURL === "/dqa-mob-asset-registry")  {
           router.push(APP_ROUTES.assetRegistry);
    }
    else {
      Alert.alert("Coming soon", "This module is not available on mobile yet.")
    }
   
  }




 useEffect(() => {
      getSiteList();
  }, []);
  

  return (
    <Screen className="flex-1">
      <View className="flex-1 gap-3">
        <View>
          <AppText variant={"h5"} className="text-text-tertiary">Welcome back ,</AppText>
          <Heading level={2} className="mt-1 ">
            {currentUser?.fullName}
          </Heading>
      
        </View>

        <View className='flex-1 '>
           <ModuleList moduleList={moduleList} isLoading={isGetModuleListLoading} isSiteLoading={isSiteListByUserIdLoading || isSiteListByCompanyIdLoading} onHandleModuleList={onHandleSelectModule}/>
        </View>
      
      </View>
     
     <AppBottomSheet
        visible={siteSelectionOpen}
        onClose={() =>  dispatch(setSiteSelectionOpen(false))}
        enableContentPanningGesture={false}
        enablePanDownToClose={false}
        title="Select Site"
        size="large"
        description='Choose the site you want to continue'
     > 
        <View className="flex-1 h-150">
          <SiteList siteList={sites} onHandleSiteList={handleSiteSubmit} isLoading={isSiteListByUserIdLoading || isSiteListByCompanyIdLoading} />
        </View>
      
     </AppBottomSheet>
    </Screen>
  );
};

export default Home;