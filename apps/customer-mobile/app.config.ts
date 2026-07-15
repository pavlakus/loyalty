export default {
  expo: {
    name: "Loyalty Customer",
    slug: "loyalty-customer-mobile",
    version: "0.0.0",
    orientation: "portrait",
    userInterfaceStyle: "light",
    platforms: ["ios", "android", "web"],
    assetBundlePatterns: ["**/*"],
    ios: {
      bundleIdentifier: "com.loyaltyplatform.customer"
    },
    android: {
      package: "com.loyaltyplatform.customer"
    },
    web: {
      bundler: "metro"
    }
  }
};
