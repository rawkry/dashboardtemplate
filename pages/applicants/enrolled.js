import { ButtonGroup, Form, Table, Nav, Tab } from "react-bootstrap";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import debounce from "debounce";
import Link from "next/link";
import querystring from "querystring";

import { Button } from "@/ui";
import { callFetchApplicants } from "@/helpers/server";
import { Main } from "@/layouts";
import { Pagination } from "@/components";
import { searchRedirect, toHuman } from "@/helpers/clients";

export async function getServerSideProps(context) {
  const { limit = 20 } = context.query;
  const [
    status,
    { applicants, currentPage, limit: returnedLimit, pages, total },
  ] = await callFetchApplicants(
    `/applicants/enrolled?limit=${limit}&${querystring.stringify(
      context.query
    )}`,
    "GET"
  );
  return {
    props: {
      applicants,
      currentPage,
      limit: returnedLimit,
      pages,
      total,
    },
  };
}

export default function Index({
  applicants: applicantsFromServer,
  currentPage,
  limit,
  pages,
  total,
  __state,
}) {
  const router = useRouter();

  const [applicants, setapplicants] = useState(applicantsFromServer);

  useEffect(() => {
    setapplicants(applicantsFromServer);
  }, [applicantsFromServer]);

  return (
    <Main
      title={`Applicants || Enrolled (${total})`}
      icon="fa-solid fa-businesses"
    >
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
              <Button>List</Button>
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
              <Button variant="warning">Enrolled</Button>
            </Link>
          </div>
        </Nav>
      </Tab.Container>

      <div className="d-flex justify-content-end gap-4 align-items-center pt-4">
        <Form
          className="d-flex justify-content-end gap-4"
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
              defaultValue={router.query.name || ""}
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
      <Table responsive="xl" bordered striped className="shadow">
        <thead className="bg-secondary shadow">
          <tr className="align-middle">
            <th>Name</th>
            <th>Phone</th>
            <th>Business Name</th>
            <th>Business Email</th>
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
                      className="text-success"
                      type="switch"
                      disabled={true}
                      placeholder="Enter active"
                      defaultChecked={applicant.enrolled === 1 ? true : false}
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
    </Main>
  );
}
