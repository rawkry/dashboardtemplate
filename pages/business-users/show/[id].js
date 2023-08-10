import { Nav, Tab, Table } from "react-bootstrap";
import { useRouter } from "next/router";
import Link from "next/link";

import { Button } from "@/ui";
import { callFetch } from "@/helpers/server";
import { Main } from "@/layouts";
import { toHuman } from "@/helpers/clients";

export async function getServerSideProps(context) {
  const [status, business_user] = await callFetch(
    `/business-users/${context.params.id}`,
    "GET"
  );

  if (status === 404) {
    return {
      notFound: true,
    };
  }
  return {
    props: { business_user },
  };
}

function BusinessUserInformation({ business_user }) {
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
            <td>{business_user.name}</td>
          </tr>
          <tr>
            <th>Phone Number</th>
            <td>{business_user.phone}</td>
          </tr>
          <tr>
            <th>Gender</th>
            <td>{business_user.gender}</td>
          </tr>

          <tr>
            <th>Business Name</th>
            <td>
              <Link
                href={`/businesses/show/${business_user.business.id}`}
                className="hover-select"
              >
                {business_user.business.name}{" "}
              </Link>
            </td>
          </tr>
          <tr>
            <th>Added By</th>
            <td>
              {business_user.added_by === 0 ? "Zapp admin" : "Business admin"}
            </td>
          </tr>
          <tr>
            <th>Current Balance</th>
            <td>Rs.{business_user.balance}</td>
          </tr>

          <tr>
            <th>Created Date</th>
            <td>{toHuman(business_user.created_at)}</td>
          </tr>

          <tr>
            <th>Status</th>
            <td>
              {business_user.active === 1 ? (
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

export default function Show({ __state, business_user }) {
  const router = useRouter();

  return (
    <Main
      title={` User: ${business_user.name.toUpperCase()} || Detail`}
      icon="fa-solid fa-users"
    >
      <div className="container-fluid pb-3 ">
        <Button
          variant="outline-primary"
          size="md"
          onClick={() => {
            router.back();
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
            justifyContent: "center",
            gap: "10rem",
          }}
        >
          <div>
            <Button variant="warning">User detail</Button>
          </div>
          <div>
            <Link href={`/users-cashflows/${router.query.id}/of-user`}>
              <Button>User Cashflows </Button>
            </Link>
          </div>
          <div>
            <Link href={`/business-cashflows/${router.query.id}/of-user`}>
              <Button>Business Cashflows </Button>
            </Link>
          </div>
        </Nav>
      </Tab.Container>
      <BusinessUserInformation
        business_user={business_user}
        __state={__state}
      />
    </Main>
  );
}
