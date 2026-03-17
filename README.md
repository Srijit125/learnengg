# LearnEngg LMS Platform 👋

LearnEngg is a comprehensive Learning Management System (LMS) built with React Native and Expo, designed to provide a seamless learning experience for students and robust management tools for administrators.

## 🚀 Key Features

### 👨‍🎓 For Students
- **Personalized Dashboard**: Track your learning progress at a glance.
- **Course Management**: Access and browse enrolled courses and chapters.
- **Interactive Quizzes**: Test your knowledge with chapter-specific MCQs.
- **Performance Analytics**: Detailed reports on your strengths and weaknesses.
- **Smart Recommendations**: Get suggestions on what to study next based on your performance.
- **Personalized Experience**: Customize your preferences, including theme (Dark/Light mode).

### 👩‍💼 For Administrators
- **Administrative Dashboard**: Overview of platform activity and student engagement.
- **Content Management**: Manage courses and chapters efficiently.
- **MCQ Management**: Create and organize Multiple Choice Questions for different courses.
- **Advanced Reporting**: Generate and export reports on student and course performance.
- **Support Tools**: Built-in help and support management sections.

## 🛠 Tech Stack

- **Framework**: [Expo](https://expo.dev) / [React Native](https://reactnative.dev)
- **Routing**: [Expo Router](https://docs.expo.dev/router/introduction) (File-based routing)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Backend & Database**: [Supabase](https://supabase.com) (PostgreSQL & Auth)
- **Styling**: [NativeWind](https://www.nativewind.dev) (Tailwind CSS for React Native)
- **Charts**: [React Native Gifted Charts](https://github.com/Abhinandan-Kushwaha/react-native-gifted-charts)
- **Editor**: [Monaco Editor](https://microsoft.github.io/monaco-editor/) (Web)
- **Language**: TypeScript

## 📂 Project Structure

- `app/`: Contains the application routes (Expo Router).
  - `(admin)/`: Admin-specific screens and layouts.
  - `(student)/`: Student-specific screens and layouts.
- `components/`: Reusable UI components used across the app.
- `services/`: API calls, Supabase client, and business logic.
- `store/`: Zustand state management stores.
- `theme/`: Design tokens, colors, and global styles.
- `utils/`: Helper functions and constants.
- `supabase/`: Database migrations and configuration.

## 🏁 Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up Environment Variables**
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Start the app**
   ```bash
   npx expo start
   ```

You can open the app in a [development build](https://docs.expo.dev/develop/development-builds/introduction/), [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/), [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/), or [Expo Go](https://expo.dev/go).

## 📄 License

This project is private and intended for use by LearnEngg.
