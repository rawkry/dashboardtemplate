import { Tab, Table, Nav } from "react-bootstrap";
import { useRouter } from "next/router";
import Link from "next/link";

import { Button } from "@/ui";
import { callFetch } from "@/helpers/server";
import { Main } from "@/layouts";
import { toHuman } from "@/helpers/clients";

export async function getServerSideProps(context) {
  const [status, business] = await callFetch(
    `/businesses/${context.params.id}`,
    "GET"
  );
  if (status === 404) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      business,
    },
  };
}

export default function Show({ business }) {
  const router = useRouter();

  return (
    <Main
      title={`Business : ${business.name.toUpperCase()} || Detail`}
      icon="fa-solid fa-users"
    >
      <div className="container-fluid pb-3 ">
        <Button
          variant="outline-primary"
          size="md"
          onClick={() => {
            localStorage.removeItem("business_id");
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
            justifyContent: "space-around",
          }}
        >
          <div>
            <Link href={`/businesses/show/${router.query.id}`}>
              <Button variant="warning">General Info</Button>
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
              <Button>Users</Button>
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
              <td>{business.name}</td>
            </tr>
            <tr>
              <th>Phone Number</th>
              <td
                className={
                  business.phone.split("||")[1] === "change"
                    ? "text-danger"
                    : ""
                }
              >
                {business.phone.split("||")[0]}
              </td>
            </tr>
            <tr>
              <th>Email</th>
              <td
                className={
                  business.email.split("||")[1] === "change"
                    ? "text-danger"
                    : ""
                }
              >
                {business.email.split("||")[0]}
              </td>
            </tr>
            <tr>
              <th>PAN</th>
              <td
                className={
                  business.pan_no.split("||")[1] === "change"
                    ? "text-danger"
                    : ""
                }
              >
                {business.pan_no.split("||")[0]}
              </td>
            </tr>
            <tr>
              <th>PAN Image</th>
              <td>
                {business.pan_image ? (
                  <a
                    href={`/businesses/${business.id}/preview-image/pan`}
                    target="_blank"
                  >
                    <Button size="sm">
                      <i className="fas fa-eye me-1"></i> View
                    </Button>
                  </a>
                ) : (
                  <Link href={`/businesses/upload/${business.id}`}>
                    <i className="fa-solid fa-upload"></i> Upload Documents
                  </Link>
                )}
              </td>
            </tr>
            <tr>
              <th>Address</th>
              <td
                className={
                  business.address.split("||")[1] === "change"
                    ? "text-danger"
                    : ""
                }
              >
                {business.address.split("||")[0]}
              </td>
            </tr>
            <tr>
              <th>Registered Date</th>
              <td
                className={
                  business.registered_date.split("||")[1] === "change"
                    ? "text-danger"
                    : ""
                }
              >
                {business.registered_date.split("||")[1] === "change"
                  ? "Need to change registered date"
                  : toHuman(business.registered_date)}
              </td>
            </tr>
            <tr>
              <th>Company Registration Image</th>
              <td>
                {business.company_registration_image ? (
                  <a
                    href={`/businesses/${business.id}/preview-image/registration`}
                    target="_blank"
                  >
                    <Button size="sm">
                      <i className="fas fa-eye me-1"></i> View
                    </Button>
                  </a>
                ) : (
                  <Link href={`/businesses/upload/${business.id}`}>
                    <i className="fa-solid fa-upload"></i> Upload Documents
                  </Link>
                )}
              </td>
            </tr>
            <tr>
              <th>Current Balance</th>
              <td>RS. {business.balance}</td>
            </tr>
            <tr>
              <th>Is Live</th>
              <td>
                {business.is_live === 1 ? (
                  <span className="badge bg-success ">
                    <i className="fa-solid fa-life-ring me-1"></i>
                    Live
                  </span>
                ) : (
                  <span className="badge bg-warning">Not Yet</span>
                )}
              </td>
            </tr>
            <tr>
              <th>Status</th>
              <td>
                {business.active === 1 ? (
                  <span className="badge bg-success">Active</span>
                ) : (
                  <span className="badge bg-danger">Inactive</span>
                )}
              </td>
            </tr>
          </tbody>
        </Table>
      </div>
    </Main>
  );
}
