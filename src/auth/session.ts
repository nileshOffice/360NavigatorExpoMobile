import { applicationApi } from "@/src/auth/applicationApi";
import { logout } from "@/src/auth/authSlice";
import { clearApiAlert } from "@/src/common/hooks/apiErrorSlice";
import { clearModuleList } from "@/src/common/redux/homeSlice/moduleSlice";
import { api as baseApi } from "@/src/lib/api/baseApi";
import { cryptoService } from "@/src/lib/services/crypto/cryptoService";
import type { AppDispatch } from "@/src/lib/store/store";
import { resetAssetForm } from "@/src/main/modules/walkdown/redux/walkDownSlice/assetFormSlice";
import { clearSelectedAssetData } from "@/src/main/modules/walkdown/redux/walkDownSlice/selectedAssetData";
import { resetAssetWalkDownState } from "@/src/main/modules/walkdown/redux/walkDownSlice/selectedWalkDown";

/**
 * Makes sure the AES key/IV from `loadApplicationData` are available.
 *
 * The app loads them once at start-up, but that call can fail (offline,
 * server cold start). Without them every request goes out unencrypted and
 * the login password cannot be encrypted, so we retry on demand.
 */
export async function ensureCryptoConfigured(
  dispatch: AppDispatch,
): Promise<boolean> {
  if (cryptoService.isConfigured()) {
    return true;
  }

  try {
    const data = await dispatch(
      applicationApi.endpoints.loadApplicationData.initiate(undefined, {
        forceRefetch: true,
        subscribe: false,
      }),
    ).unwrap();

    if (!cryptoService.isConfigured() && data) {
      cryptoService.configureFromApplicationData(data);
    }
  } catch (error) {
    if (__DEV__) {
      console.warn("[session] Unable to load application data", error);
    }
  }

  return cryptoService.isConfigured();
}

/**
 * Clears everything that belongs to the signed-in user so the next user on
 * the same device never sees cached sites, modules, drafts or API data.
 */
export function resetSessionState(dispatch: AppDispatch) {
  dispatch(logout());
  dispatch(clearModuleList());
  dispatch(resetAssetForm());
  dispatch(resetAssetWalkDownState());
  dispatch(clearSelectedAssetData());
  dispatch(clearApiAlert());
  dispatch(baseApi.util.resetApiState());
}
