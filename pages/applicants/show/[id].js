import { Tab, Table, Nav } from "react-bootstrap";
import { useRouter } from "next/router";
import Link from "next/link";

import { Button } from "@/ui";
import { callFetchApplicants } from "@/helpers/server";
import { Main } from "@/layouts";
import { toHuman } from "@/helpers/clients";

export async function getServerSideProps(context) {
  const [status, applicants] = await callFetchApplicants(
    `/applicants/${context.params.id}`,
    "GET"
  );
  if (status === 404) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      applicants,
    },
  };
}

export default function Show({ applicants }) {
  const router = useRouter();

  return (
    <Main
      title={`Applicant: ${applicants.name.toUpperCase()} || Detail`}
      icon="fa-solid fa-users"
    >
      <div className="container-fluid pb-3 ">
        <Button
          variant="outline-primary"
          size="md"
          onClick={() => router.push("/applicants")}
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
            <Link href={`/applicants/show/${router.query.id}`}>
              <Button variant="warning">Detail Info</Button>
            </Link>
          </div>
          <div>
            <Link href={`/applicants/${applicants.phone}/of-user`}>
              <Button>User Application</Button>
            </Link>
          </div>
        </Nav>
      </Tab.Container>
      <div className="pt-3">
        <Table
          responsive="xl"
          bordered
          striped
          className="shadow"
          style={{ marginBottom: "3rem" }}
        >
          <tbody>
            <tr>
              <th>Name</th>
              <td>{applicants.name}</td>
            </tr>
            <tr>
              <th>Business Name</th>
              <td>{applicants.business_name}</td>
            </tr>
            <tr>
              <th>Phone Number</th>
              <td>{applicants.phone}</td>
            </tr>
            <tr>
              <th>Business Email</th>
              <td>{applicants.business_email}</td>
            </tr>
            <tr>
              <th>Approved</th>
              <td>
                {applicants.approved === 1 ? (
                  <span className="badge bg-success">Yes</span>
                ) : (
                  <span className="badge bg-danger">No</span>
                )}
              </td>
            </tr>
            <tr>
              <th>Enrolled</th>
              <td>
                {applicants.enrolled === 1 ? (
                  <span className="badge bg-success">Yes</span>
                ) : (
                  <span className="badge bg-danger">No</span>
                )}
              </td>
            </tr>
            <tr>
              <th>Requested Date</th>
              <td>{toHuman(applicants.created_at)}</td>
            </tr>
            <tr>
              <th>Updated Date</th>
              <td>{toHuman(applicants.updated_at)}</td>
            </tr>

            <tr>
              <th>Remark</th>
              <td>{applicants.remarks}</td>
            </tr>
          </tbody>
        </Table>
      </div>
    </Main>
  );
}
