// utils/locationTreeUtils.ts

export interface TreeNode {
  id: string | number;
  code: string;
  name: string;
  children: TreeNode[];
  hasChildren: boolean;
  originalData: any;
}

export const buildLocationTree = (locationResponse: any): TreeNode[] => {
  const response = Array.isArray(locationResponse)
    ? locationResponse
    : Array.isArray(locationResponse?.data)
      ? locationResponse.data
      : Array.isArray(locationResponse?.result)
        ? locationResponse.result
        : [];

  const locationItems = response.filter((item: any) => item != null);

  const nodeById = new Map<string, TreeNode>();

  const nodes = locationItems
    .map((item: any) => {
      const formattedTreeData = formatTreeData(item);

      const separatorIndex = formattedTreeData.indexOf("~");

      const formattedCode =
        separatorIndex >= 0
          ? formattedTreeData.substring(0, separatorIndex)
          : (item.code ?? item.num ?? item.number);

      const formattedName =
        separatorIndex >= 0
          ? formattedTreeData.substring(separatorIndex + 1)
          : (item.name ?? item.locationName ?? item.description ?? "");

      const node: TreeNode = {
        id: item.id ?? item.locationId ?? item.ID,

        code: formattedCode,
        name: formattedName,

        children: [],

        hasChildren:
          item.unionSet === true ||
          item.unionSet === 1 ||
          item.unionSet === "1",

        originalData: item,
      };

      if (node.id === undefined || node.name === "") {
        return null;
      }

      nodeById.set(String(node.id), node);

      return node;
    })
    .filter((node: any): node is TreeNode => node !== null);

  const roots: TreeNode[] = [];

  locationItems.forEach((item: any) => {
    const node = nodeById.get(String(item.id ?? item.locationId ?? item.ID));

    if (!node) return;

    const parentId =
      item.parentId ?? item.parentID ?? item.parent_id ?? item.parent?.id;

    const parent =
      parentId !== undefined && parentId !== null && parentId !== ""
        ? nodeById.get(String(parentId))
        : undefined;

    if (parent && parent !== node) {
      parent.children.push(node);
      parent.hasChildren = true;
    } else {
      roots.push(node);
    }
  });

  nodes.forEach((node: { hasChildren: boolean; children: string | any[] }) => {
    node.hasChildren = node.hasChildren || node.children.length > 0;
  });

  return roots;
};

const formatTreeData = (dataItem: any): string => {
  const id = String(dataItem?.id ?? "");
  const info = String(dataItem?.info ?? "");

  if (!info) {
    return "";
  }

  const remaining = info.startsWith(`${id}-`)
    ? info.substring(id.length + 1)
    : info;

  return `${id}~${remaining}`;
};
