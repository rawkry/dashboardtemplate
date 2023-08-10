import {
  ButtonGroup,
  Form,
  Nav,
  Tab,
  Table,
  FloatingLabel,
} from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import Link from "next/link";

import { Button } from "@/ui";
import { callFetch } from "@/helpers/server";
import { Limit, Pagination } from "@/components";
import { Main } from "@/layouts";
import { toHuman } from "@/helpers/clients";

export async function getServerSideProps(context) {
  const { page = 1, limit = 10, service_type = "" } = context.query;
  const [
    status,
    { users_cashflows, currentPage, limit: returnedLimit, pages, total },
  ] = await callFetch(
    `/users-cashflows/${context.params.id}/of-business?limit=${limit}&page=${page}&service_type=${service_type}`,
    "GET"
  );

  if (!users_cashflows) {
    return {
      notFound: true,
    };
  }

  return {
    props: { users_cashflows, currentPage, limit, pages, total },
  };
}

export default function AdminList({
  users_cashflows: businessCashflows,
  currentPage,
  limit,
  pages,
  total,
}) {
  const referenceUrl = process.env.NEXT_PUBLIC_REFERENCE_SERVICE_URL;
  const service = JSON.parse(process.env.NEXT_PUBLIC_SERVICE_TYPES);

  const router = useRouter();

  const {
    formState: { errors },
  } = useForm();

  return (
    <>
      <Main title={`User Cashflows: ${total}`} icon="fa-solid fa-users">
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
                <Button variant="warning">Users Cashflows </Button>
              </Link>
            </div>
            <div>
              <Link href={`/businesses/${router.query.id}/admins`}>
                <Button>Admins</Button>
              </Link>
            </div>
            <div>
              <Link href={`/businesses/${router.query.id}/users`}>
                {" "}
                <Button>Users</Button>
              </Link>
            </div>
          </Nav>
        </Tab.Container>

        <>
          <div className="d-flex justify-content-end gap-4  pt-3">
            <Form.Group controlId="active">
              <FloatingLabel
                controlId="floatingSelect"
                label="Service Type"
                className="mb-3"
              >
                <select
                  className="form-select form-select-sm"
                  defaultValue={
                    router.query.service_type
                      ? router.query.service_type.charAt(0).toUpperCase() +
                        router.query.service_type.slice(1)
                      : "All"
                  }
                  onChange={(e) => {
                    const { value } = e.target;

                    if (value === "All") {
                      const { service_type, ...query } = router.query;
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
                        service_type: value.toLocaleLowerCase(),
                      },
                    });
                  }}
                >
                  <option
                    value="All"
                    style={{
                      width: "100%",
                    }}
                  >
                    All service
                  </option>
                  {service.map((item, index) => (
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
                <th>Business Name</th>
                <th>Service Type</th>
                <th>Amount </th>
                <th>User</th>
                <th>Receipt</th>
                <th>Date</th>
                <th>Options</th>
              </tr>
            </thead>
            <tbody style={{ overflowY: "auto" }}>
              {businessCashflows.length > 0 ? (
                businessCashflows.map((cashflow) => (
                  <tr key={cashflow.id} className="align-middle">
                    <td>{cashflow.business.name}</td>
                    <td>{cashflow.service_type}</td>
                    <td>{cashflow.amount}</td>
                    <td>{cashflow.user.name}</td>
                    <td>{cashflow.receipt}</td>
                    <td>{toHuman(cashflow.created_at)}</td>
                    <td>
                      <ButtonGroup size="sm">
                        <Button
                          as={Link}
                          href={`/users-cashflows/show/${cashflow.id}`}
                        >
                          <i className="fas fa-eye me-1"></i> View
                        </Button>
                        <a
                          href={`${referenceUrl}/${cashflow.reference_id}`}
                          className="btn btn-warning btn-sm"
                          target="_blank"
                        >
                          <i className="fas fa-eye me-1"></i> Reference
                        </a>
                      </ButtonGroup>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center">
                    No transaction found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
          <Pagination
            pathname={`/users-cashflows/${router.query.id}/of-business`}
            currentPage={currentPage}
            pages={pages}
          />
        </>
      </Main>
    </>
  );
}
