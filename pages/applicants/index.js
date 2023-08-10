import {
  ButtonGroup,
  Form,
  Table,
  FloatingLabel,
  Tab,
  Nav,
} from "react-bootstrap";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import debounce from "debounce";
import Link from "next/link";
import querystring from "querystring";

import { Button } from "@/ui";
import { callFetchApplicants } from "@/helpers/server";
import { Main } from "@/layouts";
import { Limit, Pagination } from "@/components";
import {
  generateFakeEmail,
  generateFakeNumber,
  generateFakePan,
  searchRedirect,
  toHuman,
} from "@/helpers/clients";

export async function getServerSideProps(context) {
  try {
    const { limit = 20 } = context.query;
    const [
      status,
      { applicants, currentPage, limit: returnedLimit, pages, total },
    ] = await callFetchApplicants(
      `/applicants?limit=${limit}&${querystring.stringify(context.query)}`,
      "GET"
    );
    return {
      props: {
        applicants,
        currentPage,
        limit: returnedLimit,
        pages,
        fetched: true,
        total,
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
  applicants: applicantsFromServer,
  currentPage,
  limit,
  pages,
  total,
  fetched,
  __state,
}) {
  const router = useRouter();

  const [applicants, setapplicants] = useState(applicantsFromServer);

  const handleStatusChange = async (active, id, of) => {
    try {
      __state.loading = true;
      const ofstatus = of.split("-")[1];
      const obj = {};
      obj[ofstatus] = active;

      const response = await fetch(`/api/v1-baa/applicants/${id}/${of}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(obj),
      });
      const data = await response.json();

      if (response.status === 200) {
        setapplicants((prev) =>
          prev.map((applicant) =>
            applicant.id === data.id ? { ...applicant, ...data } : applicant
          )
        );
        if (data.enrolled === 1) {
          try {
            const fakeBusinessData = {
              name: `${data.business_name}`,
              email: `${generateFakeEmail(data.business_name)}||change`,
              phone: ` ${generateFakeNumber()}||change`,
              address: "lalitpur||change",
              registered_date: `${data.created_at}||change`,
              active: true,
              pan_no: `${generateFakePan()}||change`,
            };
            const response = await fetch(`/api/v1/businesses`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(fakeBusinessData),
            });

            const business = await response.json();
            if (response.status === 200) {
              try {
                const fakeAdminData = {
                  name: data.name,
                  email: data.business_email,
                  phone: data.phone,
                  active: true,
                  is_super_admin: true,
                  business_id: business.id,
                };
                const response = await fetch(`/api/v1/business-admins`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(fakeAdminData),
                });

                const json = await response.json();

                if (response.status === 200) {
                  router.push(`/businesses/show/${json.business_id}`);
                  toast.success(
                    `Business account created for ${data.business_name}.`
                  );
                } else {
                  toast.error(
                    `Can not create the business account for ${data.business_name} because ${json.message}.`
                  );
                }
              } catch (e) {
                toast.error(e.message);
              }
            } else {
              toast.error(
                `Can not create the business account for ${data.business_name} because ${business.message}.`
              );
            }
          } catch (e) {
            toast.error(e.message);
          }
        } else {
          toast.info(
            `Applicant for business ${data.business_name} is ${
              active ? ofstatus : "un" + ofstatus
            }.`
          );
          setapplicants((prev) =>
            prev.map((applicant) =>
              applicant.id === data.id ? { ...applicant, ...data } : applicant
            )
          );
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      __state.loading = false;
    }
  };

  useEffect(() => {
    setapplicants(applicantsFromServer);
  }, [applicantsFromServer]);

  return (
    <Main
      title={`Applicants (${!fetched ? "" : total})`}
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
          <Tab.Container id="left-tabs-example">
            <Nav
              variant="tabs"
              style={{
                display: "flex",
                justifyContent: "space-around",
              }}
            >
              <div>
                <Link href={`/applicants`}>
                  <Button variant="warning">List</Button>
                </Link>
              </div>
              <div>
                <Link href={`/applicants/approved`}>
                  <Button>Approved</Button>
                </Link>
              </div>
              <div>
                <Link href={`/applicants/un-approved`}>
                  <Button>UnApproved </Button>
                </Link>
              </div>

              <div>
                <Link href={`/applicants/enrolled`}>
                  <Button>Enrolled</Button>
                </Link>
              </div>
            </Nav>
          </Tab.Container>

          <div className="  pt-4">
            <Form className="d-flex gap-4" onSubmit={(e) => e.preventDefault()}>
              <Form.Group
                className="d-flex align-items-center w-100 gap-5"
                style={{
                  marginBottom: "1rem",
                }}
              >
                <Form.Control
                  defaultValue={router.query.name || ""}
                  type="search"
                  placeholder="Applicant name..."
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
                  defaultValue={router.query.business_name || ""}
                  placeholder="Business name..."
                  onChange={debounce(
                    (e) =>
                      searchRedirect(
                        router.pathname,
                        "business_name",
                        e.target.value,
                        router
                      ),
                    500
                  )}
                />
                <Form.Control
                  type="search"
                  defaultValue={router.query.business_email || ""}
                  placeholder="Business email..."
                  onChange={debounce(
                    (e) =>
                      searchRedirect(
                        router.pathname,
                        "business_email",
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
                  <option value="business_email">business email</option>
                  <option value="business_name">business name</option>
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
                    router.query.approved === "yes"
                      ? "approved"
                      : router.query.approved === "no"
                      ? "unapproved"
                      : "All"
                  }
                  onChange={(e) => {
                    const { value } = e.target;
                    if (value === "All") {
                      const { approved, ...query } = router.query;
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
                        approved:
                          value === "unapproved"
                            ? "no"
                            : value === "All"
                            ? ""
                            : "yes",
                      },
                    });
                  }}
                >
                  <option value="All">All status</option>
                  <option value="approved">Approved</option>
                  <option value="unapproved">Unapproved</option>
                </select>
              </FloatingLabel>
            </Form.Group>
            <div>
              <Limit limit={limit} />
            </div>
          </div>
          <Table responsive="xl" bordered striped className="shadow">
            <thead className="bg-secondary shadow">
              <tr className="align-middle">
                <th>Name</th>
                <th>Phone</th>
                <th>Business Name</th>
                <th>Business Email</th>
                <th>Approved</th>
                <th>Enrolled</th>
                <th>Requested Date</th>
                <th>Options</th>
              </tr>
            </thead>
            <tbody style={{ overflowY: "auto" }}>
              {applicants.length > 0 ? (
                applicants.map((applicant) => (
                  <tr key={applicant.id} className="align-middle">
                    <td>{applicant.name}</td>

                    <td>{applicant.phone}</td>
                    <td>{applicant.business_name}</td>
                    <td>{applicant.business_email}</td>
                    <td>
                      <Form.Group className="mb-3" controlId="Address">
                        <Form.Check
                          disabled={applicant.enrolled}
                          className="text-success"
                          type="switch"
                          placeholder="Enter active"
                          onChange={(e) => {
                            if (
                              confirm(
                                `Are you sure, you want to change the approve status of this application?`
                              )
                            ) {
                              handleStatusChange(
                                e.target.checked,
                                applicant.id,
                                "change-approved"
                              );
                            }
                          }}
                          checked={applicant.approved}
                        />
                      </Form.Group>
                    </td>
                    <td>
                      <Form.Group className="mb-3" controlId="Address">
                        <Form.Check
                          className="text-success"
                          type="switch"
                          disabled={!applicant.approved}
                          placeholder="Enter active"
                          checked={applicant.enrolled}
                          onChange={(e) => {
                            if (
                              confirm(
                                "Are you sure, you want to change the enrollment status of this application?"
                              )
                            ) {
                              handleStatusChange(
                                e.target.checked,
                                applicant.id,
                                "change-enrolled"
                              );
                            }
                          }}
                        />
                      </Form.Group>
                    </td>
                    <td>{toHuman(applicant.created_at)}</td>
                    <td>
                      <ButtonGroup size="sm">
                        <Button
                          as={Link}
                          href={`/applicants/show/${applicant.id}`}
                        >
                          <i className="fas fa-eye me-1"></i> View
                        </Button>
                        <Button
                          variant="success"
                          as={Link}
                          href={`/applicants/edit/${applicant.id}`}
                        >
                          <i className="fas fa-pencil me-1"></i> Edit
                        </Button>
                        <Button
                          variant="warning"
                          as={Link}
                          href={`/applicants/remarks/${applicant.id}`}
                        >
                          <i className="fas fa-pen-to-square me-1"></i> change
                          remark
                        </Button>
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
            pathname={router.pathname}
            currentPage={currentPage}
            pages={pages}
          />
        </>
      )}
    </Main>
  );
}
