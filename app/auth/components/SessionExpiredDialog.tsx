import { Alert } from 'react-native'

const SessionExpiredDialog = (
    onConfirm: () => void
) => {
    Alert.alert(
        'Session Expired',
        'Your session has expired. Please login again.',
        [
            {
                text: 'OK',
                onPress: onConfirm,
            },
        ],
        {
            cancelable: false,
        }
    )
}

export default SessionExpiredDialog