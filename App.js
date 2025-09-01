import { StyleSheet, Text, View, StatusBar, Image } from 'react-native';
import { useFonts } from "expo-font";

export default function App() {

  {/* Fonts */}
  const [fontsLoaded] = useFonts({
    Garamond: require("./assets/fonts/EBGaramond-Regular.ttf"),
    GaramondBold: require("./assets/fonts/EBGaramond-Bold.ttf"),
    Emblema: require("./assets/fonts/EmblemaOne-Regular.ttf"),
  });

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.saudacao}>Olá Nathalia!</Text>
          <Text style={styles.subtitulo}>Acompanhe sua agenda de tarefas aqui!</Text>
          <View style={styles.divisor} />
        </View>
        <Image style={styles.imagem}
          source={require("./assets/image.png")}
        />
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  saudacao: {
    fontSize: 28,
    fontFamily: "GaramondBold",
    marginBottom: 6
  },
  subtitulo: {
    fontSize: 14,
    fontFamily: "Garamond",
    color: '#555'
  },
  divisor: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 12,
    width: '80%'
  },
  imagem: {
    width: 150,
    height: 200,
    resizeMode: 'contain'
  }
});
