import { Button as RBButton } from "react-bootstrap";

import styles from "./Button.module.css";

export default function Button({
  children,
  variant,
  type = "button",
  as = null,
  href = null,
  size,
  onClick,
  disabled,
}) {
  return (
    <RBButton
      className={`${variant ? styles[variant] : styles.default} font-zapp`}
      type={type}
      as={as}
      href={href}
      size={size}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </RBButton>
  );
}
