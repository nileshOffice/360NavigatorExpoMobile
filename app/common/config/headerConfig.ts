export type HeaderConfig = {
    title: string;
    showBack: boolean;
    showMenu: boolean;
    showLogo: boolean;
};

export const HEADER_CONFIG: Record<string, HeaderConfig> = {
    main: {
        title: '',
        showBack: false,
        showMenu: true,
        showLogo: true,
    },

    AssetRegistry: {
        title: 'Asset Registry',
        showBack: true,
        showMenu: false,
        showLogo: false,
    },

};