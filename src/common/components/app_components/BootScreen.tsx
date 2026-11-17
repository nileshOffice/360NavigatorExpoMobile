import CompanyLogo from '@/assets/images/360Nav_logo.svg';
import { View } from 'react-native';

/**
 * Shown while the app starts (persisted state loading + encryption keys).
 *
 * Matches the native splash screen (white background, logo centred at the
 * same size: splash `imageWidth` 280 x 62.5% logo area = 175), so the hand-off
 * from the native splash is seamless. Also visible on a JS reload in
 * development, where the native splash is not shown again.
 */
const LOGO_WIDTH = 175;
// 360Nav_logo.svg viewBox is 290.7 x 59.7.
const LOGO_HEIGHT = Math.round((LOGO_WIDTH * 59.7) / 290.7);

export default function BootScreen() {
  return (
    <View
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff' }}
      accessibilityRole="image"
      accessibilityLabel="360 Navigator"
    >
      <CompanyLogo width={LOGO_WIDTH} height={LOGO_HEIGHT} />
    </View>
  );
}
