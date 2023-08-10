import { callFetch } from "@/helpers/server";
import { Table } from "react-bootstrap";
import { useRouter } from "next/router";
import Link from "next/link";

import { Button } from "@/ui";
import { Main } from "@/layouts";
import { toHuman } from "@/helpers/clients";

export async function getServerSideProps(context) {
  const [status, usersCashflow] = await callFetch(
    `/users-cashflows/${context.params.id}`,
    "GET"
  );

  if (status === 404) {
    return {
      notFound: true,
    };
  }

  return {
    props: { usersCashflow },
  };
}

function UserCashflows({ usersCashflow }) {
  const router = useRouter();
  return (
    <div>
      <div className="container-fluid pb-3 ">
        <Button
          variant="outline-primary"
          size="md"
          onClick={() => router.back()}
        >
          <i className="fa-solid fa-arrow-left mr-2"></i>Back
        </Button>
      </div>

      <Table
        responsive="xl"
        bordered
        striped
        className="shadow"
        style={{ marginBottom: "3rem" }}
      >
        <tbody>
          <tr>
            <th>Type</th>
            <td>{usersCashflow.service_type}</td>
          </tr>
          <tr>
            <th>User</th>
            <td>
              <Link href={`/users-cashflows/${usersCashflow.user.id}/of-user`}>
                {" "}
                {usersCashflow.user.name}
              </Link>
            </td>
          </tr>
          <tr>
            <th>Business Name</th>

            <td>
              {" "}
              <Link href={`/businesses/show/${usersCashflow.business.id}`}>
                {usersCashflow.business.name}
              </Link>
            </td>
          </tr>

          <tr>
            <th>Amount</th>
            <td>{usersCashflow.amount}</td>
          </tr>
          <tr>
            <th>Receipt</th>
            <td>{usersCashflow.receipt}</td>
          </tr>
          <tr>
            <th>Refrence</th>
            <td>
              <a
                href={`http://134.209.158.248:1002/completed/${usersCashflow.reference_id}`}
                className="btn btn-warning btn-sm"
                target="_blank"
              >
                <i className="fas fa-eye me-1"></i> view
              </a>
            </td>
          </tr>
          <tr>
            <th>Issue Date</th>
            <td>{toHuman(usersCashflow.created_at)}</td>
          </tr>
        </tbody>
      </Table>
    </div>
  );
}

export default function Show({ __state, usersCashflow }) {
  return (
    <Main
      title={`User Cashflow: ${usersCashflow.user.name.toUpperCase()} || ${
        usersCashflow.service_type
      }`}
      icon="fa-solid fa-users"
    >
      <UserCashflows usersCashflow={usersCashflow} __state={__state} />
    </Main>
  );
}
