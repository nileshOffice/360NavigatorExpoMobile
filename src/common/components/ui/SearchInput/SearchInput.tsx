import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { styled } from "nativewind";
import { TextInput, View } from "react-native";
import AppIcon from "@/src/common/components/ui/AppIcon";

// Same input, but registered with the bottom sheet so the sheet can move
// with the keyboard. Only valid inside an AppBottomSheet.
const SheetTextInput = styled(BottomSheetTextInput);

interface SearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  className?: string;
  /** Set when the field is rendered inside an AppBottomSheet. */
  inBottomSheet?: boolean;
}

const SearchInput = ({
  value,
  onChangeText,
  placeholder = "Search...",
  className,
  inBottomSheet = false,
}: SearchInputProps) => {
  const InputComponent = inBottomSheet ? SheetTextInput : TextInput;

  return (
    <View
      className={`flex-row items-center rounded-full min-h-12  bg-surface px-4 ${className ?? ""}`}
    >
      <AppIcon
        name="search"
        size={20}
        family="Feather"
        color="#94A3B8"
      />

      <InputComponent
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        autoCapitalize="none"
        autoCorrect={false}
        accessibilityLabel={placeholder}
        className="ml-3 flex-1 py-3 text-text-primary"
      />
    </View>
  );
};

export default SearchInput;
