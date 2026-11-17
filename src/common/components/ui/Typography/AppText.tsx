import Typography from "@/src/common/components/ui/Typography/Typography";
import { TypographyProps } from "@/src/common/components/ui/Typography/Typography.types";


export default function AppText(props: TypographyProps) {
  return (
    <Typography
      variant="body"
      {...props}
    />
  );
}