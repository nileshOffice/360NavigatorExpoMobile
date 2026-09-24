import { TextInput, View } from "react-native";
import AppIcon from "../AppIcon";

interface SearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  className?: string;
}

const SearchInput = ({
  value,
  onChangeText,
  placeholder = "Search...",
  className,
}: SearchInputProps) => {
  return (
    <View
      className={`flex-row items-center rounded-full h-12  bg-surface px-4 ${className ?? ""}`}
    >
      <AppIcon
        name="search"
        size={20}
        family="Feather"
        color="#94A3B8"
      />

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        autoCapitalize="none"
        autoCorrect={false}
        className="ml-3 flex-1 py-3 text-foreground"
      />
    </View>
  );
};

export default SearchInput;