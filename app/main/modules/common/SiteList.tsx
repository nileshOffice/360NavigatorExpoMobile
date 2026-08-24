import { setCompanySelectedByUser } from '@/app/auth/authSlice';
import AppIcon from '@/app/common/components/ui/AppIcon';
import Button from '@/app/common/components/ui/Button/Button';
import Card from '@/app/common/components/ui/Card/Card';
import CardSkeleton from '@/app/common/components/ui/CardSkeleton';
import { useDebounce } from '@/app/common/components/ui/generic_function/useDebounce';
import SearchInput from '@/app/common/components/ui/SearchInput/SearchInput';
import { AppText } from '@/app/common/components/ui/Typography';
import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import React, { useMemo, useState } from 'react';
import { View } from 'react-native';


type Site = {
    id: string;
    siteName: string;
    siteDescription?: string;
};

type SiteListProps = {
    siteList: Site[];
    onHandleSiteList: (selectedSite: Site | null) => void;
     isLoading: boolean;
};

const SiteList = ({ siteList ,onHandleSiteList, isLoading }: SiteListProps) => {
    const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
    const [searchSite, setSearchSite] = useState("");

    const debouncedSearch = useDebounce(searchSite, 300);


   const filteredSites = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();

    if (!query) {
        return siteList;
    }

    return siteList.filter((site) =>
        site?.siteName?.toLowerCase().includes(query)
    );
}, [siteList, debouncedSearch]);


    if (isLoading) {
        return (
            <View className="flex-1">
                {Array.from({ length: 10 }).map((_, index) => (
                    <CardSkeleton  key={`module-skeleton-${index}`} className="mb-3" />
                ))}
            </View>
        )
    }

    if (!siteList?.length) {
        return (
            <View className="flex-1 items-center justify-center px-6">
                {/* Icon */}
                <View className="h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                    <AppIcon
                         family="MaterialCommunityIcons" name="factory"
                        size={30}
                        color="#64748B"
                    />
                </View>

                {/* Title */}
                <AppText
                    variant="h6"
                    className="mt-4 text-center text-text-primary"
                >
                    No Sites Found
                </AppText>

                {/* Description */}
                <AppText
                    className="mt-2 max-w-70 text-center text-text-tertiary"
                >
                    No sites or plants are currently available for this user.
                </AppText>
            </View>
        );
    }

 
    return (
        <>



          
           <View className='mb-2'>
              <SearchInput
                value={searchSite}
                onChangeText={setSearchSite}
                placeholder="Search sites"
            />
           </View>

          
            <BottomSheetFlatList
                data={filteredSites}

                keyExtractor={(item, index) =>
                    `${item.id}-${index}`
                }
                style={{ flex: 1, }}
                contentContainerStyle={{
                    paddingBottom: 16,
                }}
                showsVerticalScrollIndicator
                renderItem={({ item }) => (
                   
                    <Card 
                        className={`mb-2 p-4 ${selectedSiteId === item.id ? 'bg-primary-light border-primary/35 ' : ''}`}
                        pressable 
                        onPress={() => {
                            setSelectedSiteId(item.id);
                            setCompanySelectedByUser(item);
                        }}
                    >  
                        <View className='flex-row gap-4'>
                            <View className='bg-primary/12 w-14 h-14 rounded-full items-center justify-center'>
                                <AppIcon family="MaterialCommunityIcons" name="factory" size={26} color="#172033" />
                            </View>
                            <View>
                                <AppText variant='h6'>{item?.siteName}</AppText>
                                <AppText variant="bodySmall" >{item?.siteDescription}</AppText>
                                {/* {item.location && (
                                    <AppText>{item.location}</AppText>
                                )} */}
                            </View>
                        </View>
                    </Card>

               
                    
                )}

            ></BottomSheetFlatList>


            
            <View className="pt-4">
                <Button title='Select' fullWidth onPress={() => {
                    const selected = filteredSites.find(site => site.id === selectedSiteId);
                    onHandleSiteList(selected || null);
                }} >
                  
                </Button>
            </View>
        </>
    );
};

export default SiteList;