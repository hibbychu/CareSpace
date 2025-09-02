/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {setGlobalOptions} from "firebase-functions";
import {onCall} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

const auth = admin.auth();

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

interface AdminLoginData {
  email: string;
  password: string;
}

interface AdminUser {
  uid: string;
  email: string;
  role: string;
  permissions: string[];
}

/**
 * Admin Login Callable Function - No CORS issues!
 * Authenticates admin users using their existing Firebase Auth account
 */
export const adminLogin = onCall(async (request) => {
  try {
    const { email, password } = request.data as AdminLoginData;

    logger.info("Admin login attempt", { email });

    // Validate input
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    // Check if user exists and has admin privileges
    try {
      const userRecord = await auth.getUserByEmail(email);
      
      // Check if user has admin custom claims
      const customClaims = userRecord.customClaims || {};
      
      if (!customClaims.admin && customClaims.role !== 'admin') {
        logger.warn("Admin login failed - insufficient privileges", { email });
        throw new Error("Insufficient admin privileges");
      }

      // Create custom token for the admin user
      const customToken = await auth.createCustomToken(userRecord.uid, {
        admin: true,
        role: 'admin',
        permissions: customClaims.permissions || ['events', 'forums', 'users']
      });

      const adminUser: AdminUser = {
        uid: userRecord.uid,
        email: userRecord.email || email,
        role: 'admin',
        permissions: (customClaims.permissions as string[]) || ['events', 'forums', 'users']
      };

      logger.info("Admin login successful", { email, uid: userRecord.uid });

      return {
        success: true,
        customToken,
        user: adminUser
      };

    } catch (error) {
      logger.warn("Admin login failed - user not found or invalid", { email });
      throw new Error("Invalid email or insufficient privileges");
    }

  } catch (error) {
    logger.error("Admin login error", { error: error instanceof Error ? error.message : error });
    
    return {
      success: false,
      error: error instanceof Error ? error.message : "Authentication failed"
    };
  }
});

/**
 * Set Admin Claims Function
 * Call this once to make your Firebase Auth user an admin
 */
export const setAdminClaims = onCall(async (request) => {
  try {
    const { email } = request.data;

    if (!email) {
      throw new Error("Email is required");
    }

    // Get user by email
    const userRecord = await auth.getUserByEmail(email);

    // Set admin custom claims
    await auth.setCustomUserClaims(userRecord.uid, {
      admin: true,
      role: 'admin',
      permissions: ['events', 'forums', 'users', 'settings']
    });

    logger.info("Admin claims set successfully", { email, uid: userRecord.uid });

    return {
      success: true,
      message: `Admin claims set for ${email}`,
      uid: userRecord.uid
    };

  } catch (error) {
    logger.error("Set admin claims error", { error: error instanceof Error ? error.message : error });
    
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to set admin claims"
    };
  }
});