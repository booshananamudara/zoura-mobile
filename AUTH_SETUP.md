# Mobile App Authentication - Setup Instructions

## Quick Start Guide

### 1. Verify Dependencies
All required packages have been installed:
- ✅ `axios`
- ✅ `@react-native-async-storage/async-storage`
- ✅ `@react-navigation/native`
- ✅ `@react-navigation/native-stack`
- ✅ `@react-navigation/bottom-tabs`
- ✅ `react-native-screens`
- ✅ `react-native-safe-area-context`

### 2. Configure API URL

**Important:** Update the API URL based on your testing environment.

Edit: `src/config/api.ts`

```typescript
// For Android Emulator
export const API_BASE_URL = 'http://10.0.2.2:8080';

// For iOS Simulator  
export const API_BASE_URL = 'http://localhost:8080';

// For Physical Device (use your computer's IP)
export const API_BASE_URL = 'http://192.168.1.66:8080';
```

### 3. Restart Expo

```bash
# Stop the current expo server (Ctrl+C)
npx expo start --clear
```

### 4. Test Authentication Flow

#### Register a New User
1. Open the app → Login screen appears
2. Tap "Sign Up"
3. Fill in:
   - Name: "Test User"
   - Email: "test@example.com"
   - Password: "password123"
   - Confirm Password: "password123"
4. Tap "Create Account"
5. Should auto-login and navigate to Shop tab

#### Login with Existing User
1. Open app → Login screen
2. Enter:
   - Email: "test@example.com"
   - Password: "password123"
3. Tap "Sign In"
4. Should navigate to Shop tab

#### View Profile
1. Navigate to Profile tab (bottom navigation)
2. Should see user details:
   - Name
   - Email
   - Subscription tier

#### Logout
1. In Profile tab, tap "Logout"
2. Confirm in dialog
3. Should return to Login screen

### 5. Testing Persistent Login

1. Login to the app
2. Close the app completely
3. Reopen the app
4. Should automatically show Shop tab (stays logged in)

---

## Troubleshooting

### "Network request failed"
- **Check:** Backend is running on port 8080
- **Check:** API_BASE_URL is correct for your device
- **Check:** Phone and computer are on same WiFi (for physical device)

### "Cannot find module '@react-navigation/native'"
```bash
npx expo install react-native-screens react-native-safe-area-context
```

### Token not persisting
- AsyncStorage might need rebuild:
```bash
npx expo start --clear
```

### Profile shows loading forever
- Check backend `/auth/profile` endpoint
- Verify token is saved (check AsyncStorage in dev tools)

---

## Next Steps

✅ **Authentication is ready!**

You can now:
1. Add product browsing features
2. Implement cart functionality
3. Add order placement
4. Enhance user profile settings

All authenticated API calls will automatically include the JWT token from AsyncStorage.

---

## File Structure

```
zoura-mobile/
├── src/
│   ├── config/
│   │   └── api.ts                 # API configuration
│   ├── context/
│   │   └── AuthContext.tsx        # Auth state management
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx    # Login UI
│   │   │   └── RegisterScreen.tsx # Register UI
│   │   └── ProfileScreen.tsx      # User profile
│   └── ...
├── app/
│   └── (tabs)/
│       └── shop.tsx               # Shop screen
├── AppNavigator.tsx               # Navigation logic
└── App.tsx                        # Entry point
```

---

**Authentication is fully implemented and ready to use!** 🎉
