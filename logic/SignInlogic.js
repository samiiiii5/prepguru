import { Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { GoogleAuthProvider, signInWithCredential} from 'firebase/auth';
// Configure Google Sign-In
export const configureGoogleSignIn = () => {
  GoogleSignin.configure({
    webClientId: '1007501551030-r6q7p3npe8vbgfp546kqlhkndcu17e1e.apps.googleusercontent.com', // Use your webClientId from the Google Console
    offlineAccess: true,
    forceCodeForRefreshToken: true,
  });
  console.log('Google Sign-In configured.');
};

// Handle Google Sign-In
export const handleGoogleSignIn = async () => {
  try {
    console.log('Initiating Google Sign-In...');
    await GoogleSignin.hasPlayServices();
    const googleUser = await GoogleSignin.signIn();

    console.log('Google Sign-In successful:', googleUser);

    // Retrieve ID Token
    const idToken = googleUser?.idToken || googleUser?.data?.idToken;
    if (!idToken) {
      throw new Error('No ID token returned from Google Sign-In.');
    }

    // Authenticate with Firebase
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
    const userCredential = await auth().signInWithCredential(googleCredential);

    console.log('Firebase Authentication Successful:', userCredential.user);
    return userCredential.user; // Return the authenticated user
  } catch (error) {
    console.error('Error during Google Login (Full Object):', JSON.stringify(error));

    if (error?.code === statusCodes.SIGN_IN_CANCELLED) {
      console.log('Sign-in cancelled');
    } else if (error?.code === statusCodes.IN_PROGRESS) {
      console.log('Sign-in in progress');
    } else if (error?.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      console.log('Play services not available');
    } else {
      Alert.alert('Google Login Error', error?.message || 'An unexpected error occurred.');
    }

    throw error; // Rethrow to allow upstream handling if needed
  }
};