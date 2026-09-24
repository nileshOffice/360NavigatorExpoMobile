import { View } from "react-native";
import { AppText } from "./Typography";


interface AppStepperProps  {
  steps: { key?: string | number }[];
  currentStep: number;
  totalSteps: number;
  showLabel?: boolean;
}

const AppStepper = ({
    steps,
    currentStep,
    totalSteps,
    showLabel = true,
    // completedColor = "bg-blue-500",
    // incompleteColor = "bg-gray-300",
}: AppStepperProps) => {
    


  return (
    <View>
      {showLabel && (
        <AppText className="mb-2">
          Step {totalSteps === 0 ? 0 : currentStep + 1} of {totalSteps}
        </AppText>
      )}

      <View className="flex-row gap-1">
        {steps.map((step, index) => {
          const completed = index <= currentStep;

          return (
            <View
              key={step.key ?? index}
              className={`h-1.5 flex-1 rounded-full ${
                completed ? "bg-blue-600" : "bg-slate-200"
              }`}
            />
          );
        })}
      </View>
    </View>
  );
};

export default AppStepper;