import { AuthenticationWindow } from "../authentication";
import { MainWindow } from "../main-window";
import { RecoverWindow } from "../recover-window";
import { SplashScreen } from "../splash-screen";

const splashScreen = new SplashScreen();
const authenticationWindow = new AuthenticationWindow();
const recoverWindow = new RecoverWindow();
const mainWindow = new MainWindow();

/**
 * Set of unique windows used across the app
 */
export const windows = { splashScreen, authentication: authenticationWindow, main: mainWindow, recover: recoverWindow };
