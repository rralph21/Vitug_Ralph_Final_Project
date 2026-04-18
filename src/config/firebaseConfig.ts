import "dotenv/config";

/**
 * Firebase Admin SDK initialization module
 *
 * This module handles the initialization of Firebase Admin SDK for server-side
 * operations. It sets up authentication and Firestore database connections.
 */
import {
    App,
    AppOptions,
    ServiceAccount,
    cert,
    getApps,
    initializeApp,
} from "firebase-admin/app";
import { Auth, getAuth } from "firebase-admin/auth";
import { Firestore, getFirestore } from "firebase-admin/firestore";

/**
 * Retrieves Firebase configuration from environment variables
 *
 * @returns {AppOptions} Firebase application configuration object
 * @throws {Error} If any required environment variables are missing
 */
const getFirebaseConfig = (): AppOptions => {
    // Extract Firebase credentials from environment variables
    const {
        FIREBASE_PROJECT_ID,
        FIREBASE_CLIENT_EMAIL,
        FIREBASE_PRIVATE_KEY,
    } = process.env;

    // Validate that all required configuration values are present
    if (
        !FIREBASE_PROJECT_ID ||
        !FIREBASE_CLIENT_EMAIL ||
        !FIREBASE_PRIVATE_KEY
    ) {
        throw new Error(
            "Missing Firebase configuration. Please check FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in your .env file."
        );
    }

    // Firebase service account keys usually come from a JSON file.
    // Here we rebuild the important parts of that JSON using .env values.
    //
    // The private key is stored in .env with escaped newlines (\n),
    // so we convert those back into real line breaks before Firebase uses it.
    const serviceAccount: ServiceAccount = {
        projectId: FIREBASE_PROJECT_ID,
        clientEmail: FIREBASE_CLIENT_EMAIL,
        privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    };

     // Return the app configuration with credentials
    return {
        credential: cert(serviceAccount),
    };
};

/**
 * Initializes Firebase Admin SDK if not already initialized
 *
 * This function implements the singleton pattern to ensure only
 * one Firebase app instance is created.
 *
 * @returns {App} Firebase Admin app instance
 */
const initializeFirebaseAdmin = (): App => {
    // Check if an app is already initialized
    const existingApp = getApps()[0];

    if (existingApp) {
        // Return existing app if found
        return existingApp;
    }

    return initializeApp(getFirebaseConfig());
};

// Initialize the Firebase Admin app
export const getFirebaseAuth = (): Auth =>
    getAuth(initializeFirebaseAdmin());

export const getFirebaseDb = (): Firestore =>
    getFirestore(initializeFirebaseAdmin());
