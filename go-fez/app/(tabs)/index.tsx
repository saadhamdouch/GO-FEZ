import Loading from '@/components/loading-modal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { Dimensions, StyleSheet } from 'react-native';

const { height } = Dimensions.get('window');
export default function HomeScreen() {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const checkOnboardingStatus = async () => {
    try {
      setIsLoading(true);
      const completed = await AsyncStorage.getItem('onboardingCompleted');
      if (completed === 'true') {
        setHasCompletedOnboarding(true);
      } else {
        setHasCompletedOnboarding(false);
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkOnboardingStatus();
  }, []);
  if (isLoading) {
    return <Loading />;
  }
  if (hasCompletedOnboarding) {
    return <Redirect href='/explore' />;
  } else {
    return <Redirect href='/onboarding' />;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ff0000ff',
  },
});
