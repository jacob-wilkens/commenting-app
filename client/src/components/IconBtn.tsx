import { IconType } from "react-icons";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  Icon: IconType;
  isActive?: boolean;
  color?: string;
  children?: React.ReactNode;
};
export const IconBtn = ({ Icon, isActive, color, children, ...allProps }: Props) => {
  return (
    <button className={`btn icon-btn ${isActive ? "icon-btn-active" : ""} ${color || ""} `} {...allProps}>
      <span className={`${children != null ? "mr" : ""} `}>
        <Icon />
      </span>
      {children}
    </button>
  );
};
