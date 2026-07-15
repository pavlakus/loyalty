export default {
  expo: {
    name: "Loyalty Employee",
    slug: "loyalty-employee-mobile",
    version: "0.0.0",
    orientation: "portrait",
    userInterfaceStyle: "light",
    platforms: ["ios", "android", "web"],
    assetBundlePatterns: ["**/*"],
    ios: {
      bundleIdentifier: "com.loyaltyplatform.employee"
    },
    android: {
      package: "com.loyaltyplatform.employee"
    },
    web: {
      bundler: "metro"
    }
  }
};
