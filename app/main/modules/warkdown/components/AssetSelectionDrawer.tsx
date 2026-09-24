import { useMemo, useState } from 'react';
import {
    FlatList,
    Pressable,
    View,
} from 'react-native';

import AppIcon from '@/app/common/components/ui/AppIcon';
import Button from '@/app/common/components/ui/Button/Button';
import { useDebounce } from '@/app/common/components/ui/generic_function/useDebounce';
import SearchInput from '@/app/common/components/ui/SearchInput/SearchInput';
import { AppText } from '@/app/common/components/ui/Typography';


type Props = {
    Height: number;
    data: any[];
    selectedId?: string | number | null;
    title?: string;
    showSelectedFooter?: boolean;
    showContinue?: boolean;
    onSelect: (item: any) => void;
    onContinue?: (item: any) => void;
    showSearch?: boolean;

};


const AssetSelectionDrawer = ({
    data,
    Height,
    selectedId,
    title = 'Item',
    showSelectedFooter = true,
    showContinue = true,
    onSelect,
    onContinue,
    showSearch = true,
}: Props) => {

    const [selectedNode, setSelectedNode] = useState<any>(null);
    const [searchList, setSearchList] = useState("");
    const debouncedSearch = useDebounce(searchList, 300);



    const filteredItemListData = useMemo(() => {
        const query = debouncedSearch.trim().toLowerCase();

        if (!query) {
            return data;
        }

        return data.filter((item) => {
            const searchableValues = [
                item?.siteName,
                item?.info,
                item?.name,
                item?.code,
                item?.id,
                item?.parentId,
            ];

            return searchableValues.some((value) =>
                String(value ?? "").toLowerCase().includes(query)
            );
        });
    }, [data, debouncedSearch]);








    // =========================================================
    // SEARCH
    // =========================================================

    /**
     * Search is performed against the currently loaded tree.
     *
     * Important:
     * This does NOT recursively scan/render all 2152 rows.
     * It creates a filtered data structure, then FlatList
     * virtualizes the visible rows.
     */



    const handleSelect = (item: any) => {
        setSelectedNode(item);
        onSelect(item);
    };

    const clearSelection = () => {
        setSelectedNode(null);
    };

    const renderItem = ({ item }: { item: any }) => {

        const isSelected =
            String(selectedId ?? selectedNode?.id ?? '') ===
            String(item.id);

        return (
            <Pressable
                onPress={() => handleSelect(item)}
                className={`flex-row items-center px-2 py-4 border-b rounded-2xl border-slate-100 ${isSelected
                        ? 'bg-blue-50'
                        : 'bg-white'
                    }`}

            >
                <View
                    className={`w-10 h-10 rounded-2xl items-center justify-center mr-3 ${isSelected
                            ? 'bg-blue-100'
                            : 'bg-slate-100'
                        }`}
                >
                    <AppIcon
                        family="Feather"
                        name={isSelected ? 'check' : 'list'}
                        size={18}
                        color={
                            isSelected
                                ? '#2563EB'
                                : '#64748B'
                        }
                    />
                </View>

                <View className="flex-1">
                    <AppText
                        variant="body"
                        weight="semibold"
                        numberOfLines={1}
                    >
                        {item.info ?? item.name ?? item.code ?? item.id}
                    </AppText>
                </View>

                {isSelected && (
                    <AppIcon
                        family="Feather"
                        name="check-circle"
                        size={20}
                        color="#2563EB"
                    />
                )}
            </Pressable>
        );
    };



    if (!data?.length) {
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
                    No Data Found
                </AppText>

                {/* Description */}
                <AppText
                    className="mt-2 max-w-70 text-center text-text-tertiary"
                >
                    No Data are currently available for this user.
                </AppText>
            </View>
        );
    }

    return (
        <View className="flex-1 " style={{
            flex: 1,
            height:
                Height !== undefined
                    ? Height
                    : undefined,
        }}>


            <View className='mb-2'>
                <SearchInput
                    value={searchList}
                    onChangeText={setSearchList}
                    placeholder={`Search ${title}`}
                />
            </View>

            {/* LIST */}
            <View className="flex-1">
                <FlatList
                    data={filteredItemListData ?? []}
                    keyExtractor={(item, index) =>
                        String(item.id ?? index)
                    }
                    renderItem={renderItem}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                />
            </View>

            {/* SELECTED FOOTER */}
            {showSelectedFooter && (
                <View className="shrink-0 border-t border-slate-100 pt-3 mt-2">

                    <AppText
                        variant="caption"
                        className="text-slate-400 mb-2"
                    >
                        SELECTED {title.toUpperCase()}
                    </AppText>

                    <View className="flex-row items-center mb-3">

                        {/* ICON */}
                        <View className="w-9 h-9 rounded-lg bg-primary/10 items-center justify-center">
                            <AppIcon
                                name="map-pin"
                                family="Feather"
                                size={18}
                                color="#2563EB"
                            />
                        </View>

                        {/* SELECTED INFORMATION */}
                        <View className="flex-1 ml-3">

                            {selectedNode ? (
                                <>
                                    <AppText
                                        weight="semibold"
                                        numberOfLines={1}
                                    >
                                        {selectedNode.info ??
                                            selectedNode.name ??
                                            selectedNode.code ??
                                            selectedNode.id}
                                    </AppText>

                                    {!!selectedNode.parentId && (
                                        <AppText
                                            variant="caption"
                                            className="text-slate-500"
                                            numberOfLines={1}
                                        >
                                            {selectedNode.parentId}
                                        </AppText>
                                    )}
                                </>
                            ) : (
                                <AppText className="text-slate-400">
                                    Not selected
                                </AppText>
                            )}

                        </View>

                        {/* CHANGE */}
                        {selectedNode && (
                            <Pressable
                                onPress={clearSelection}
                            >
                                <AppText className="text-[#2563EB]! font-semibold">
                                    Change
                                </AppText>
                            </Pressable>
                        )}

                    </View>

                    {/* CONTINUE BUTTON */}
                    {showContinue && (
                        <Button
                            fullWidth
                            disabled={!selectedNode}
                            onPress={() => {
                                if (selectedNode) {
                                    onContinue?.(selectedNode);
                                }
                            }}
                        >
                            <AppText className="text-white font-semibold">
                                Continue
                            </AppText>
                        </Button>
                    )}

                </View>
            )}

        </View>
    );
};

export default AssetSelectionDrawer;