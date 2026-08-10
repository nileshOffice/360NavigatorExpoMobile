import AppIcon from '@/app/common/components/ui/AppIcon';
import Button from '@/app/common/components/ui/Button/Button';
import { AppText } from '@/app/common/components/ui/Typography';
import Heading from '@/app/common/components/ui/Typography/Heading';
import { useAppDispatch, useAppSelector } from '@/app/lib/store/hooks';
import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { logout } from '../../auth/authSlice';

const Home = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const userName = String(currentUser?.userName ?? currentUser?.username ?? currentUser?.name ?? 'User');
  const accessCode = currentUser?.accessCode ? String(currentUser.accessCode) : null;

  const handleLogout = () => {
    dispatch(logout());
    router.replace('/auth');
  };

  return (
    <View className="flex-1 px-6 pt-10">
      <View className="flex-row items-center justify-between">
        <View>
          <Heading level={5} className="text-text-secondary">Signed in as</Heading>
          <Heading level={4} className="mt-1 text-2xl font-bold">
            {userName}
          </Heading>
        </View>

        <Button
          title="Logout"
          variant="danger"
          size="sm"
          shape="rounded"
          onPress={handleLogout}
          leftIcon={<AppIcon family="Feather" name="log-out" size={18} color="#FFFFFF" />}
        />
      </View>

      <View className="mt-8 border-b border-border pb-5">
        <AppText className="text-text-secondary">User name</AppText>
        <AppText className="mt-1  font-semibold text-text-primary">
          {userName}
        </AppText>
      </View>

      {accessCode ? (
        <View className="mt-5 border-b border-border pb-5">
          <AppText className="text-text-secondary">Access code</AppText>
          <AppText className="mt-1 text-lg font-semibold text-text-primary">
            {accessCode}
          </AppText>
        </View>
      ) : null}
    </View>
  );
};

export default Home;