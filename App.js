import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import WelcomeScreen from "./WelcomeScreen";
import HomeScreen from "./HomeScreen";
import GamesScreen from "./GamesScreen";
import ProfileScreen from "./ProfileScreen";
import VideoScreen from "./VideoScreen";
import Tabs from "./Tabs"; 
import { configureGoogleSignIn } from "./logic/SignInlogic"; // Import the config function
import Py from "./Py"; 
import Chem from "./Chem"; 
import Bio from "./Bio"; 
import PYP from "./PYP"; 
import Class11 from "./Class11"; 
import Class12 from "./Class12";
import MM from "./MM";
import CC from "./CC";
import SubjectsScreen from "./SubjectsScreen";
import ChapterScreen from './ChapterScreen';
import FlashcardScreen from './FlashcardScreen';
import Formula from "./Formula";
import CategoryScreen from "./CategoryScreen";
import Easy from "./Easy";
import Testlist from "./Testlist";
import EasyTestScreen from "./EasyTestScreen";
import ResultScreen from "./ResultScreen";
import SolutionScreen from "./SolutionScreen";
import Mode from "./Mode";
import Speed from "./Speed";
import Hard from "./Hard";
import PdfViewer from './PdfViewer';
import PDFListScreen from './PDFListScreen';
import CCList from './CCList';
import FList from './FList';
import YearwiseScreen from './YearwiseScreen';
import ChapterwiseScreen from './ChapterwiseScreen';
import SubjectPapersScreen from './SubjectPapersScreen';
import ModeType from "./ModeType";
import ModeTestlist from "./ModeTestlist";
import ModeTestScreen from "./ModeTestScreen";
import HardType from "./HardType";
import HardTestScreen from "./HardTestScreen";
import SpeedTestScreen from "./SpeedTestScreen";
import ChapterAndConfigScreen from "./ChapterAndConfigScreen";
import Detail from "./Detail";
import Save from "./Save";
import Delete from "./Delete";
import Progress from "./Progress";
import Recommendation from "./Recommendation";
const Stack = createStackNavigator();

const App = () => {
  // Configure Google Sign-In once on app mount
  useEffect(() => {
    configureGoogleSignIn();
  }, []);

  return (
    <>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Home" component={Tabs} />
          <Stack.Screen name="Games" component={GamesScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Video" component={VideoScreen} />
          <Stack.Screen name="Py" component={Py} />
          <Stack.Screen name="Chem" component={Chem} />
          <Stack.Screen name="Bio" component={Bio} />
          <Stack.Screen name="PYP" component={PYP} />
          <Stack.Screen name="YearwiseScreen" component={YearwiseScreen} />
          <Stack.Screen name="ChapterwiseScreen" component={ChapterwiseScreen} />
          <Stack.Screen name="SubjectPapersScreen" component={SubjectPapersScreen} />
          <Stack.Screen name="Class11" component={Class11} />
          <Stack.Screen name="PdfViewer" component={PdfViewer} options={{ title: 'PDF Viewer' }} />
          <Stack.Screen name="Class12" component={Class12} />
          <Stack.Screen name="MM" component={MM} />
          <Stack.Screen name="PDFList" component={PDFListScreen} />
          <Stack.Screen name="CC" component={CC} />
          <Stack.Screen name="CCList" component={CCList} />
          <Stack.Screen name="SubjectsScreen" component={SubjectsScreen} />
          <Stack.Screen name="Chapters" component={ChapterScreen} />
          <Stack.Screen name="Flashcards" component={FlashcardScreen} />
          <Stack.Screen name="Formula" component={Formula} />
          <Stack.Screen name="FList" component={FList} />
          <Stack.Screen name="CategoryScreen" component={CategoryScreen} />
          <Stack.Screen name="Easy" component={Easy} />
          <Stack.Screen name="Testlist" component={Testlist} />
          <Stack.Screen name="EasyTestScreen" component={EasyTestScreen} />
          <Stack.Screen name="ResultScreen" component={ResultScreen} />
          <Stack.Screen name="SolutionScreen" component={SolutionScreen} />
          <Stack.Screen name="Mode" component={Mode} />
          <Stack.Screen name="Hard" component={Hard} />
          <Stack.Screen name="Speed" component={Speed} />
          <Stack.Screen name="ModeType" component={ModeType} />
          <Stack.Screen name="ModeTestlist" component={ModeTestlist} />
          <Stack.Screen name="ModeTestScreen" component={ModeTestScreen} />
          <Stack.Screen name="HardType" component={HardType} />
          <Stack.Screen name="HardTestScreen" component={HardTestScreen} />
          <Stack.Screen name="SpeedTestScreen" component={SpeedTestScreen} />
          <Stack.Screen name="ChapterAndConfigScreen" component={ChapterAndConfigScreen} />
          <Stack.Screen name="Detail" component={Detail} />
        <Stack.Screen name="Save" component={Save} />
        <Stack.Screen name="Delete" component={Delete} />
        <Stack.Screen name="Progress" component={Progress} />
        <Stack.Screen name="Recommendation" component={Recommendation} />

        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
};

export default App;
