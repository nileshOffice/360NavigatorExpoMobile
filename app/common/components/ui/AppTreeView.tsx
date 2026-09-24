import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    TextInput,
    View,
} from 'react-native';

import AppIcon from '@/app/common/components/ui/AppIcon';
import Button from '@/app/common/components/ui/Button/Button';
import { AppText } from '@/app/common/components/ui/Typography';
import { useDebounce } from './generic_function/useDebounce';

export type TreeNode = {
    id: string | number;
    code?: string;
    name: string;
    level?: number;

    // Children can be loaded initially or lazily.
    children?: TreeNode[];
    hasChildren?: boolean;

    // Lazy-loading state.
    isLoading?: boolean;
    isLoaded?: boolean;

    // Backend-specific data.
    originalData?: any;
};

type VisibleTreeNode = {
    node: TreeNode;
    depth: number;
};

type AppTreeViewProps = {
    data: TreeNode[];

    title?: string;
    searchPlaceholder?: string;

    selectedId?: string | number | any;

    onSelect?: (node: TreeNode) => void;
    onContinue?: (node: TreeNode) => void;

    /**
     * Called when a node with children is expanded for the first time.
     *
     * Return the children received from your API.
     *
     * Example:
     * loadChildren={async (node) => {
     *     const response = await api.getLocationHierarchyBySidId(...);
     *     return response.map(mapApiNode);
     * }}
     */
    loadChildren?: (node: TreeNode) => Promise<TreeNode[]>;

    showContinue?: boolean;
    showSearch?: boolean;
    showSelectedFooter?: boolean;
    multiSelect?: boolean;

    Height?: number;
};

