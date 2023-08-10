import {
  ButtonGroup,
  FloatingLabel,
  Form,
  Nav,
  Tab,
  Table,
} from "react-bootstrap";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import debounce from "debounce";
import Link from "next/link";
import querystring from "querystring";

import { Button } from "@/ui";
import { callFetch } from "@/helpers/server";
import { Main } from "@/layouts";
import { Limit, Pagination } from "@/components";
import { searchRedirect } from "@/helpers/clients";

const status = JSON.parse(process.env.NEXT_PUBLIC_USER_STATUS);
const gender = JSON.parse(process.env.NEXT_PUBLIC_USER_GENDER);

export async function getServerSideProps(context) {
  const { limit = 20 } = context.query;
  const [
    status,
    { business_users, currentPage, limit: returnedLimit, pages, total },
  ] = await callFetch(
    `/businesses/${
      context.params.id
    }/users?limit=${limit}&${querystring.stringify(context.query)}`,
    "GET"
  );

  if (!business_users) {
    return {
      notFound: true,
    };
  }

  return {
    props: { business_users, currentPage, pages, total },
  };
}

export default function AdminList({
  __state,
  business_users,
  currentPage,
  pages,
  limit,
  total,
}) {
  const router = useRouter();
  const [users, setUsers] = useState(business_users);
  const [balanceOperator, setBalanceOperator] = useState(
    router.query.balance ? `${router.query.balance.split("_")[0] + "_"}` : "eq_"
  );
  const [selectedValue, setSelectedValue] = useState(
    router.query.balance ? router.query.balance.split("_")[1] : null
  );

  const defaultValues = {
    is_super_admin: "All",
    active: "All",
  };
  const {
    formState: { errors },
  } = useForm({
    defaultValues: defaultValues,
  });

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

      const response = await fetch(
        `/api/v1/business-users/${id}/update-status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ active: active }),
        }
      );

      const data = await response.json();

      if (response.status === 200) {
        toast.info(
          `User ${data.name} status has be changed to ${
            active === true ? "active" : "inactive"
          }`
        );
        setUsers((prev) =>
          prev.map((user) => {
            if (user.id === id) {
              user.active = active;
            }
            return user;
          })
        );
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      __state.loading = false;
    }
  };

  useEffect(() => {
    localStorage.setItem("business_id", router.query.id);
  }, []);

  return (
    <>
      <Main title={`Users: ${total}`} icon="fa-solid fa-users">
        <div className="container-fluid pb-3 ">
          <Button
            variant="outline-primary"
            size="md"
            onClick={() => {
              localStorage.removeItem("business_id");
              router.push("/businesses");
            }}
          >
            <i className="fa-solid fa-arrow-left mr-2"></i>Back
          </Button>
        </div>

        <Tab.Container id="left-tabs-example">
          <Nav
            variant="tabs"
            style={{
              display: "flex",
              justifyContent: "space-around",
            }}
          >
            <div>
              <Link href={`/businesses/show/${router.query.id}`}>
                <Button>General Info</Button>
              </Link>
            </div>
            <div>
              <Link href={`/business-cashflows/${router.query.id}/of-business`}>
                <Button>Business Cashflows </Button>
              </Link>
            </div>
            <div>
              <Link href={`/users-cashflows/${router.query.id}/of-business`}>
                <Button>Users Cashflows </Button>
              </Link>
            </div>
            <div>
              <Link href={`/businesses/${router.query.id}/admins`}>
                <Button>Admins</Button>
              </Link>
            </div>
            <div>
              <Link href={`/businesses/${router.query.id}/users`}>
                {" "}
                <Button variant="warning">Users</Button>
              </Link>
            </div>
          </Nav>
        </Tab.Container>

        <>
          <div className="pt-4">
            <Form
              className="d-flex justify-content-end"
              onSubmit={(e) => e.preventDefault()}
            >
              <Form.Group
                className="d-flex align-items-center w-100 gap-5"
                style={{
                  marginBottom: "1rem",
                }}
              >
                <Form.Control
                  type="search"
                  defaultValue={router.query.name || ""}
                  placeholder="Search by name..."
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
                  defaultValue={router.query.phone || ""}
                  placeholder="Search by phone..."
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
          </div>
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
                  <option value="eq_0">Equal to</option>
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
                label="Gender"
                className="mb-3"
              >
                <select
                  className="form-select form-select-sm"
                  defaultValue={router.query.gender || "All"}
                  onChange={(e) => {
                    const { value } = e.target;

                    if (value === "All") {
                      const { gender, ...query } = router.query;
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
                        gender: value,
                      },
                    });
                  }}
                >
                  <option value="All">All gender</option>
                  {gender.map((item, index) => (
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
                  <option
                    value="All"
                    style={{
                      width: "100%",
                    }}
                  >
                    All status
                  </option>
                  {status.map((item, index) => (
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
                <th>Phone</th>
                <th>Gender</th>
                <th>Balance</th>
                <th>Status</th>
                <th>Options</th>
              </tr>
            </thead>
            <tbody style={{ overflowY: "auto" }}>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id} className="align-middle">
                    <td>{user.name}</td>

                    <td>{user.phone}</td>
                    <td>{user.gender}</td>
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
                                "Are you sure, you want to change the status of this user?"
                              )
                            ) {
                              handleStatusChange(e.target.checked, user.id);
                            }
                          }}
                        />
                      </Form.Group>
                    </td>
                    <td>
                      <ButtonGroup size="sm">
                        <Button
                          as={Link}
                          href={`/business-users/show/${user.id}`}
                        >
                          <i className="fas fa-eye me-1"></i> View
                        </Button>
                        <Button
                          variant="success"
                          as={Link}
                          href={`/business-users/edit/${user.id}`}
                        >
                          <i className="fas fa-pencil me-1"></i> Edit
                        </Button>
                        <Button
                          variant="warning"
                          as={Link}
                          href={`/business-users/balance/${user.id}`}
                        >
                          <i className="fas fa-coins me-1"></i> Balance
                        </Button>
                      </ButtonGroup>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center">
                    No employee found
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
      </Main>
    </>
  );
}
