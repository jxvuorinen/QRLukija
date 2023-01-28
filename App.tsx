import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { Appbar, IconButton, MD3Colors, FAB, Text } from 'react-native-paper';
import { BarCodeScanner, PermissionResponse, BarCodeScannedCallback } from 'expo-barcode-scanner';
import { useState, useRef } from 'react';
import { WebView } from 'react-native-webview';
import Constants from 'expo-constants';

interface Kuvaustiedot {
  kuvaustila: boolean,
  virhe: string,
  info: string,
  uri: string
}

const App: React.FC = (): React.ReactElement => {
  const webViewRef: any = useRef<WebView>();

  const [kuvaustiedot, setKuvaustiedot] = useState<Kuvaustiedot>({
    kuvaustila: false,
    virhe: "",
    info: "",
    uri: ""
  });
  const [scanned, setScanned] = useState(false);

  const kaynnistaKamera = async (): Promise<void> => {
    setScanned(false);
    let tarkistaLupa: PermissionResponse = await BarCodeScanner.requestPermissionsAsync();

    setKuvaustiedot({
      ...kuvaustiedot,
      kuvaustila: tarkistaLupa.granted,
      virhe: (!tarkistaLupa.granted) ? "Ei lupaa kameran käyttöön" : "",
      uri: ""
    });
  };

  const handleBarCodeScanned: BarCodeScannedCallback = ({ data }) => {

    setKuvaustiedot({
      ...kuvaustiedot,
      kuvaustila: false,
      uri: data,
      info: `${data}`
    })
    setScanned(true);
  };

  const handleWebViewNavigationStateChange: any = (newNavState: any) => {
    // newNavState looks something like this:
    // {
    //   url?: string;
    //   title?: string;
    //   loading?: boolean;
    //   canGoBack?: boolean;
    //   canGoForward?: boolean;
    // }
    const { url } = newNavState;

    if (!url) return;

    // check type
    if (!['http:', 'https:'].includes(url.split('/')[0])) {
      setScanned(false);
      setKuvaustiedot({
        ...kuvaustiedot,
        uri: "",
        virhe: 'Ei sovelias www-osoite',
        info: ""
      })
    }
  };

  return (
    (kuvaustiedot.kuvaustila)
      ?
      <>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />

        <FAB
          style={styles.nappiSulje}
          icon="close"
          label="sulje"
          onPress={() => setKuvaustiedot({ ...kuvaustiedot, kuvaustila: false, uri: "", info: "" })}
        />
      </>
      :
      <>
        <Appbar.Header>
          <Appbar.Content title="Skannaa QR-koodi" />
          <IconButton
            icon="qrcode-scan"
            iconColor={MD3Colors.error50}
            size={30}
            onPress={kaynnistaKamera}
          />
        </Appbar.Header>


        {
          (Boolean(kuvaustiedot.virhe))
            ?
            <View style={styles.container}><Text variant='headlineSmall'>{kuvaustiedot.virhe}</Text></View>
            : null
        }
        {
          (Boolean(kuvaustiedot.info))
            ? <View><Text variant="headlineSmall" style={{ textAlign: "center"}} >{kuvaustiedot.info}</Text></View>
            : null
        }

        {(kuvaustiedot.kuvaustila === false && scanned)
          ?
          <WebView
            style={styles.webNakyma}
            ref={webViewRef}
            source={{ uri: kuvaustiedot.uri }}
            onNavigationStateChange={handleWebViewNavigationStateChange}
          />
          : null
        }

        <StatusBar style="auto" />
      </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  webNakyma: {
    flex: 1,
    marginTop: Constants.statusBarHeight,
  },
  kuvaustila: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nappiSulje: {
    position: 'absolute',
    margin: 20,
    bottom: 0,
    right: 0
  }
});

export default App;