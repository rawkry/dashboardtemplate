import { ButtonGroup, FloatingLabel, Form, Table } from "react-bootstrap";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import debounce from "debounce";
import Link from "next/link";

import { Button } from "@/ui";
import { callFetchApplicants } from "@/helpers/server";
import { Main } from "@/layouts";
import { Pagination } from "@/components";
import { searchRedirect, toHuman } from "@/helpers/clients";
import {
  generateFakeEmail,
  generateFakeNumber,
  generateFakePan,
} from "@/helpers/clients/fakeDataGenerator";

export async function getServerSideProps(context) {
  const {
    page = 1,
    limit = 10,
    name = "",
    business_email = "",
    business_name = "",
    phone = "",
    approved = "",
  } = context.query;

  const [
    status,
    { applicants, currentPage, limit: returnedLimit, pages, total },
  ] = await callFetchApplicants(
    `/applicants/${context.params.id}/of-user?approved=${approved}&business_email=${business_email}&business_name=${business_name}&name=${name}&page=${page}&phone=${phone}&limit=${limit}`,
    "GET"
  );

  if (!applicants) {
    return {
      notFound: true,
    };
  }

  return {
    props: { applicants, currentPage, limit, pages, total },
  };
}

export default function AdminList({
  __state,
  applicants: serverApplicants,
  currentPage,
  pages,
}) {
  const router = useRouter();

  const [applicants, setApplicants] = useState(serverApplicants);

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
        if (data.enrolled === 1) {
          try {
            const fakeBusinessData = {
              name: `${data.business_name}`,
              email: `${generateFakeEmail(data.business_email)}`,
              phone: ` ${generateFakeNumber()} (change)`,
              address: "lalitpur (change)",
              registered_date: `${data.created_at} (change)`,
              active: true,
              pan_no: `${generateFakePan()} (change)`,
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
                if (response.status !== 200) {
                  toast.error(json.message);
                }
              } catch (e) {
                toast.error(e.message);
              }
            } else {
              toast.error(
                `Can not create the business account for ${data.business_name} because ${business.message}`
              );
            }
          } catch (e) {
            toast.error(e.message);
          }
        }
        toast.success(
          `Applicant for ${data.business_name} business is ${
            active ? ofstatus : "un" + ofstatus
          }`
        );
        setApplicants((prev) =>
          prev.map((applicant) =>
            applicant.id === data.id ? { ...applicant, ...data } : applicant
          )
        );
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
    setApplicants(serverApplicants);
  }, [serverApplicants]);

  return (
    <Main
      title={`Applicant: ${
        applicants.length > 0 ? applicants[0].name : ""
      } || List`}
      icon="fa-solid fa-users"
    >
      <div className="container-fluid pb-3">
        <Button
          variant="outline-primary"
          size="md"
          onClick={() => router.back()}
        >
          <i className="fa-solid fa-arrow-left mr-2"></i>Back
        </Button>
      </div>

      <div className="d-flex justify-content-end gap-4 ">
        <div className="d-flex gap-5">
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

          <Form onSubmit={(e) => e.preventDefault()}>
            <Form.Group
              className="d-flex gap-2"
              style={{
                marginBottom: "1rem",
              }}
            >
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
            </Form.Group>
          </Form>
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
                      disabled={applicant.enrolled === 1 ? true : false}
                      className="text-success"
                      type="switch"
                      placeholder="Enter active"
                      onChange={(e) => {
                        handleStatusChange(
                          e.target.checked,
                          applicant.id,
                          "change-approved"
                        );
                      }}
                      {...(applicant.approved === 1 && {
                        defaultChecked: true,
                      })}
                    />
                  </Form.Group>
                </td>
                <td>
                  <Form.Group className="mb-3" controlId="Address">
                    <Form.Check
                      className="text-success"
                      type="switch"
                      disabled={applicant.approved === 0 ? true : false}
                      placeholder="Enter active"
                      defaultChecked={applicant.enrolled === 1 ? true : false}
                      onChange={(e) => {
                        handleStatusChange(
                          e.target.checked,
                          applicant.id,
                          "change-enrolled"
                        );
                      }}
                    />
                  </Form.Group>
                </td>
                <td>{toHuman(applicant.created_at)}</td>
                <td>
                  <ButtonGroup size="sm">
                    <Button as={Link} href={`/applicants/show/${applicant.id}`}>
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
                No application found from this user
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
    </Main>
  );
}
