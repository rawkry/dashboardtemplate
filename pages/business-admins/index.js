import { ButtonGroup, Form, Table, FloatingLabel } from "react-bootstrap";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import debounce from "debounce";
import Link from "next/link";
import querystring from "querystring";

import { Button } from "@/ui";
import { callFetch } from "@/helpers/server";
import { Main } from "@/layouts";
import { Limit, Pagination } from "@/components";
import { searchRedirect } from "@/helpers/clients";

const status = JSON.parse(process.env.NEXT_PUBLIC_USER_STATUS);
const roles = JSON.parse(process.env.NEXT_PUBLIC_ROLE);

export async function getServerSideProps(context) {
  try {
    const { limit = 20 } = context.query;
    const [
      status,
      { business_admins, currentPage, limit: returnedLimit, pages, total },
    ] = await callFetch(
      `/business-admins?limit=${limit}&${querystring.stringify(context.query)}`,
      "GET"
    );
    if (!business_admins) {
      return {
        notFound: true,
      };
    }
    return {
      props: {
        business_admins,
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
  business_admins: businessAdminsFromServer,
  currentPage,
  limit,
  pages,
  total,
  fetched,
  __state,
}) {
  const router = useRouter();
  const [businesses, setbusinesses] = useState(businessAdminsFromServer);

  const handleStatusChange = async (active, id) => {
    try {
      __state.loading = true;
      const response = await fetch(
        `/api/v1/business-admins/${id}/update-status`,
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
          `Admin ${data.name} status has be changed to ${
            active === true ? "active" : "inactive"
          }`
        );
        setbusinesses((prev) =>
          prev.map((item) => {
            if (item.id === id) {
              return {
                ...item,
                active: data.active,
              };
            }
            return item;
          })
        );
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      __state.loading = false;
    }
  };
  const handleRoleChange = async (role, id) => {
    try {
      __state.loading = true;
      const response = await fetch(
        `/api/v1/business-admins/${id}/update-role`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            is_super_admin: role === "SuperAdmin" ? true : false,
          }),
        }
      );

      const data = await response.json();

      if (response.status === 200) {
        setbusinesses((prev) =>
          prev.map((item) => {
            if (item.id === id) {
              return {
                ...item,
                is_super_admin: data.is_super_admin,
              };
            }
            return item;
          })
        );

        toast.info(`Admin ${data.name} role has be changed to ${role}`);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      __state.loading = false;
    }
  };

  useEffect(() => {
    setbusinesses(businessAdminsFromServer);
  }, [businessAdminsFromServer]);

  return (
    <Main
      title={`Business Admins (${!fetched ? "" : total})`}
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
            </Form.Group>
          </Form>

          <div className="d-flex justify-content-center  w-100 gap-5">
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

            <Form.Group controlId="active">
              <FloatingLabel
                controlId="floatingSelect"
                label="Role"
                className="mb-3"
              >
                <select
                  className="form-select form-select-sm"
                  defaultValue={
                    router.query.is_super_admin === "yes"
                      ? "SuperAdmin"
                      : router.query.is_super_admin === "no"
                      ? "Admin"
                      : "All"
                  }
                  onChange={(e) => {
                    const { value } = e.target;

                    if (value === "All") {
                      const { is_super_admin, ...query } = router.query;
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
                        is_super_admin: value === "SuperAdmin" ? "yes" : "no",
                      },
                    });
                  }}
                >
                  <option value="All">All roles</option>
                  {roles.map((item, index) => (
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
                total={total}
                pages={pages}
              />
            </div>
          </div>

          <Table responsive="xl" bordered striped className="shadow">
            <thead className="bg-secondary shadow">
              <tr className="align-middle">
                <th>Name</th>
                <th>Email</th>
                <th>Business</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
                <th>Options</th>
              </tr>
            </thead>
            <tbody style={{ overflowY: "auto" }}>
              {businesses.length > 0 ? (
                businesses.map((user) => (
                  <tr key={user.id} className="align-middle">
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <Link
                        href={`businesses/show/${user.business.id}`}
                        className="hover-select"
                      >
                        {user.business.name}{" "}
                      </Link>
                    </td>
                    <td>{user.phone}</td>
                    <td>
                      <Form.Group controlId="active">
                        <FloatingLabel
                          controlId="floatingSelect"
                          className="mb-3"
                        >
                          <select
                            className="form-select form-select-sm"
                            value={
                              user.is_super_admin === 1 ? "SuperAdmin" : "Admin"
                            }
                            onChange={(e) => {
                              handleRoleChange(e.target.value, user.id);
                            }}
                          >
                            {roles.map((item, index) => (
                              <option key={index} style={{ width: "100%" }}>
                                {item}
                              </option>
                            ))}
                          </select>
                        </FloatingLabel>
                      </Form.Group>
                    </td>
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
                                "Are you sure, you want to change the status of this admin?"
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
                        <Link href={`/business-admins/show/${user.id}`}>
                          <Button size="sm">
                            <i className="fas fa-eye me-1"></i> View
                          </Button>
                        </Link>
                        <Link href={`/business-admins/edit/${user.id}`}>
                          <Button size="sm" variant="success">
                            <i className="fas fa-pencil me-1"></i> Edit
                          </Button>
                        </Link>
                        <Link href={`/business-admins/settings/${user.id}`}>
                          <Button variant="danger" size="sm">
                            <i className="fas fa-gear me-1"></i> Settings
                          </Button>
                        </Link>
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
            pathname="/business-admins"
            currentPage={currentPage}
            pages={pages}
          />
        </>
      )}
    </Main>
  );
}
