import { useUpdateUserSessionOnSiteChangeMutation } from '@/app/auth/authApi';
import { setCredentials, setSelectedSite, setSiteSelectionOpen } from '@/app/auth/authSlice';
import { useGetModuleListByUserSidMutation, useGetSiteListByCompanyIdMutation, useGetsiteListByUserIdMutation, useLazyGetCompanyListQuery } from '@/app/common/api/commonApi';
import AppBottomSheet from '@/app/common/components/ui/bottom_sheet';
import { AppText } from '@/app/common/components/ui/Typography';
import Heading from '@/app/common/components/ui/Typography/Heading';
import { Roles } from '@/app/common/constants/global_enum';
import Screen from '@/app/common/layouts/Screen';
import { getErrorStatus } from '@/app/common/utils/errorHandler';
import { useAppDispatch, useAppSelector } from '@/app/lib/store/hooks';
import { RootState } from '@/app/lib/store/store';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import ModuleList from './ModuleList';
import SiteList from './SiteList';

const Home = () => {

  const {
    currentUser,
  } = useAppSelector((state) => state.auth);

  const dispatch = useAppDispatch();
  const router = useRouter();
   const [moduleList, setModuleList] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [sessionId, setSessionId] = useState<any>();
  const [sessionToken , setSessionToken] = useState('')
 

 const siteSelectionOpen = useSelector(
    (state: RootState) => state.auth.siteSelectionOpen
  );


  const selectedSite = useSelector(
  (state: RootState) => state.auth.selectedSite
);


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

    const nextSites = [...sites, ...response];

    // Keep the complete list locally for drawer/site selection
    setSites(nextSites);

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
    
    const onlySiteSelected = nextSites[0];
    dispatch(setSelectedSite(onlySiteSelected));
    dispatch(setSiteSelectionOpen(false));


    // Store selected site in Redux
    dispatch(setSelectedSite(onlySiteSelected));
    console.log('Selected site:', onlySiteSelected);
    const siteId = Number(onlySiteSelected.id);

    if (!siteId) {
      console.log('Site ID not found');
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

  const response = await getCompanyList().unwrap();

}


const handleSiteSubmit = async (selectedSite: any) => {
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
    const session = await updateSessionSiteChange(idDto).unwrap();
     setSessionId(Number(session?.sessionId))
     setSessionToken(session?.sessionToken)
     
   

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
    const idDto = {
      id21: Number(currentUser?.companyId),
      id22: Number(sId),
      id23: Number(currentUser?.userId)
    }

    try {
      const response = await getModuleListSid(idDto).unwrap()
      setModuleList(response) 
    } catch (error) {

    }
  }


  const onHandleSelectModule = () => {
     
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