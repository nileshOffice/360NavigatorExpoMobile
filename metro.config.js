const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

config.transformer.babelTransformerPath =
  require.resolve("react-native-svg-transformer");

config.resolver.assetExts = config.resolver.assetExts.filter(
  (ext) => ext !== "svg",
);

config.resolver.sourceExts = [...config.resolver.sourceExts, "svg"];

const nativewindConfig = withNativewind(config);

const nativewindResolveRequest = nativewindConfig.resolver.resolveRequest;

nativewindConfig.resolver.resolveRequest = (context, moduleName, platform) => {
  const origin = context.originModulePath.replace(/\\/g, "/");

  // Let expo-asset resolve the original React Native entry.
  if (
    moduleName === "react-native" &&
    origin.includes("/node_modules/expo-asset/")
  ) {
    return context.resolveRequest(context, moduleName, platform);
  }

  // Keep NativeWind's normal resolution for everything else.
  return nativewindResolveRequest
    ? nativewindResolveRequest(context, moduleName, platform)
    : context.resolveRequest(context, moduleName, platform);
};

module.exports = nativewindConfig;
