import { ButtonGroup, Form, Table, FloatingLabel } from "react-bootstrap";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import debounce from "debounce";
import Link from "next/link";
import querystring from "querystring";

import { Button } from "@/ui";
import { callFetch } from "@/helpers/server";
import { Limit, Pagination } from "@/components";
import { Main } from "@/layouts";
import { searchRedirect, toHuman } from "@/helpers/clients";

export async function getServerSideProps(context) {
  try {
    const { limit = 20 } = context.query;
    const [
      status,
      { business_cashflows, currentPage, limit: returnedLimit, pages, total },
    ] = await callFetch(
      `/business-cashflows?limit=${limit}&${querystring.stringify(
        context.query
      )}`,
      "GET"
    );
    return {
      props: {
        business_cashflows,
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
  business_cashflows: businessCashflowsFromServer,
  currentPage,
  limit,
  pages,
  total,
  fetched,
  __state,
}) {
  const router = useRouter();

  const [businessesCashflows, setBusinessesCashflows] = useState(
    businessCashflowsFromServer
  );

  useEffect(() => {
    setBusinessesCashflows(businessCashflowsFromServer);
  }, [businessCashflowsFromServer]);

  return (
    <Main title={`Business Cashflows (${total})`} icon="fa-solid fa-businesses">
      {!fetched ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "60vh",
          }}
        >
          <h1>Please check your internet and try again... </h1>
        </div>
      ) : (
        <>
          <div className="d-flex justify-content-end gap-4 align-items-center">
            <Form
              className="d-flex justify-content-end"
              onSubmit={(e) => e.preventDefault()}
            >
              <Form.Group
                className="d-flex gap-2"
                style={{
                  marginBottom: "1rem",
                }}
              >
                <Form.Control
                  type="search"
                  defaultValue={router.query.remark || ""}
                  placeholder="Search by remark..."
                  onChange={debounce(
                    (e) =>
                      searchRedirect(
                        router.pathname,
                        "remark",
                        e.target.value,
                        router
                      ),
                    500
                  )}
                />
              </Form.Group>
            </Form>
            <div className="d-flex gap-2">
              <Form.Group controlId="active">
                <FloatingLabel
                  controlId="floatingSelect"
                  label="Order by"
                  className="mb-3"
                >
                  <select
                    className="form-select form-select-sm"
                    defaultValue={router.query.orderBy}
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
                    <option value="amount_added">Amount Added</option>
                    <option value="amount_deducted">Amount Deducted</option>
                    <option value="done_by">Done by</option>
                    <option value="created_at">Date</option>
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
          </div>
          <Table responsive="xl" bordered striped className="shadow">
            <thead className="bg-secondary shadow">
              <tr className="align-middle">
                <th>Business</th>
                <th>Done By</th>
                <th>Type</th>
                <th>Amount Added</th>
                <th>Amount Deduct</th>
                <th>Date</th>
                <th>Remark</th>
                <th>Options</th>
              </tr>
            </thead>
            <tbody style={{ overflowY: "auto" }}>
              {businessesCashflows.length > 0 ? (
                businessesCashflows.map((user) => (
                  <tr key={user.id} className="align-middle">
                    <td>
                      {" "}
                      <Link
                        href={`businesses/show/${user.business.id}`}
                        className="hover-select"
                      >
                        {user.business.name}
                      </Link>
                    </td>
                    <td>
                      {user.admin.name ? (
                        <Link
                          href={`business-admins/show/${user.admin.id}`}
                          className="hover-select"
                        >
                          {user.admin.name}
                        </Link>
                      ) : (
                        "Zapp : Owner"
                      )}
                    </td>
                    <td>{user.type}</td>
                    <td>{user.amount_added}</td>
                    <td>{user.amount_deducted}</td>
                    <td>{toHuman(user.created_at)}</td>
                    <td>{user.remark}</td>
                    <td>
                      <ButtonGroup size="sm">
                        <Link href={`/business-cashflows/show/${user.id}`}>
                          <Button size="sm">
                            <i className="fas fa-eye me-1"></i> View
                          </Button>
                        </Link>
                        <Link
                          href={`/business-cashflows/${user.id}/update-remark`}
                        >
                          <Button size="sm" variant="success">
                            <i className="fas fa-pencil me-1"></i> Update Remark
                          </Button>
                        </Link>
                      </ButtonGroup>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center">
                    No data found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
          <Pagination
            pathname="/business-cashflows"
            currentPage={currentPage}
            pages={pages}
          />
        </>
      )}
    </Main>
  );
}
