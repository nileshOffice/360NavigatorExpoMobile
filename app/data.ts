export const walkdownList = [
  {
    id: 10,
    title: 'Walkdown #10',
    description: 'Safety & Compliance Inspection',
    assets: 13,
    date: '18 May 2025',
    icon: 'clipboard-check-outline',
    iconFamily: 'MaterialCommunityIcons',
    iconBackground: '#EAF4FF',
    iconColor: '#1677FF',
    badgeBackground: '#EAF4FF',
    badgeColor: '#1677FF',
  },
  {
    id: 11,
    title: 'Walkdown #11',
    description: 'Walkdown Findings Consolidation',
    assets: 6,
    date: '16 May 2025',
    icon: 'clipboard-check-outline',
    iconFamily: 'MaterialCommunityIcons',
    iconBackground: '#EAF9F0',
    iconColor: '#16A34A',
    badgeBackground: '#EAF9F0',
    badgeColor: '#16A34A',
  },
  {
    id: 12,
    title: 'Walkdown #12',
    description: 'Test',
    assets: 3,
    date: '14 May 2025',
    icon: 'clipboard-check-outline',
    iconFamily: 'MaterialCommunityIcons',
    iconBackground: '#F3E8FF',
    iconColor: '#7C3AED',
    badgeBackground: '#F3E8FF',
    badgeColor: '#7C3AED',
  },
  {
    id: 13,
    title: 'Walkdown #16',
    description: 'Site Safety Verification',
    assets: 2,
    date: '12 May 2025',
    icon: 'clipboard-check-outline',
    iconFamily: 'MaterialCommunityIcons',
    iconBackground: '#FFF7E6',
    iconColor: '#F59E0B',
    badgeBackground: '#FFF7E6',
    badgeColor: '#F59E0B',
  },
   {
    id: 14,
    title: 'Walkdown #12',
    description: 'Test',
    assets: 3,
    date: '14 May 2025',
    icon: 'clipboard-check-outline',
    iconFamily: 'MaterialCommunityIcons',
    iconBackground: '#F3E8FF',
    iconColor: '#7C3AED',
    badgeBackground: '#F3E8FF',
    badgeColor: '#7C3AED',
  },
  {
    id: 15,
    title: 'Walkdown #16',
    description: 'Site Safety Verification',
    assets: 2,
    date: '12 May 2025',
    icon: 'clipboard-check-outline',
    iconFamily: 'MaterialCommunityIcons',
    iconBackground: '#FFF7E6',
    iconColor: '#F59E0B',
    badgeBackground: '#FFF7E6',
    badgeColor: '#F59E0B',
  },
   {
    id: 16,
    title: 'Walkdown #12',
    description: 'Test',
    assets: 3,
    date: '14 May 2025',
    icon: 'clipboard-check-outline',
    iconFamily: 'MaterialCommunityIcons',
    iconBackground: '#F3E8FF',
    iconColor: '#7C3AED',
    badgeBackground: '#F3E8FF',
    badgeColor: '#7C3AED',
  },
  {
    id: 17,
    title: 'Walkdown #16',
    description: 'Site Safety Verification',
    assets: 2,
    date: '12 May 2025',
    icon: 'clipboard-check-outline',
    iconFamily: 'MaterialCommunityIcons',
    iconBackground: '#FFF7E6',
    iconColor: '#F59E0B',
    badgeBackground: '#FFF7E6',
    badgeColor: '#F59E0B',
  },
];

export interface SafetyGuideline {
  id: number;
  icon: string;
  iconFamily:
    | 'Ionicons'
    | 'MaterialCommunityIcons'
    | 'Feather'
    | 'AntDesign'
    | 'FontAwesome6';
  text: string;
}


export const safetyGuidelines: SafetyGuideline[] = [
  {
    id: 1,
    icon: 'clipboard-text-outline',
    iconFamily: 'MaterialCommunityIcons',
    text: "Always follow your site's safety protocols when using a mobile device. Please obey all safety signs, stickers, and tags.",
  },
  {
    id: 2,
    icon: 'walk',
    iconFamily: 'Ionicons',
    text: 'Do not use the application while walking or in motion.',
  },
  {
    id: 3,
    icon: 'pencil-outline',
    iconFamily: 'MaterialCommunityIcons',
    text: 'Always stop in a safe place to record information.',
  },
  {
    id: 4,
    icon: 'eye-outline',
    iconFamily: 'Ionicons',
    text: 'Always be alert of your workspace and surrounding areas while using the application.',
  },
  {
    id: 5,
    icon: 'hard-hat',
    iconFamily: 'MaterialCommunityIcons',
    text: 'Always wear the protective equipment that is intended for your task while using the App.',
  },
];


export const assignmentSectionHeader = [
  {
    key: 'assigned',
    title: 'ASSIGNED',
    count: 3,
    color: '#94A3B8',
   
  },
  {
    key: 'added',
    title: 'ADDED',
    count: 2,
    color: '#7C3AED',
  },
  {
    key: 'completed',
    title: 'COMPLETED',
    count: 3,
    color: '#16A34A',
 
  },
];