const AppTreeView = ({
    data,

    title = '',

    searchPlaceholder = 'Search...',

    selectedId = null,

    onSelect,
    onContinue,

    loadChildren,

    showContinue = true,
    showSearch = true,
    showSelectedFooter = true,

    multiSelect = false,

    Height,
}: AppTreeViewProps) => {
    // =========================================================
    // STATE
    // =========================================================

    const [treeData, setTreeData] = useState<TreeNode[]>(data);
    const [search, setSearch] = useState('');
    const [expandedIds, setExpandedIds] = useState<(string | number)[]>([]);
    const [internalSelectedId, setInternalSelectedId] = useState<string | number | null>(selectedId ?? null);
    const [internalSelectedNode, setInternalSelectedNode] = useState<TreeNode | null>(null);
     const debouncedSearch = useDebounce(search, 300);

    // Used to prevent duplicate API calls when the same node is tapped
    // multiple times while its children are loading.
    const [loadingIds, setLoadingIds] = useState<
        (string | number)[]
    >([]);

    // =========================================================
    // KEEP INTERNAL TREE IN SYNC WITH PARENT DATA
    // =========================================================

    useEffect(() => {
        setTreeData(data);
    }, [data]);

    useEffect(() => {
        if (selectedId !== null && selectedId !== undefined) {
            setInternalSelectedId(selectedId);
        }
    }, [selectedId]);

    // =========================================================
    // SELECTED ID
    // =========================================================

    const currentSelectedId =
        selectedId !== null && selectedId !== undefined
            ? selectedId
            : internalSelectedId;

    // =========================================================
    // HELPERS
    // =========================================================

    const nodeHasChildren = useCallback((node: TreeNode) => {
        return (
            node.hasChildren === true ||
            !!node.children?.length
        );
    }, []);

    const nodeIsLoading = useCallback(
        (node: TreeNode) => {
            return (
                node.isLoading === true ||
                loadingIds.includes(node.id)
            );
        },
        [loadingIds],
    );

    // =========================================================
    // UPDATE A NODE INSIDE THE TREE
    // =========================================================

    const updateNodeById = useCallback(
        (
            nodes: TreeNode[],
            nodeId: string | number,
            updater: (node: TreeNode) => TreeNode,
        ): TreeNode[] => {
            return nodes.map(node => {
                if (node.id === nodeId) {
                    return updater(node);
                }

                if (node.children?.length) {
                    return {
                        ...node,
                        children: updateNodeById(
                            node.children,
                            nodeId,
                            updater,
                        ),
                    };
                }

                return node;
            });
        },
        [],
    );

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
    const filteredData = useMemo(() => {
        // const searchText = search.trim().toLowerCase();
      const query = debouncedSearch.trim().toLowerCase();


        if (!query) {
            return treeData;
        }


       

        const filterTree = (
            nodes: TreeNode[],
        ): TreeNode[] => {
            return nodes.reduce<TreeNode[]>(
                (result, node) => {
                    const code =
                        node.code?.toLowerCase() ?? '';

                    const name =
                        node.name?.toLowerCase() ?? '';

                    const nodeMatches =
                        code.includes(query) ||
                        name.includes(query);

                    const filteredChildren =
                        node.children?.length
                            ? filterTree(node.children)
                            : [];

                    if (
                        nodeMatches ||
                        filteredChildren.length > 0
                    ) {
                        result.push({
                            ...node,
                            children: filteredChildren,
                        });
                    }

                    return result;
                },
                [],
            );
        };

        return filterTree(treeData);
    }, [treeData, debouncedSearch]);

    // =========================================================
    // FLATTEN ONLY EXPANDED / VISIBLE NODES
    // =========================================================

    const visibleNodes = useMemo<VisibleTreeNode[]>(() => {
        const result: VisibleTreeNode[] = [];

        const walk = (
            nodes: TreeNode[],
            depth = 0,
        ) => {
            nodes.forEach(node => {
                result.push({
                    node,
                    depth,
                });

                const isExpanded =
                    expandedIds.includes(node.id);

                if (
                    isExpanded &&
                    node.children?.length
                ) {
                    walk(
                        node.children,
                        depth + 1,
                    );
                }
            });
        };

        walk(filteredData);

        return result;
    }, [
        filteredData,
        expandedIds,
    ]);

    // =========================================================
    // LOAD CHILDREN
    // =========================================================

    const loadNodeChildren = useCallback(
        async (node: TreeNode) => {
            if (!loadChildren) {
                return;
            }

            if (!nodeHasChildren(node)) {
                return;
            }

            // Don't make duplicate requests.
            if (loadingIds.includes(node.id)) {
                return;
            }

            // Children already loaded.
            if (node.isLoaded) {
                setExpandedIds(prev => {
                    if (prev.includes(node.id)) {
                        return prev;
                    }

                    return [
                        ...prev,
                        node.id,
                    ];
                });

                return;
            }

            try {
                setLoadingIds(prev => [
                    ...prev,
                    node.id,
                ]);

                setTreeData(prev =>
                    updateNodeById(
                        prev,
                        node.id,
                        currentNode => ({
                            ...currentNode,
                            isLoading: true,
                        }),
                    ),
                );

                const children =
                    await loadChildren(node);

                setTreeData(prev =>
                    updateNodeById(
                        prev,
                        node.id,
                        currentNode => ({
                            ...currentNode,
                            children: children ?? [],
                            hasChildren:
                                children?.length > 0 ||
                                currentNode.hasChildren === true,
                            isLoaded: true,
                            isLoading: false,
                        }),
                    ),
                );

                setExpandedIds(prev => {
                    if (prev.includes(node.id)) {
                        return prev;
                    }

                    return [
                        ...prev,
                        node.id,
                    ];
                });
            } catch (error) {
                console.error(
                    'AppTreeView: failed to load children',
                    error,
                );

                setTreeData(prev =>
                    updateNodeById(
                        prev,
                        node.id,
                        currentNode => ({
                            ...currentNode,
                            isLoading: false,
                        }),
                    ),
                );
            } finally {
                setLoadingIds(prev =>
                    prev.filter(
                        id => id !== node.id,
                    ),
                );
            }
        },
        [
            loadChildren,
            loadingIds,
            nodeHasChildren,
            updateNodeById,
        ],
    );

    // =========================================================
    // TOGGLE EXPAND
    // =========================================================

    const toggleNode = useCallback(
        async (node: TreeNode) => {
            const hasChildren =
                nodeHasChildren(node);

            if (!hasChildren) {
                handleSelect(node);
                return;
            }

            const isExpanded =
                expandedIds.includes(node.id);

            // Collapse.
            if (isExpanded) {
                setExpandedIds(prev =>
                    prev.filter(
                        id => id !== node.id,
                    ),
                );

                return;
            }

            // Expand already-loaded node.
            if (
                node.isLoaded ||
                !!node.children?.length
            ) {
                setExpandedIds(prev => [
                    ...prev,
                    node.id,
                ]);

                return;
            }

            // Lazy load.
            await loadNodeChildren(node);
        },
        [
            expandedIds,
            loadNodeChildren,
            nodeHasChildren,
        ],
    );

    // =========================================================
    // SELECT
    // =========================================================

    const handleSelect = useCallback(
        (node: TreeNode) => {
            setInternalSelectedId(node.id);
            setInternalSelectedNode(node);

            onSelect?.(node);
        },
        [onSelect],
    );

    // =========================================================
    // FIND SELECTED NODE IN TREE
    // =========================================================

    const findNodeById = useCallback(
        (
            nodes: TreeNode[],
            id: string | number,
        ): TreeNode | null => {
            for (const node of nodes) {
                if (node.id === id) {
                    return node;
                }

                if (node.children?.length) {
                    const found = findNodeById(
                        node.children,
                        id,
                    );

                    if (found) {
                        return found;
                    }
                }
            }

            return null;
        },
        [],
    );

    const selectedNode = useMemo(() => {
        if (internalSelectedNode) {
            return internalSelectedNode;
        }

        if (
            currentSelectedId !== null &&
            currentSelectedId !== undefined
        ) {
            return findNodeById(
                treeData,
                currentSelectedId,
            );
        }

        return null;
    }, [
        currentSelectedId,
        findNodeById,
        internalSelectedNode,
        treeData,
    ]);

    // =========================================================
    // CLEAR SELECTED NODE
    // =========================================================

    const clearSelection = () => {
        setInternalSelectedId(null);
        setInternalSelectedNode(null);
    };

    // =========================================================
    // TREE ROW
    // =========================================================

    const renderNode = useCallback(
        ({
            item,
        }: {
            item: VisibleTreeNode;
        }) => {
            const {
                node,
                depth,
            } = item;

            const hasChildren =
                nodeHasChildren(node);

            const isExpanded =
                expandedIds.includes(node.id);

            const isSelected =
                currentSelectedId === node.id;

            const isLoading =
                nodeIsLoading(node);

            return (
                <Pressable
                    onPress={() => {
                        if (hasChildren) {
                            toggleNode(node);
                        } else {
                            handleSelect(node);
                        }
                    }}
                    disabled={isLoading}
                    className={
                        `flex-row items-center rounded-xl py-2.5 mb-1 ${
                            isSelected
                                ? 'bg-blue-100'
                                : ''
                        }`
                    }
                    style={{
                        paddingLeft:
                            8 + depth * 22,
                        paddingRight: 8,
                    }}
                >
                    {/* CHEVRON */}

                    <View className="w-7 items-center">
                        {isLoading ? (
                            <ActivityIndicator
                                size="small"
                                color="#2563EB"
                            />
                        ) : hasChildren ? (
                            <AppIcon
                                name={
                                    isExpanded
                                        ? 'chevron-down'
                                        : 'chevron-right'
                                }
                                family="Feather"
                                size={17}
                                color="#334155"
                            />
                        ) : (
                            <View className="w-4" />
                        )}
                    </View>

                    {/* ICON */}

                    <View className="w-8 h-8 rounded-lg bg-slate-50 items-center justify-center">
                        <AppIcon
                            name="map-pin"
                            family="Feather"
                            size={16}
                            color="#2563EB"
                        />
                    </View>

                    {/* TEXT */}

                    <View className="flex-1 ml-3">
                        {!!node.code && (
                            <AppText
                                variant="label"
                                weight="semibold"
                                numberOfLines={1}
                            >
                                {node.code}
                            </AppText>
                        )}

                        <AppText
                            variant="caption"
                            className="text-slate-500"
                            numberOfLines={1}
                        >
                            {node.name}
                        </AppText>
                    </View>

                    {/* CHILD COUNT */}

                    {hasChildren &&
                        !!node.children?.length && (
                            <View className="min-w-7 h-7 px-2 mr-2 rounded-lg bg-violet-50 items-center justify-center">
                                <AppText className="text-primary! text-xs font-semibold">
                                    {node.children.length}
                                </AppText>
                            </View>
                        )}

                    {/* SELECTED */}

                    {isSelected && (
                        <View className="w-6 h-6 rounded-full bg-primary items-center justify-center">
                            <AppIcon
                                name="check"
                                family="Feather"
                                size={15}
                                color="#fff"
                            />
                        </View>
                    )}
                </Pressable>
            );
        },
        [
            currentSelectedId,
            expandedIds,
            handleSelect,
            nodeHasChildren,
            nodeIsLoading,
            toggleNode,
        ],
    );

    // =========================================================
    // KEY EXTRACTOR
    // =========================================================

    const keyExtractor = useCallback(
        (
            item: VisibleTreeNode,
            index: number,
        ) => {
            // ID is normally enough. Adding depth prevents
            // accidental collisions if the backend has duplicate
            // IDs in different levels.
            return String(item.node.id);
        },
        [],
    );

    // =========================================================
    // EMPTY STATE
    // =========================================================

    const renderEmptyComponent = () => {
        return (
            <View className="items-center justify-center py-10">
                <AppIcon
                    name="search"
                    family="Feather"
                    size={30}
                    color="#94A3B8"
                />

                <AppText className="text-slate-400 mt-2">
                    No results found
                </AppText>
            </View>
        );
    };

    // =========================================================
    // UI
    // =========================================================

    return (
        <View className="flex-1">
            {/* SEARCH */}

            {showSearch && (
                <View className="flex-row items-center border rounded-full border-slate-200 px-3 h-11 mb-4">
                    <AppIcon
                        name="search"
                        family="Feather"
                        size={19}
                        color="#64748B"
                    />

                    <TextInput
                        value={search}
                        onChangeText={setSearch}
                        placeholder={searchPlaceholder}
                        placeholderTextColor="#94A3B8"
                        className="flex-1 ml-2 text-slate-800"
                    />

                    <AppIcon
                        name="sliders"
                        family="Feather"
                        size={18}
                        color="#64748B"
                    />
                </View>
            )}

            {/* TREE LABEL */}

            <AppText
                variant="caption"
                className="text-slate-400 mb-2"
            >
                {title.toUpperCase()}
            </AppText>

            {/* VIRTUALIZED TREE */}

            <View
                style={{
                    flex: 1,
                    height:
                        Height !== undefined
                            ? Height
                            : undefined,
                }}
            >
                <FlatList
                    data={visibleNodes}
                    renderItem={renderNode}
                    keyExtractor={keyExtractor}
                    ListEmptyComponent={
                        renderEmptyComponent
                    }
                    showsVerticalScrollIndicator
                    nestedScrollEnabled
                    contentContainerStyle={{
                        paddingBottom: 20,
                        flexGrow:
                            visibleNodes.length === 0
                                ? 1
                                : undefined,
                    }}
                    initialNumToRender={12}
                    maxToRenderPerBatch={8}
                    windowSize={7}
                    updateCellsBatchingPeriod={50}
                    removeClippedSubviews
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
                         {title.toUpperCase()}
                    </AppText>

                    <View className="flex-row items-center mb-3">
                        <View className="w-9 h-9 rounded-lg bg-primary/10 items-center justify-center">
                            <AppIcon
                                name="map-pin"
                                family="Feather"
                                size={18}
                                color="#2563EB"
                            />
                        </View>

                        <View className="flex-1 ml-3">
                            {selectedNode ? (
                                <>
                                    <AppText
                                        weight="semibold"
                                        numberOfLines={1}
                                    >
                                        {selectedNode.code ||
                                            selectedNode.name}
                                    </AppText>

                                    {!!selectedNode.code && (
                                        <AppText
                                            variant="caption"
                                            className="text-slate-500"
                                            numberOfLines={1}
                                        >
                                            {
                                                selectedNode.name
                                            }
                                        </AppText>
                                    )}
                                </>
                            ) : (
                                <AppText className="text-slate-400">
                                    Not selected
                                </AppText>
                            )}
                        </View>

                        {selectedNode && (
                            <Pressable
                                onPress={
                                    clearSelection
                                }
                            >
                                <AppText className="text-[#2563EB]! font-semibold">
                                    Change
                                </AppText>
                            </Pressable>
                        )}
                    </View>

                    {/* CONTINUE */}

                    {showContinue && (
                        <Button
                            fullWidth
                            disabled={!selectedNode}
                            onPress={() => {
                                if (selectedNode) {
                                    onContinue?.(
                                        selectedNode,
                                    );
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

export default AppTreeView;
