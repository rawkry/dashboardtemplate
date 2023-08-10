import { Col, Row } from "react-bootstrap";
import WrapWithHead from "../_shared/components/WrapWithHead";
import styles from "./Guest.module.css";

export default function Guest({ children, title = "" }) {
  return (
    <WrapWithHead title={title}>
      <Col md={{ span: 3, offset: 3 }} className="m-3 mx-sm-auto mt-sm-5">
        <div className="d-flex justify-content-center align-items-center">
          <img
            src="/logo.png"
            alt="Logo"
            height="60px"
            className="text-center mb-5"
          />
        </div>

        {children}
      </Col>
    </WrapWithHead>
  );
}
