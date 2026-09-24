import AppIcon from '@/app/common/components/ui/AppIcon';
import Input from '@/app/common/components/ui/Input/Input';
import React from 'react';

type AssetFormFieldProps = {
    rightIcon: React.ReactNode | null;
    label: string;
    value: string;
    type?: 'text' | 'number' | 'select' | 'date';
    required?: boolean;
    onChangeText?: (value: string) => void;
    onPress?: () => void;
    field?: any;
};

const AssetFormField = ({
    label,
    value,
    type = 'text',
    required = false,
    onChangeText,
    onPress,
    rightIcon,
    field
}: AssetFormFieldProps) => {

    const isSelect = type === 'select';
    const isDate = type === 'date';

    return (
        <Input
            label={label}
            value={value ?? ''}
            required={required}
            className="mb-4"
          

            editable={!isSelect && !isDate}

            keyboardType={
                type === 'number'
                    ? 'numeric'
                    : 'default'
            }

            onChangeText={
                !isSelect && !isDate
                    ? onChangeText
                    : undefined
            }

            onPress={
                isSelect || isDate
                    ? onPress
                    : undefined
            }

            rightIcon={
                isSelect ? (
                    <AppIcon
                        family="Feather"
                        name="chevron-right"
                        size={20}
                        color="#000000"
                    />
                ) : isDate ? (
                    <AppIcon
                        family="Feather"
                        name="calendar"
                        size={20}
                        color="#000000"
                    />
                ) : undefined
            }
        />
    );
};

export default AssetFormField;