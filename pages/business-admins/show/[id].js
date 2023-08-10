import { Table, Badge, Nav, Tab } from "react-bootstrap";
import { useRouter } from "next/router";
import Link from "next/link";

import { Button } from "@/ui";
import { callFetch } from "@/helpers/server";
import { Main } from "@/layouts";
import { toHuman } from "@/helpers/clients";

export async function getServerSideProps(context) {
  const [status, business_admins] = await callFetch(
    `/business-admins/${context.params.id}`,
    "GET"
  );

  if (status === 404) {
    return {
      notFound: true,
    };
  }

  return {
    props: { business_admins },
  };
}

function BusinessAdminInformation({ business_admins }) {
  return (
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
            <td>{business_admins.name}</td>
          </tr>
          <tr>
            <th>Phone Number</th>
            <td>{business_admins.phone}</td>
          </tr>
          <tr>
            <th>Email</th>
            <td>{business_admins.email}</td>
          </tr>
          <tr>
            <th>Role</th>
            <td>
              {business_admins.is_super_admin === 1 ? (
                <Badge bg="success">Super Admin</Badge>
              ) : (
                <Badge bg="primary">Admin</Badge>
              )}
            </td>
          </tr>
          <tr>
            <th>Business Name</th>
            <td>{business_admins.business.name}</td>
          </tr>
          <tr>
            <th>Added By</th>
            <td>{business_admins.added_by}</td>
          </tr>

          <tr>
            <th>Created Date</th>
            <td>{toHuman(business_admins.created_at)}</td>
          </tr>

          <tr>
            <th>Status</th>
            <td>
              {business_admins.active === 1 ? (
                <span className="badge bg-success">Active</span>
              ) : (
                <span className="badge bg-danger">Inactive</span>
              )}
            </td>
          </tr>
        </tbody>
      </Table>
    </div>
  );
}

export default function Show({ __state, business_admins, admins, users }) {
  const router = useRouter();

  return (
    <Main
      title={`Admin: ${business_admins.name.toUpperCase()} || Detail`}
      icon="fa-solid fa-users"
    >
      <div className="container-fluid pb-3 ">
        <Button
          variant="outline-primary"
          size="md"
          onClick={() => router.back()}
        >
          <i className="fa-solid fa-arrow-left mr-2"></i>Back
        </Button>
      </div>

      <Tab.Container id="left-tabs-example">
        <Nav
          variant="tabs"
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "10rem",
          }}
        >
          <div>
            <Button variant="warning">Admin detail</Button>
          </div>
          <div>
            <Link href={`/business-cashflows/${router.query.id}/by-admin`}>
              <Button>Business Cashflow </Button>
            </Link>
          </div>
        </Nav>
      </Tab.Container>
      <BusinessAdminInformation
        business_admins={business_admins}
        __state={__state}
      />
    </Main>
  );
}
