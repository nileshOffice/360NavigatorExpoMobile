
import { cn } from "@/app/lib/cn";
import React, { useState } from "react";
import {
    Platform,
    Pressable,
    View
} from "react-native";
import AppIcon from "./AppIcon";
import { AppText } from "./Typography";

import DateTimePicker, {
    DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import AppBottomSheet from "./bottom_sheet";

type DateFormat =
  | "DD/MM/YYYY"
  | "MM/DD/YYYY"
  | "YYYY-MM-DD"
  | "DD-MM-YYYY";

interface AppDatePickerProps {
  label?: string;
  value?: Date | null;
  onChange?: (date: Date | null) => void;

  placeholder?: string;
  minimumDate?: Date;
  maximumDate?: Date;

  dateFormat?: DateFormat;
  disabled?: boolean;
  error?: string;
  required?: boolean;

  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;

  placeholderColor?: string;
  textColor?: string;
  borderColor?: string;
  activeColor?: string;
}

const formatDate = (
  date: Date | null | undefined,
  dateFormat: DateFormat = "DD/MM/YYYY"
): string => {
  if (!date || isNaN(date.getTime())) {
    return "";
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  switch (dateFormat) {
    case "MM/DD/YYYY":
      return `${month}/${day}/${year}`;

    case "YYYY-MM-DD":
      return `${year}-${month}-${day}`;

    case "DD-MM-YYYY":
      return `${day}-${month}-${year}`;

    case "DD/MM/YYYY":
    default:
      return `${day}/${month}/${year}`;
  }
};

const AppDatePicker: React.FC<AppDatePickerProps> = ({
  label = "Select Date",
  value = null,
  onChange,

  placeholder = "Select date",
  minimumDate,
  maximumDate,

  dateFormat = "DD/MM/YYYY",
  disabled = false,
  error = "",
  required = false,

  containerClassName = "",
  labelClassName = "",
  inputClassName = "",

  placeholderColor = "#94A3B8",
  textColor = "#0F172A",
  borderColor = "#CBD5E1",
  activeColor = "#2563EB",
}) => {
  const [showPicker, setShowPicker] = useState(false);

  const isValidValue =
    value instanceof Date && !isNaN(value.getTime());

  const selectedDate = isValidValue ? value : new Date();

  const displayValue = isValidValue
    ? formatDate(value, dateFormat)
    : "";

  const handleChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    if (Platform.OS === "android") {
      setShowPicker(false);

      if (event.type === "dismissed" || !selectedDate) {
        return;
      }

      onChange?.(selectedDate);
      return;
    }

    // iOS spinner/calendar changes.
    // Keep modal open until Done is pressed.
    if (selectedDate) {
      onChange?.(selectedDate);
    }
  };

  const handleCancel = () => {
    setShowPicker(false);
  };

  const handleConfirm = () => {
    setShowPicker(false);
  };

  return (
    <View className={cn("mb-4 w-full", containerClassName)}>
      {/* Label */}
      {label && (
        <AppText className={cn("mb-2 text-md font-medium text-text-primary", labelClassName)}>
          {label}
          {required && <AppText className="text-error"> *</AppText>}
        </AppText>
      )}

      {/* Input */}
      <Pressable
        disabled={disabled}
        onPress={() => setShowPicker(true)}
        accessibilityRole="button"
        accessibilityLabel={label || placeholder}
        accessibilityState={{ disabled }}
        className={cn(
          "min-h-14 flex-row items-center justify-between rounded-full border bg-white px-4",
          disabled && "opacity-50",
          inputClassName,
        )}
        style={{
          borderColor: error ? "#DC2626" : borderColor,
        }}
      >
        <AppText
          variant="body"
          style={{
            color: displayValue ? textColor : placeholderColor,
          }}
        >
          {displayValue || placeholder}
        </AppText>

        {/* Calendar Icon */}
        <AppIcon
          family="Feather"
          name="calendar"
          size={20}
          color={disabled ? placeholderColor : activeColor}
          
        />
      </Pressable>

      {/* Error */}
      {error ? (
        <AppText className="mt-1 text-xs text-error">
          {error}
        </AppText>
      ) : null}

      {/* Android Date Picker */}
      {showPicker && Platform.OS === "android" && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          onChange={handleChange}
        />
      )}



      {/* iOS Date Picker */}
      {showPicker && Platform.OS === "ios" && (
        <AppBottomSheet
         size='dateBottomSheetSize'
          visible={showPicker}
           onClose={handleCancel}
           
        >
          <View className="flex-1 justify-end bg-black/40">
            <View className="rounded-t-3xl bg-white ">
              {/* Header */}
              <View className="flex-row items-center justify-between border-b border-border-full px-4 pb-4  ">
                  <Pressable
                    onPress={handleCancel}
                    accessibilityRole="button"
                    accessibilityLabel="Cancel date selection"
                    hitSlop={8}
                  >
                    <AppText variant="bodyLarge" weight="medium">
                    Cancel
                    </AppText>
                </Pressable>

                  <AppText weight="semibold" variant="h5" >
                  Select Date
                  </AppText>

                  <Pressable
                    onPress={handleConfirm}
                    accessibilityRole="button"
                    accessibilityLabel="Confirm date selection"
                    hitSlop={8}
                  >
                    <AppText
                     variant="bodyLarge"
                     weight="medium"
                    style={{ color: activeColor }}
                  >
                    Done
                    </AppText>
                </Pressable>
              </View>

              {/* Native iOS Picker */}
              <DateTimePicker
                
                value={selectedDate}
                mode="date"
                display="spinner"
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                onChange={handleChange}
                style={{
                  alignSelf: "center",
                  width:'100%',
                  height:180
                }}

              />
            </View>
          </View>
        </AppBottomSheet>
      )}
    </View>
  );
};

export default AppDatePicker;