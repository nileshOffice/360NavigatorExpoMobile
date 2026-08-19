import { AlertBox } from '@/app/common/components/ui/AlertBox';
import AppIcon from '@/app/common/components/ui/AppIcon';
import AppBottomSheet from '@/app/common/components/ui/bottom_sheet';
import Button from '@/app/common/components/ui/Button/Button';
import Input from '@/app/common/components/ui/Input/Input';
import { AppText } from '@/app/common/components/ui/Typography';
import Heading from '@/app/common/components/ui/Typography/Heading';
import Screen from '@/app/common/layouts/Screen';
import { cryptoService } from '@/app/lib/services/crypto/cryptoService';
import { useAppDispatch } from '@/app/lib/store/hooks';
import CompanyLogo from '@/assets/images/360Nav_logo.svg';
import LoginBottom from '@/assets/images/loginVectorBottom.svg';
import { type Href, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';
import type { LoginResponse } from '../auth.types';
import { useLoginMutation, useStartNewSessionForUserMutation } from '../authApi';
import { setCredentials } from '../authSlice';
import { getLoginErrorMessage, getLoginValidationMessage } from '../services/loginValidation';

const Login = () => {
  const [startNewSessionForUser] = useStartNewSessionForUserMutation()
  const [loginMutation] = useLoginMutation();

  const dispatch = useAppDispatch();
  const [logInForm, setLogInForm] = useState({
    userName: '',
    accessCode: '',
    password: '',
    isFromLogIn: false,
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoginConfirmationVisible, setIsLoginConfirmationVisible] = useState(false);
  const router = useRouter();


  const login = async () => {
    const {
      userName,
      password,
      accessCode,
    } = logInForm;

    const validationMessage = getLoginValidationMessage({
      accessCode,
      userName,
      password,
    });
    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    try {
      setErrorMessage(null);
      let encryptedPassword = cryptoService.encryptData(password);
      const response = await loginMutation({
        userName,
        password: encryptedPassword,
        accessCode,
        isFromLogIn: false,
      }).unwrap();
      handleLoginSuccess(response);
    } catch (error) {
      setErrorMessage(getLoginErrorMessage(error));
    }
  };
  const handleLoginSuccess = (response: LoginResponse) => {
    const currentUser = response?.currentUser;

    if (!currentUser) {
      setErrorMessage('Invalid login response');
      return;
    }

    const isLoggedIn =
      currentUser.isLoggedIn === true ||
      currentUser.isLoggedIn === 1 ||
      currentUser.isLoggedIn === 'true';

    console.log('Login successful:', response);

    if (isLoggedIn) {
      dispatch(
        setCredentials({
          currentUser: {
            ...currentUser,
            isNavigationAllowed: true,
          },
        })
      );
          // User already has an active session
      setIsLoginConfirmationVisible(true);
      // router.replace('/main' as Href);
      return;
    }

    // If backend says login is successful but
    // isLoggedIn is missing/false, you can navigate directly.
    dispatch(
      setCredentials({
        currentUser: {
          ...currentUser,
          isNavigationAllowed: true,
        },
      })
    );
    router.replace('/main' as Href);
  };

  const startNewSessionLogin = async () => {
      const idDto = {
      id1: logInForm.userName.trim(),
      id2: logInForm.accessCode.trim()
    };
    setIsLoginConfirmationVisible(false);
    try {
      const response = await startNewSessionForUser(idDto).unwrap();

      const currentUser = response?.currentUser;
      if (!currentUser) {
        setErrorMessage('Invalid start new session response');
        return;
      }

      // Now lets navigate after successful start new session
     
      dispatch(
        setCredentials({
          currentUser: {
            ...currentUser,
            isNavigationAllowed: true,
          },

          // // Same behavior as Angular
          // isCompanySelectedByUser: false,
          // isSiteSelectedByUser: null,

          // Same as:
          // userData.companyCode == "RELWEB"
          visitFlag: currentUser.companyCode === "RELWEB",
        })
      );
      router.replace('/main' as Href);
    } catch (error) {
      setErrorMessage(getLoginErrorMessage(error));
    }
  };







  return (
    <Screen className="flex-1">
      <View className="flex-1 gap-y-4" style={{ zIndex: 1 }}>
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
          <AlertBox
            type="error"
            title="Login failed"
            message={errorMessage}
            onClose={() => setErrorMessage(null)}
          />
        ) : null}

        <Button
          title="Login"
          fullWidth
          className="mt-6"
          onPress={login}
        />
        {/* <Button variant="outline" fullWidth className="border border-primary!" onPress={openHandleBottomSheet}>
          <AppText className="text-primary! font-bold" >Back</AppText>
        </Button> */}
      </View>

      <View
        pointerEvents="none"
        className="absolute -bottom-16 -left-6 -right-6"
        style={{ zIndex: 0 }}
      >
        <LoginBottom width="100%" height={96} preserveAspectRatio="xMidYMid slice" />
      </View>

      <AppBottomSheet
        visible={isLoginConfirmationVisible}
        onClose={() => setIsLoginConfirmationVisible(false)}
        size="medium"
      >
        <View>
         
          <View className="flex flex-col items-center justify-center gap-2">
             <View className="w-20 h-20  rounded-full bg-blue-100 flex items-center justify-center text-center">
               <AppIcon family="FontAwesome6" name="user-shield" size={30} color="#2563EB"  className='relative left-1' />
             </View>
             
             <Heading level={3} className="">You are already logged in</Heading>
             <AppText className="text-text-secondary text-center w-2/3 mb-2">
               Do you want to continue with the current session ?
              </AppText>
          </View>
         
          
          
          <View className="flex flex-col gap-2 mt-2">
            <Button title="Continue" fullWidth onPress={startNewSessionLogin} />
            <Button variant="outline" fullWidth className="border border-primary!" onPress={() => setIsLoginConfirmationVisible(false)}>
              <AppText className="text-primary! font-bold" >Cancel</AppText>
            </Button>
          </View>
          <View
            pointerEvents="none"
            className="absolute -bottom-32 -left-6 -right-6"
            style={{ zIndex: 0 }}
          >
            <LoginBottom width="100%" height={96} preserveAspectRatio="xMidYMid slice" />
          </View>

          
        </View>
        
      </AppBottomSheet>
    </Screen>
  );


};

export default Login;




