import { existsSync, readFileSync } from "fs";
import path from "path";
import {
    App,
    applicationDefault,
    cert,
    getApps,
    initializeApp,
    ServiceAccount,
} from "firebase-admin/app";
import { Auth, getAuth } from "firebase-admin/auth";
import { Firestore, getFirestore } from "firebase-admin/firestore";

let firebaseApp: App | null = null;

const serviceKeyPath = path.resolve(__dirname, "ServiceKey.json");

interface RawServiceAccount {
    project_id?: string;
    client_email?: string;
    private_key?: string;
}

const isServiceAccount = (
    account: RawServiceAccount | ServiceAccount
): account is ServiceAccount =>
    "projectId" in account &&
    "clientEmail" in account &&
    "privateKey" in account;

const normalizeServiceAccount = (
    account: RawServiceAccount | ServiceAccount
): ServiceAccount => {
    if (isServiceAccount(account)) {
        return account;
    }

    return {
        projectId: account.project_id ?? "",
        clientEmail: account.client_email ?? "",
        privateKey: (account.private_key ?? "").replace(/\\n/g, "\n"),
    };
};

const readLocalServiceAccount = (): ServiceAccount | null => {
    if (!existsSync(serviceKeyPath)) {
        return null;
    }

    return normalizeServiceAccount(
        JSON.parse(readFileSync(serviceKeyPath, "utf-8")) as RawServiceAccount
    );
};

const readEnvServiceAccount = (): ServiceAccount | null => {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        const parsedAccount = JSON.parse(
            process.env.FIREBASE_SERVICE_ACCOUNT
        ) as RawServiceAccount | ServiceAccount;

        return normalizeServiceAccount(parsedAccount);
    }

    const {
        FIREBASE_PROJECT_ID,
        FIREBASE_CLIENT_EMAIL,
        FIREBASE_PRIVATE_KEY,
    } = process.env;

    if (
        FIREBASE_PROJECT_ID &&
        FIREBASE_CLIENT_EMAIL &&
        FIREBASE_PRIVATE_KEY
    ) {
        return {
            projectId: FIREBASE_PROJECT_ID,
            clientEmail: FIREBASE_CLIENT_EMAIL,
            privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        };
    }

    return null;
};

const initializeFirebaseApp = (): App => {
    if (firebaseApp) {
        return firebaseApp;
    }

    const existingApp = getApps()[0];
    if (existingApp) {
        firebaseApp = existingApp;
        return firebaseApp;
    }

    const envServiceAccount = readEnvServiceAccount();
    if (envServiceAccount) {
        firebaseApp = initializeApp({
            credential: cert(envServiceAccount),
        });
        return firebaseApp;
    }

    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        firebaseApp = initializeApp({
            credential: applicationDefault(),
        });
        return firebaseApp;
    }

    const localServiceAccount = readLocalServiceAccount();
    if (localServiceAccount) {
        firebaseApp = initializeApp({
            credential: cert(localServiceAccount),
        });
        return firebaseApp;
    }

    throw new Error(
        "Firebase is not configured. Set FIREBASE_SERVICE_ACCOUNT, FIREBASE_PROJECT_ID/FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY, GOOGLE_APPLICATION_CREDENTIALS, or provide src/config/ServiceKey.json locally."
    );
};

export const getFirebaseAuth = (): Auth => getAuth(initializeFirebaseApp());

export const getFirebaseDb = (): Firestore =>
    getFirestore(initializeFirebaseApp());
