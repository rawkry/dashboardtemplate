import { ButtonGroup, Form, Table, FloatingLabel } from "react-bootstrap";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import querystring from "querystring";

import { Button } from "@/ui";
import { callFetch } from "@/helpers/server";
import { Main } from "@/layouts";
import { Limit, Pagination } from "@/components";
import { toHuman } from "@/helpers/clients";

export async function getServerSideProps(context) {
  try {
    const { limit = 20 } = context.query;
    const [
      status,
      { users_cashflows, currentPage, limit: returnedLimit, pages, total },
    ] = await callFetch(
      `/users-cashflows?limit=${limit}&${querystring.stringify(context.query)}`,
      "GET"
    );
    return {
      props: {
        users_cashflows,
        currentPage,
        limit: returnedLimit,
        pages,
        total,
        fetched: true,
      },
    };
  } catch (e) {
    return {
      props: {
        fetched: false,
      },
    };
  }
}

export default function Index({
  users_cashflows: userCashflowsFromServer,
  currentPage,
  limit,
  pages,
  fetched,

  total,
}) {
  const service = JSON.parse(process.env.NEXT_PUBLIC_SERVICE_TYPES);

  const router = useRouter();

  const [usersCashflows, setusersCashflows] = useState(userCashflowsFromServer);

  useEffect(() => {
    setusersCashflows(userCashflowsFromServer);
  }, [userCashflowsFromServer]);

  return (
    <Main
      title={`User Cashflows (${!fetched ? "" : total})`}
      icon="fa-solid fa-useres"
    >
      {!fetched ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "60vh",
          }}
        >
          <h1>Please check your internet connection and try again... </h1>
        </div>
      ) : (
        <>
          <div className="d-flex justify-content-end gap-4 ">
            <Form.Group controlId="active">
              <FloatingLabel
                controlId="floatingSelect"
                label="Service Type"
                className="mb-3"
              >
                <select
                  className="form-select form-select-sm"
                  defaultValue={
                    router.query.service_type
                      ? router.query.service_type.charAt(0).toUpperCase() +
                        router.query.service_type.slice(1)
                      : "All"
                  }
                  onChange={(e) => {
                    const { value } = e.target;

                    if (value === "All") {
                      const { service_type, ...query } = router.query;
                      router.push({
                        pathname: router.pathname,
                        query,
                      });
                      return;
                    }

                    router.push({
                      pathname: router.pathname,
                      query: {
                        ...router.query,
                        service_type: value.toLocaleLowerCase(),
                      },
                    });
                  }}
                >
                  <option
                    value="All"
                    style={{
                      width: "100%",
                    }}
                  >
                    All service
                  </option>
                  {service.map((item, index) => (
                    <option
                      key={index}
                      value={item}
                      style={{
                        width: "100%",
                      }}
                    >
                      {item}
                    </option>
                  ))}
                </select>
              </FloatingLabel>
            </Form.Group>
            <Form.Group controlId="active">
              <FloatingLabel
                controlId="floatingSelect"
                label="Order by"
                className="mb-3"
              >
                <select
                  className="form-select form-select-sm"
                  defaultValue={router.query.orderBy || "All"}
                  onChange={(e) => {
                    const { value } = e.target;
                    if (value === "All") {
                      const { orderBy, ...query } = router.query;
                      router.push({
                        pathname: router.pathname,
                        query,
                      });
                      return;
                    }

                    router.push({
                      pathname: router.pathname,
                      query: {
                        ...router.query,
                        orderBy: value,
                      },
                    });
                  }}
                >
                  <option value="All">none</option>
                  <option value="business_id">business</option>
                  <option value="user_id">user</option>
                  <option value="amount">amount</option>
                  <option value="created_at">date</option>
                </select>
              </FloatingLabel>
            </Form.Group>
            <Form.Group controlId="active">
              <FloatingLabel
                controlId="floatingSelect"
                label="Order"
                className="mb-3"
              >
                <select
                  className="form-select form-select-sm"
                  defaultValue={router.query.order || ""}
                  onChange={(e) => {
                    const { value } = e.target;
                    if (value === "All") {
                      const { order, ...query } = router.query;
                      router.push({
                        pathname: router.pathname,
                        query,
                      });
                      return;
                    }

                    router.push({
                      pathname: router.pathname,
                      query: {
                        ...router.query,
                        order: value,
                      },
                    });
                  }}
                >
                  <option value="All">none</option>
                  <option value="asc">Asc</option>
                </select>
              </FloatingLabel>
            </Form.Group>

            <div>
              <Limit
                limit={limit}
                currentPage={currentPage}
                total={total}
                pages={pages}
              />
            </div>
          </div>

          <Table responsive="xl" bordered striped className="shadow">
            <thead className="bg-secondary shadow">
              <tr className="align-middle">
                <th>Business Name</th>
                <th>User Name</th>
                <th>Service Type</th>
                <th>Amount </th>
                <th>Receipt</th>
                <th>Date</th>
                <th>Options</th>
              </tr>
            </thead>
            <tbody style={{ overflowY: "auto" }}>
              {usersCashflows.length > 0 ? (
                usersCashflows.map((user) => (
                  <tr key={user.id} className="align-middle">
                    <td>
                      <Link
                        href={`businesses/show/${user.business.id}`}
                        className="hover-select"
                      >
                        {user.business.name}{" "}
                      </Link>
                    </td>

                    <td>
                      <Link
                        href={`business-users/show/${user.user.id}`}
                        className="hover-select"
                      >
                        {user.user.name}{" "}
                      </Link>
                    </td>

                    <td>{user.service_type}</td>
                    <td>{user.amount}</td>

                    <td>{user.receipt}</td>
                    <td>{toHuman(user.created_at)}</td>
                    <td>
                      <ButtonGroup size="sm">
                        <Link href={`/users-cashflows/show/${user.id}`}>
                          <Button size="sm">
                            <i className="fas fa-eye me-1"></i> View
                          </Button>
                        </Link>
                        <a
                          href={`http://134.209.158.248:1002/completed/${user.reference_id}`}
                          className="btn btn-warning btn-sm"
                          target="_blank"
                        >
                          <i className="fas fa-eye me-1"></i> Reference
                        </a>
                      </ButtonGroup>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center">
                    No data found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
          <Pagination
            pathname={router.pathname}
            currentPage={currentPage}
            pages={pages}
          />
        </>
      )}
    </Main>
  );
}
