import { cn } from "@/src/lib/cn";
import {
  AntDesign,
  Feather,
  FontAwesome6,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

export type IconFamily =
  | "Ionicons"
  | "MaterialCommunityIcons"
  | "Feather"
  | "AntDesign"
  | "FontAwesome6";

interface AppIconProps {
  family?: IconFamily;
  name?: string;
  size?: number;
  color?: string;
  className?: string;
}

// Defined once at module level instead of on every render.
const ICON_FAMILIES = {
  Ionicons,
  MaterialCommunityIcons,
  Feather,
  AntDesign,
  FontAwesome6,
} as const;

export default function AppIcon({
  family = "Ionicons",
  name,
  size = 20,
  color = "#000000",
  className,
}: AppIconProps) {
  const IconComponent = ICON_FAMILIES[family] ?? Ionicons;

  return (
    <IconComponent
      name={name as any}
      size={size}
      color={color}
      className={cn("text-icon", className)}
      // Decorative by default; the surrounding control carries the label.
      accessibilityElementsHidden
      importantForAccessibility="no"
    />
  );
}
