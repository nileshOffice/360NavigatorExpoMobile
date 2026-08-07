import Typography from "./Typography";
import { TypographyProps } from "./Typography.types";


export default function AppText(props: TypographyProps) {
  return (
    <Typography
      variant="body"
      {...props}
    />
  );
}