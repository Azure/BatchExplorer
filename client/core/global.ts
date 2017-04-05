import { AuthenticationWindow } from "../authentication";
import { MainWindow } from "../main-window";
import { SplashScreen } from "../splash-screen";

const splashScreen = new SplashScreen();
const authenticationWindow = new AuthenticationWindow();
const mainWindow = new MainWindow();

/**
 * Set of unique windows used across the app
 */
export const windows = { splashScreen, authentication: authenticationWindow, main: mainWindow };
