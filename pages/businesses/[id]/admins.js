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
import { useState, useEffect } from "react";
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
  const { limit = 20 } = context.query;
  const [status, { business_admins, currentPage, pages, total }] =
    await callFetch(
      `/businesses/${
        context.params.id
      }/admins?limit=${limit}&${querystring.stringify(context.query)}`,
      "GET"
    );

  if (!business_admins) {
    return {
      notFound: true,
    };
  }

  return {
    props: { business_admins, currentPage, pages, total },
  };
}

export default function AdminList({
  __state,
  business_admins: serverAdmins,
  currentPage,
  pages,
  total,
  limit,
}) {
  const router = useRouter();

  const [admins, setAdmins] = useState(serverAdmins);

  const {
    formState: { errors },
  } = useForm();

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
        setAdmins((prev) =>
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
        setAdmins((prev) =>
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
    setAdmins(serverAdmins);
  }, [serverAdmins]);
  useEffect(() => {
    localStorage.setItem("business_id", router.query.id);
  }, []);
  return (
    <>
      <Main title={`Admins: ${total}`} icon="fa-solid fa-users">
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
                <Button variant="warning">Admins</Button>
              </Link>
            </div>
            <div>
              <Link href={`/businesses/${router.query.id}/users`}>
                <Button>Users</Button>
              </Link>
            </div>
          </Nav>
        </Tab.Container>

        <>
          <div className="pt-4">
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
                  className="w-full"
                  type="search"
                  defaultValue={router.query.email || ""}
                  placeholder="Search by email..."
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
          </div>
          <div className="d-flex justify-content-center  w-100 gap-5">
            <Form.Group controlId="active">
              <FloatingLabel
                controlId="floatingSelect"
                label="Order by"
                className="mb-3"
              >
                <select
                  className="form-select form-select-sm"
                  defaultValue={router.query.orderBy || ""}
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
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
                <th>Options</th>
              </tr>
            </thead>
            <tbody style={{ overflowY: "auto" }}>
              {admins.length > 0 ? (
                admins.map((user) => (
                  <tr key={user.id} className="align-middle">
                    <td>{user.name}</td>
                    <td>{user.email}</td>
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
                        <Button
                          as={Link}
                          href={`/business-admins/show/${user.id}`}
                        >
                          <i className="fas fa-eye me-1"></i> View
                        </Button>
                        <Button
                          variant="success"
                          as={Link}
                          href={`/business-admins/edit/${user.id}`}
                        >
                          <i className="fas fa-pencil me-1"></i> Edit
                        </Button>
                        <Button
                          variant="danger"
                          as={Link}
                          href={`/business-admins/settings/${user.id}`}
                        >
                          <i className="fas fa-gear me-1"></i> Settings
                        </Button>
                      </ButtonGroup>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center">
                    No Admin found
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
