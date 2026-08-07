import AppIcon from '@/app/common/components/ui/AppIcon';
import Button from '@/app/common/components/ui/Button/Button';
import Input from '@/app/common/components/ui/Input/Input';
import { AppText } from '@/app/common/components/ui/Typography';
import Heading from '@/app/common/components/ui/Typography/Heading';
import Screen from '@/app/common/layouts/Screen';
import { cryptoService } from '@/app/lib/services/crypto/cryptoService';
import CompanyLogo from '@/assets/images/360Nav_logo.svg';
import LoginBottom from '@/assets/images/loginVectorBottom.svg';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';
import { useLoginMutation } from '../authApi';

type LoginMutationError = {
  status?: number | string;
  error?: string;
  data?: unknown;
};

const Login = () => {
  const [logInForm, setLogInForm] = useState({
    userName: '',
    accessCode: '',
    password: '',
    isFromLogIn: false,
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loginMutation] = useLoginMutation();
  const router = useRouter();

  const handleLoginSuccess = (response: unknown) => {
    console.log('Login successful', response);
    router.replace('/common/home');
  };

  const handleLoginError = (error: unknown) => {
    const mutationError = error as LoginMutationError;
    const fallbackMessage = error instanceof Error ? error.message : 'Login failed';
    const statusText = mutationError?.status ? `status=${String(mutationError.status)}` : '';
    const errorText = mutationError?.error ? `error=${mutationError.error}` : '';
    const dataText = mutationError?.data ? `data=${JSON.stringify(mutationError.data)}` : '';
    const detailMessage = [statusText, errorText, dataText].filter(Boolean).join(' | ');





    setErrorMessage(detailMessage || fallbackMessage);
  };

  const login = async () => {

    const {
      userName,
      password,
      accessCode,
    } = logInForm;



    try {

     let encryptedPassword = cryptoService.encryptData(password);
      const response = await loginMutation({
        userName,
        password: encryptedPassword,
        accessCode,
        isFromLogIn:true,
      }).unwrap();
      console.log("✅ Login response:", response);
      handleLoginSuccess(response);
    } catch (error) {
      console.log("❌ Login error:", error);
      handleLoginError(error);
    }
  };



  return (
    <Screen className="flex-1 p-6">
      <View className="flex-1   gap-y-4">
        <View className="items-center  max-w-2xl my-2" >
          <CompanyLogo width={230} height={56} />
          <AppText variant="body" className="text-center text-text-secondary ">
            Analytics-Driven EAM Performance Improvement Management
          </AppText>
        </View>

        <Heading level={1} className="text-2xl font-bold mb-6">
          Sign In
        </Heading>
        <View className="w-full">
          <Input
            label="Access Code"
            value={logInForm.accessCode}
            onChangeText={(text) => setLogInForm((prev) => ({ ...prev, accessCode: text }))}
          />
        </View>
        <View className="w-full">
          <Input
            label="User Name"
            value={logInForm.userName}
            onChangeText={(text) => setLogInForm((prev) => ({ ...prev, userName: text }))}
          />
        </View>
        <View className="w-full">
          <Input
            label="Password"
            value={logInForm.password}
            onChangeText={(text) => setLogInForm((prev) => ({ ...prev, password: text }))}
            rightIcon={<AppIcon family="Feather" name="eye" size={20} color="#000000" />}
            secureTextEntry
          />
        </View>

        {errorMessage ? (
          <AppText className="text-error mt-2">{errorMessage}</AppText>
        ) : null}

        <Button title="Login" fullWidth className="mt-6 " onPress={login} />
        <Button variant="outline" fullWidth className="border border-primary!" onPress={() => {
          console.log('Back pressed');
        }}>
          <AppText className="text-primary! font-bold">Back</AppText>
        </Button>
      </View>
      <View className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <LoginBottom width="100%" height={80} preserveAspectRatio="xMidYMid slice" className='-z-10!' style={{ zIndex: -10 }} />
      </View>
    </Screen>
  );
};

export default Login;




