import ReactNativeBlobUtil from 'react-native-blob-util';

ReactNativeBlobUtil.config({
  trusty: true, // Enable custom trust manager
  fileCache: true, // Use file cache if needed
  appendExt: 'pdf', // Set the file extension to PDF if needed
  trustAllCerts: false, // Disable trusting all certificates (configure your own trust manager)
});
