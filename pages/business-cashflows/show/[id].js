import { Table } from "react-bootstrap";
import { useRouter } from "next/router";
import Link from "next/link";

import { Button } from "@/ui";
import { callFetch } from "@/helpers/server";
import { Main } from "@/layouts";
import { toHuman } from "@/helpers/clients";

export async function getServerSideProps(context) {
  const [status, businessCashflow] = await callFetch(
    `/business-cashflows/${context.params.id}`,
    "GET"
  );

  if (status === 404) {
    return {
      notFound: true,
    };
  }

  return {
    props: { businessCashflow },
  };
}

function BusinessCashflows({ __state, businessCashflow }) {
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
            <td>{businessCashflow.type}</td>
          </tr>
          <tr>
            <th>Done By</th>
            <td>
              {businessCashflow.done_by === 0
                ? "ZAPP Service Pvt.Ltd(Owner)"
                : `${businessCashflow.admin.name} (${businessCashflow.admin.email})`}
            </td>
          </tr>
          <tr>
            <th>Business Name</th>
            <td>
              <Link href={`/businesses/show/${businessCashflow.business.id}`}>
                {businessCashflow.business.name}
              </Link>
            </td>
          </tr>
          <tr>
            <th>Email</th>
            <td>{businessCashflow.business.email}</td>
          </tr>
          {Object.keys(businessCashflow.user).length !== 0 && (
            <tr>
              <th>User</th>
              <td>{businessCashflow.user.name}</td>
            </tr>
          )}

          {businessCashflow.amount_added > 0 ? (
            <tr>
              <th>Amount Added</th>
              <td>{businessCashflow.amount_added}</td>
            </tr>
          ) : (
            <tr>
              <th>Amount Deducted</th>
              <td>{businessCashflow.amount_deducted}</td>
            </tr>
          )}
          <tr>
            <th>Remark</th>
            <td>{businessCashflow.remark}</td>
          </tr>
          <tr>
            <th>Issue Date</th>
            <td>{toHuman(businessCashflow.created_at)}</td>
          </tr>
        </tbody>
      </Table>
    </div>
  );
}

export default function Show({ __state, businessCashflow }) {
  return (
    <Main
      title={`Business Cashflow: ${businessCashflow.type.toUpperCase()}`}
      icon="fa-solid fa-users"
    >
      <BusinessCashflows
        businessCashflow={businessCashflow}
        __state={__state}
      />
    </Main>
  );
}
