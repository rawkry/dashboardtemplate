import { FloatingLabel } from "react-bootstrap";
import { useRouter } from "next/router";
import React from "react";

const Limit = ({ limit, currentPage, pages, total }) => {
  const router = useRouter();
  const renderOptions = () => {
    const options = [10, 20, 50, 100];
    return options.map((value) => {
      return (
        <option key={value} value={value}>
          {value}
        </option>
      );
    });
  };

  return pages < 2 ? null : (
    <div className="d-flex align-items-center">
      <div>
        <FloatingLabel controlId="floatingSelect" label="show">
          <select
            className="form-select form-select-sm"
            value={limit}
            onChange={(e) => {
              const { value } = e.target;
              router.push({
                pathname: router.pathname,
                query: { ...router.query, limit: value, page: 1 },
              });
            }}
          >
            {renderOptions()}
          </select>
        </FloatingLabel>
      </div>
    </div>
  );
};

export default Limit;
