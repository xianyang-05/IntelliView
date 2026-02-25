import path from "path"
import fs from "fs"

let _adminApp: any = null

export async function getAdminApp() {
    if (_adminApp) return _adminApp

    const { initializeApp, getApps, cert } = await import("firebase-admin/app")

    if (getApps().length > 0) {
        _adminApp = getApps()[0]
        return _adminApp
    }

    // Try service account JSON path from env
    const saPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
    if (saPath) {
        const resolved = path.resolve(saPath)
        if (fs.existsSync(resolved)) {
            const serviceAccount = JSON.parse(fs.readFileSync(resolved, "utf-8"))
            _adminApp = initializeApp({ credential: cert(serviceAccount) })
            return _adminApp
        }
    }

    // Try inline JSON from env
    const saJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
    if (saJson) {
        const serviceAccount = JSON.parse(saJson)
        _adminApp = initializeApp({ credential: cert(serviceAccount) })
        return _adminApp
    }

    // Fallback: default credentials (e.g. on GCP)
    _adminApp = initializeApp()
    return _adminApp
}

export async function getAdminAuth() {
    const app = await getAdminApp()
    const { getAuth } = await import("firebase-admin/auth")
    return getAuth(app)
}

export async function getAdminDb() {
    const app = await getAdminApp()
    const { getFirestore } = await import("firebase-admin/firestore")
    return getFirestore(app)
}
