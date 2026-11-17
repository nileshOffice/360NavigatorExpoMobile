import { AlertBox } from '@/src/common/components/ui/AlertBox';
import AppIcon from '@/src/common/components/ui/AppIcon';
import AppBottomSheet from '@/src/common/components/ui/bottom_sheet';
import Button from '@/src/common/components/ui/Button/Button';
import Input from '@/src/common/components/ui/Input/Input';
import KeyboardAvoidingWrapper from '@/src/common/components/ui/KeyboardAvoidingWrapper';
import { AppText } from '@/src/common/components/ui/Typography';
import Heading from '@/src/common/components/ui/Typography/Heading';
import { APP_ROUTES } from '@/src/common/config/routes';
import Screen from '@/src/common/layouts/Screen';
import { ensureCryptoConfigured } from '@/src/auth/session';
import { cryptoService } from '@/src/lib/services/crypto/cryptoService';
import { useAppDispatch } from '@/src/lib/store/hooks';
import { togglePasswordVisibility } from '@/src/utils/passwordUtils';
import CompanyLogo from '@/assets/images/360Nav_logo.svg';
import LoginBottom from '@/assets/images/loginVectorBottom.svg';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import type { LoginResponse } from '@/src/auth/auth.types';
import { useLoginMutation, useStartNewSessionForUserMutation } from '@/src/auth/authApi';
import { setCredentials } from '@/src/auth/authSlice';
import { getLoginErrorMessage, getLoginValidationMessage } from '@/src/auth/services/loginValidation';

const Login = () => {
  const [startNewSessionForUser, { isLoading: isStartingSession }] =
    useStartNewSessionForUserMutation();
  const [loginMutation, { isLoading: isLoggingIn }] = useLoginMutation();

  const dispatch = useAppDispatch();
  const router = useRouter();

  const [logInForm, setLogInForm] = useState({
    userName: '',
    accessCode: '',
    password: '',
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoginConfirmationVisible, setIsLoginConfirmationVisible] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);

  const isBusy = isLoggingIn || isStartingSession || isPreparing;

  const handleTogglePassword = () => {
    setIsPasswordVisible((prev) => togglePasswordVisibility(prev));
  };

  const completeLogin = (currentUser: NonNullable<LoginResponse['currentUser']>) => {
    dispatch(
      setCredentials({
        currentUser: {
          ...currentUser,
          isNavigationAllowed: true,
        },
        // Same as Angular: userData.companyCode == "RELWEB"
        visitFlag: currentUser.companyCode === 'RELWEB',
      }),
    );
    router.replace(APP_ROUTES.main);
  };

  const login = async () => {
    if (isBusy) return;

    const userName = logInForm.userName.trim();
    const accessCode = logInForm.accessCode.trim();
    const { password } = logInForm;

    const validationMessage = getLoginValidationMessage({
      accessCode,
      userName,
      password,
    });
    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    setErrorMessage(null);

    // The password must be AES-encrypted with keys from loadApplicationData.
    // If that call failed at start-up (offline, server cold start) retry it
    // here instead of failing with a confusing generic error.
    setIsPreparing(true);
    const cryptoReady = await ensureCryptoConfigured(dispatch);
    setIsPreparing(false);

    if (!cryptoReady) {
      setErrorMessage(
        'Unable to reach the server. Check your internet connection and try again.',
      );
      return;
    }

    try {
      const response = await loginMutation({
        userName,
        password: cryptoService.encryptData(password),
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

    const hasActiveSession =
      currentUser.isLoggedIn === true ||
      currentUser.isLoggedIn === 1 ||
      currentUser.isLoggedIn === 'true';

    if (hasActiveSession) {
      // Ask first. Previously the user was marked as authenticated here,
      // so pressing "Cancel" still left them logged in on next launch.
      setIsLoginConfirmationVisible(true);
      return;
    }

    completeLogin(currentUser);
  };

  const startNewSessionLogin = async () => {
    const idDto = {
      id1: logInForm.userName.trim(),
      id2: logInForm.accessCode.trim(),
    };
    setIsLoginConfirmationVisible(false);

    try {
      const response = await startNewSessionForUser(idDto).unwrap();
      const currentUser = response?.currentUser;

      if (!currentUser) {
        setErrorMessage('Invalid start new session response');
        return;
      }

      completeLogin(currentUser);
    } catch (error) {
      setErrorMessage(getLoginErrorMessage(error));
    }
  };

  return (
    <Screen className="flex-1">
       <KeyboardAvoidingWrapper
        contentContainerStyle={{
        
        }}  >
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
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
            value={logInForm.accessCode}
            onChangeText={(text) => setLogInForm((prev) => ({ ...prev, accessCode: text }))}
          />
        </View>
        <View className="w-full">
          <Input
            label="User Name"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="username"
            textContentType="username"
            returnKeyType="next"
            value={logInForm.userName}
            onChangeText={(text) => setLogInForm((prev) => ({ ...prev, userName: text }))}
          />
        </View>
        <View className="w-full">
          <Input
            label="Password"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="password"
            textContentType="password"
            returnKeyType="go"
            onSubmitEditing={login}
            value={logInForm.password}
            onChangeText={(text) => setLogInForm((prev) => ({ ...prev, password: text }))}
           rightIcon={
          <AppIcon
            family="Feather"
            name={isPasswordVisible ? "eye-off" : "eye"}
            size={20}
            color="#000000"
          />
        }
        onRightIconPress={handleTogglePassword}
        secureTextEntry={!isPasswordVisible}
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
          loading={isBusy}
          onPress={login}
        />
        {/* <Button variant="outline" fullWidth className="border border-primary!" onPress={openHandleBottomSheet}>
          <AppText className="text-primary! font-bold" >Back</AppText>
        </Button> */}
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
            <Button title="Continue" fullWidth loading={isStartingSession} onPress={startNewSessionLogin} />
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
      </KeyboardAvoidingWrapper>
       <View
        pointerEvents="none"
        className="absolute -bottom-7 -left-6 -right-6"
        style={{ zIndex: 0 }}
      >
        <LoginBottom width="100%" height={96} preserveAspectRatio="xMidYMid slice" />
      </View>
    </Screen>
  );


};

export default Login;




