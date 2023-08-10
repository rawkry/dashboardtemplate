import { ButtonGroup, Form, Table, FloatingLabel } from "react-bootstrap";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import debounce from "debounce";
import Link from "next/link";
import querystring from "querystring";

import { Button } from "@/ui";
import { callFetch } from "@/helpers/server";
import { Limit, Pagination } from "@/components";
import { Main } from "@/layouts";
import { searchRedirect } from "@/helpers/clients";
import { set } from "react-hook-form";

const status = JSON.parse(process.env.NEXT_PUBLIC_USER_STATUS);

export async function getServerSideProps(context) {
  try {
    const { limit = 20 } = context.query;
    const [
      status,
      { businesses, currentPage, limit: returnedLimit, pages, total },
    ] = await callFetch(
      `/businesses?limit=${limit}&${querystring.stringify(context.query)}`,
      "GET"
    );
    return {
      props: {
        businesses,
        currentPage,
        limit: returnedLimit,
        pages,
        total,
        fetched: true,
      },
    };
  } catch (error) {
    return {
      props: {
        fetched: false,
      },
    };
  }
}

export default function Index({
  businesses: businessFromServer,
  currentPage,
  limit,
  pages,
  total,
  fetched,
  __state,
}) {
  const router = useRouter();

  const [balanceOperator, setBalanceOperator] = useState(
    router.query.balance ? `${router.query.balance.split("_")[0] + "_"}` : "eq_"
  );
  const [businesses, setbusinesses] = useState(businessFromServer);
  const [selectedValue, setSelectedValue] = useState(
    router.query.balance ? router.query.balance.split("_")[1] : null
  );

  const handleChangeOperator = (event) => {
    const { value } = event.target;
    setBalanceOperator(value);
    if (selectedValue !== null) {
      router.push({
        pathname: router.pathname,
        query: {
          ...router.query,
          balance: `${value}${selectedValue}`,
        },
      });
    }
  };

  const handleStatusChange = async (active, id) => {
    try {
      __state.loading = true;
      const response = await fetch(`/api/v1/businesses/${id}/update-status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ active: active }),
      });

      const data = await response.json();

      if (response.status === 200) {
        toast.info(
          `Status of ${data.name} updated successfully to ${
            active === true ? "active" : "inactive"
          }`
        );
        setbusinesses((prev) =>
          prev.map((business) =>
            business.id === id ? { ...business, active: data.active } : business
          )
        );
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      __state.loading = false;
    }
  };

  const handleLiveChange = async (live, id) => {
    try {
      __state.loading = true;
      const response = await fetch(`/api/v1/businesses/${id}/update-is-live`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_live: live }),
      });

      const data = await response.json();

      if (response.status === 200) {
        setbusinesses((prev) =>
          prev.map((business) =>
            business.id === id
              ? { ...business, is_live: data.is_live }
              : business
          )
        );
        toast.info(
          `Business ${data.name} is currently ${
            live === true ? "Live" : "Offline"
          }`
        );
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      __state.loading = false;
    }
  };

  useEffect(() => {
    setbusinesses(businessFromServer);
  }, [businessFromServer]);

  return (
    <Main
      title={`Businesses (${!fetched ? "" : total})`}
      icon="fa-solid fa-businesses"
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
          <h1>Please check your internet and try again... </h1>
        </div>
      ) : (
        <>
          <Form onSubmit={(e) => e.preventDefault()}>
            <Form.Group
              className="d-flex align-items-center w-100 gap-5"
              style={{
                marginBottom: "1rem",
              }}
            >
              <Form.Control
                type="search"
                placeholder="Search by name..."
                defaultValue={router.query.name || ""}
                onChange={debounce(
                  (e) =>
                    searchRedirect(
                      router.pathname,
                      "name",
                      e.target.value,
                      router
                    ),
                  500
                )}
              />
              <Form.Control
                type="search"
                placeholder="Search by email..."
                defaultValue={router.query.email || ""}
                onChange={debounce(
                  (e) =>
                    searchRedirect(
                      router.pathname,
                      "email",
                      e.target.value,
                      router
                    ),
                  500
                )}
              />
              <Form.Control
                type="search"
                placeholder="Search by PAN..."
                defaultValue={router.query.pan_no || ""}
                onChange={debounce(
                  (e) =>
                    searchRedirect(
                      router.pathname,
                      "pan_no",
                      e.target.value,
                      router
                    ),
                  500
                )}
              />

              <Form.Control
                type="search"
                placeholder="Search by phone..."
                defaultValue={router.query.phone || ""}
                onChange={debounce(
                  (e) =>
                    searchRedirect(
                      router.pathname,
                      "phone",
                      e.target.value,
                      router
                    ),
                  500
                )}
              />
            </Form.Group>
          </Form>

          <div className="d-flex justify-content-center  w-100 gap-5">
            <Form.Group controlId="balance">
              <FloatingLabel
                controlId="floatingSelect"
                label="Balance"
                className="mb-3"
              >
                <Form.Select
                  value={balanceOperator}
                  onChange={handleChangeOperator}
                >
                  <option value="eq_">Equal to</option>
                  <option value="lt_">Less than</option>
                  <option value="lte_">Less than or equal to</option>
                  <option value="gt_">Greater than</option>
                  <option value="gte_">Greater than or equal to</option>
                </Form.Select>
                {balanceOperator.startsWith("eq_") ? (
                  <Form.Control
                    type="number"
                    defaultValue={selectedValue}
                    onChange={debounce((e) => {
                      setSelectedValue(e.target.value);
                      searchRedirect(
                        router.pathname,
                        "balance",
                        `${balanceOperator + e.target.value} `,
                        router
                      );
                    }, 500)}
                  />
                ) : (
                  <Form.Control
                    type="number"
                    defaultValue={selectedValue}
                    onChange={debounce((e) => {
                      setSelectedValue(e.target.value);
                      searchRedirect(
                        router.pathname,
                        "balance",
                        `${balanceOperator + e.target.value}`,
                        router
                      );
                    }, 500)}
                  />
                )}
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
                  <option value="name">name</option>
                  <option value="email">email</option>
                  <option value="phone">phone</option>
                  <option value="balance">balance</option>
                  <option value="created_at">created_at</option>
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
                  defaultValue={router.query.order || "All"}
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

            <Form.Group controlId="active">
              <FloatingLabel
                controlId="floatingSelect"
                label="Status"
                className="mb-3"
              >
                <select
                  className="form-select form-select-sm"
                  defaultValue={
                    router.query.active === "yes"
                      ? "Active"
                      : router.query.active === "no"
                      ? "Inactive"
                      : "All"
                  }
                  onChange={(e) => {
                    const { value } = e.target;
                    if (value === "All") {
                      const { active, ...query } = router.query;
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
                        active:
                          value === "Inactive"
                            ? "no"
                            : value === "All"
                            ? ""
                            : "yes",
                      },
                    });
                  }}
                >
                  <option value="All">All status</option>
                  {status.map((item, index) => (
                    <option key={index} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </FloatingLabel>
            </Form.Group>
            <div>
              <Limit
                limit={limit}
                currentPage={currentPage}
                pages={pages}
                total={total}
              />
            </div>
          </div>

          <Table responsive="xl" bordered striped className="shadow">
            <thead className="bg-secondary shadow">
              <tr className="align-middle">
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>PAN no.</th>
                <th>Balance</th>
                <th>Status</th>
                <th>Live</th>
                <th>Options</th>
              </tr>
            </thead>
            <tbody style={{ overflowY: "auto" }}>
              {businesses.length > 0 ? (
                businesses.map((user) => (
                  <tr key={user.id} className="align-middle">
                    <td>{user.name}</td>
                    <td
                      className={
                        user.email.split("||")[1] === "change"
                          ? "text-danger"
                          : ""
                      }
                    >
                      {user.email.split("||")[0]}
                    </td>
                    <td
                      className={
                        user.phone.split("||")[1] === "change"
                          ? "text-danger"
                          : ""
                      }
                    >
                      {user.phone.split("||")[0]}
                    </td>
                    <td
                      className={
                        user.pan_no.split("||")[1] === "change"
                          ? "text-danger"
                          : ""
                      }
                    >
                      {user.pan_no.split("||")[0]}
                    </td>
                    <td>{user.balance}</td>
                    <td>
                      <Form.Group className="mb-3" controlId="Address">
                        <Form.Check
                          className="text-success"
                          type="switch"
                          placeholder="Enter active"
                          checked={user.active}
                          onChange={(e) => {
                            if (
                              confirm(
                                "Are you sure, you want to change the status of this business?"
                              )
                            ) {
                              handleStatusChange(e.target.checked, user.id);
                            }
                          }}
                        />
                      </Form.Group>
                    </td>
                    <td>
                      <Form.Group className="mb-3" controlId="Address">
                        <Form.Check
                          className="text-success"
                          disabled={!user.active}
                          type="switch"
                          placeholder="Enter active"
                          checked={user.is_live}
                          onChange={(e) => {
                            if (
                              confirm(
                                "Are you sure, you want to change the Live status of this business?"
                              )
                            ) {
                              handleLiveChange(e.target.checked, user.id);
                            }
                          }}
                        />
                      </Form.Group>
                    </td>
                    <td>
                      <ButtonGroup size="sm">
                        <Link href={`/businesses/show/${user.id}`}>
                          <Button size="sm">
                            <i className="fas fa-eye me-1"></i> View
                          </Button>
                        </Link>
                        <Link href={`/businesses/edit/${user.id}`}>
                          <Button size="sm" variant="success">
                            <i className="fas fa-pencil me-1"></i> Edit
                          </Button>
                        </Link>

                        <Link href={`/businesses/balance/${user.id}/`}>
                          <Button size="sm" variant="warning">
                            <i className="fas fa-coins me-1"></i> Balance
                          </Button>
                        </Link>
                        <Link href={`/businesses/upload/${user.id}/`}>
                          <Button size="sm" variant="error">
                            <i className="fa-solid fa-upload"></i> Upload
                            Documents
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
            pathname="/businesses"
            currentPage={currentPage}
            pages={pages}
          />
        </>
      )}
    </Main>
  );
}
