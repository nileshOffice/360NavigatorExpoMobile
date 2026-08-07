import Typography from "./Typography";

interface HeadingProps {
  children: React.ReactNode;

  level?: 1 | 2 | 3 | 4 | 5 | 6;

  className?: string;

  color?: string;

  center?: boolean;
}

const map = {
  1: "h1",
  2: "h2",
  3: "h3",
  4: "h4",
  5: "h5",
  6: "h6",
} as const;

export default function Heading({
  level = 1,
  ...props
}: HeadingProps) {
  return (
    <Typography
      {...props}
      variant={map[level]}
    />
  );
}