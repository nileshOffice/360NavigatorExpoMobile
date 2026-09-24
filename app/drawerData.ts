export type DrawerOption = {
  id: string | number;
  name: string;
  code?: string;
  description?: string;
};

// drawerDummyData.ts

export const drawerDummyData = {
  LOCATION: [
    { id: 1, name: "TECH-Dressline Carrier #45", code: "LOCTECH10419" },
    { id: 2, name: "Production Floor", code: "LOC001" },
    { id: 3, name: "Maintenance Area", code: "LOC002" },
  ],

  MANUFACTURER: [
    { id: 1, name: "Kitamura", code: "KITAMURA" },
    { id: 2, name: "Caterpillar", code: "CATERPILLAR" },
    { id: 3, name: "Siemens", code: "SIEMENS" },
  ],

  VENDOR: [
    { id: 1, name: "Brightway Logistics", code: "BRIGHTWAY" },
    { id: 2, name: "ABC Industrial", code: "VENDOR002" },
    { id: 3, name: "Industrial Solutions", code: "VENDOR003" },
  ],

  ASSETTYPE: [
    { id: 1, name: "FACILITY", code: "FACILITY" },
    { id: 2, name: "EQUIPMENT", code: "EQUIPMENT" },
    { id: 3, name: "MACHINE", code: "MACHINE" },
  ],

  ASSETCLASS: [
    { id: 1, name: "BOP (SAFETY)", code: "CLS023" },
    { id: 2, name: "ELECTRICAL", code: "CLS024" },
    { id: 3, name: "MECHANICAL", code: "CLS025" },
  ],

  PRIORITY: [
    { id: 1, name: "High", code: "1" },
    { id: 2, name: "Medium", code: "2" },
    { id: 3, name: "Low", code: "3" },
  ],

  "WORK AREA": [
    { id: 1, name: "UTILITY", code: "WA001" },
    { id: 2, name: "PRODUCTION", code: "WA002" },
    { id: 3, name: "MAINTENANCE", code: "WA003" },
  ],

  "WORK GROUP": [
    { id: 1, name: "Production Group", code: "WG001" },
    { id: 2, name: "Maintenance Group", code: "WG002" },
    { id: 3, name: "Utility Group", code: "WG003" },
  ],

  "FAILURE CLASS": [
    { id: 1, name: "Mechanical Failure", code: "FC001" },
    { id: 2, name: "Electrical Failure", code: "FC002" },
    { id: 3, name: "Operational Failure", code: "FC003" },
  ],
};
