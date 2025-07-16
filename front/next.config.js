const isMain = process.env.IS_MAIN_PRODUCT === "true";

module.exports = {
    output: 'standalone',
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve.fallback = {
                fs: false,
            };
        }
        return config;
    },
    async redirects() {
        return [
            {
                source: '/index',
                destination: '/',
                permanent: true,
            },
        ];
    },
    env: {
        NEXT_PUBLIC_API_URL_GET_USER:
            isMain
                ? process.env.NEXT_PUBLIC_API_URL_GET_USER_PRODUCT
                : process.env.NEXT_PUBLIC_API_URL_GET_USER_TEST,
        NEXT_PUBLIC_API_URL_LOGIN:
            isMain
                ? process.env.NEXT_PUBLIC_API_URL_LOGIN_PRODUCT
                : process.env.NEXT_PUBLIC_API_URL_LOGIN_TEST,
        NEXT_PUBLIC_API_URL_UPDATE_USER:
            isMain
                ? process.env.NEXT_PUBLIC_API_URL_UPDATE_USER_PRODUCT
                : process.env.NEXT_PUBLIC_API_URL_UPDATE_USER_TEST,
        NEXT_PUBLIC_API_URL_UPLOAD_PROFILE_IMG:
            isMain
                ? process.env.NEXT_PUBLIC_API_URL_UPLOAD_PROFILE_IMG_PRODUCT
                : process.env.NEXT_PUBLIC_API_URL_UPLOAD_PROFILE_IMG_TEST,
        NEXT_PUBLIC_API_URL_RECEIVE_INQUIRIES:
            isMain
                ? process.env.NEXT_PUBLIC_API_URL_RECEIVE_INQUIRIES_PRODUCT
                : process.env.NEXT_PUBLIC_API_URL_RECEIVE_INQUIRIES_TEST,
        NEXT_PUBLIC_API_URL_GET_EVENT_DETAIL:
            isMain
                ? process.env.NEXT_PUBLIC_API_URL_GET_EVENT_DETAIL_PRODUCT
                : process.env.NEXT_PUBLIC_API_URL_GET_EVENT_DETAIL_TEST,
        NEXT_PUBLIC_API_URL_PARTICIPATE:
            isMain
                ? process.env.NEXT_PUBLIC_API_URL_PARTICIPATE_PRODUCT
                : process.env.NEXT_PUBLIC_API_URL_PARTICIPATE_TEST,
        NEXT_PUBLIC_API_URL_GET_CATEGORIES:
            isMain
                ? process.env.NEXT_PUBLIC_API_URL_GET_CATEGORIES_PRODUCT
                : process.env.NEXT_PUBLIC_API_URL_GET_CATEGORIES_TEST,
        NEXT_PUBLIC_API_URL_GET_KEYWORDS:
            isMain
                ? process.env.NEXT_PUBLIC_API_URL_GET_KEYWORDS_PRODUCT
                : process.env.NEXT_PUBLIC_API_URL_GET_KEYWORDS_TEST,
        NEXT_PUBLIC_API_URL_GET_SELF_CREATED_EVENTS:
            isMain
                ? process.env.NEXT_PUBLIC_API_URL_GET_SELF_CREATED_EVENTS_PRODUCT
                : process.env.NEXT_PUBLIC_API_URL_GET_SELF_CREATED_EVENTS_TEST,
        NEXT_PUBLIC_API_URL_GET_DRAFT:
            isMain
                ? process.env.NEXT_PUBLIC_API_URL_GET_DRAFT_PRODUCT
                : process.env.NEXT_PUBLIC_API_URL_GET_DRAFT_TEST,
        NEXT_PUBLIC_API_URL_CREATE_EVENT:
            isMain
                ? process.env.NEXT_PUBLIC_API_URL_CREATE_EVENT_PRODUCT
                : process.env.NEXT_PUBLIC_API_URL_CREATE_EVENT_TEST,
        NEXT_PUBLIC_API_URL_UPDATE_EVENT:
            isMain
                ? process.env.NEXT_PUBLIC_API_URL_UPDATE_EVENT_PRODUCT
                : process.env.NEXT_PUBLIC_API_URL_UPDATE_EVENT_TEST,
        NEXT_PUBLIC_API_URL_DELETE_EVENT:
            isMain
                ? process.env.NEXT_PUBLIC_API_URL_DELETE_EVENT_PRODUCT
                : process.env.NEXT_PUBLIC_API_URL_DELETE_EVENT_TEST,
        NEXT_PUBLIC_API_URL_SEARCH_EVENTS:
            isMain
                ? process.env.NEXT_PUBLIC_API_URL_SEARCH_EVENTS_PRODUCT
                : process.env.NEXT_PUBLIC_API_URL_SEARCH_EVENTS_TEST,
        NEXT_PUBLIC_API_URL_GET_PARTICIPANTS:
            isMain
                ? process.env.NEXT_PUBLIC_API_URL_GET_PARTICIPANTS_PRODUCT
                : process.env.NEXT_PUBLIC_API_URL_GET_PARTICIPANTS_TEST,
        NEXT_PUBLIC_API_URL_ADD_FAVORITE:
            isMain
                ? process.env.NEXT_PUBLIC_API_URL_ADD_FAVORITE_PRODUCT
                : process.env.NEXT_PUBLIC_API_URL_ADD_FAVORITE_TEST,
        NEXT_PUBLIC_API_URL_GET_FAVORITES:
            isMain
                ? process.env.NEXT_PUBLIC_API_URL_GET_FAVORITES_PRODUCT
                : process.env.NEXT_PUBLIC_API_URL_GET_FAVORITES_TEST,
        NEXT_PUBLIC_API_URL_REMOVE_FAVORITE:
            isMain
                ? process.env.NEXT_PUBLIC_API_URL_REMOVE_FAVORITE_PRODUCT
                : process.env.NEXT_PUBLIC_API_URL_REMOVE_FAVORITE_TEST,
        NEXT_PUBLIC_API_URL_CREATE_INQUIRY:
            isMain
                ? process.env.NEXT_PUBLIC_API_URL_CREATE_INQUIRY_PRODUCT
                : process.env.NEXT_PUBLIC_API_URL_CREATE_INQUIRY_TEST,
        NEXT_PUBLIC_API_URL_RECEIVE_INQUIRIES:
            isMain
                ? process.env.NEXT_PUBLIC_API_URL_RECEIVE_INQUIRIES_PRODUCT
                : process.env.NEXT_PUBLIC_API_URL_RECEIVE_INQUIRIES_TEST,
    },
};