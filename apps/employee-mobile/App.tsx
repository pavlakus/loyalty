import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Employee Mobile</Text>
      <Text style={styles.subtitle}>Loyalty Platform application skeleton</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: "#f7f7f5",
    flex: 1,
    justifyContent: "center",
    padding: 24
  },
  subtitle: {
    color: "#4b5563",
    fontSize: 16,
    marginTop: 8,
    textAlign: "center"
  },
  title: {
    color: "#111827",
    fontSize: 28,
    fontWeight: "600",
    textAlign: "center"
  }
});
