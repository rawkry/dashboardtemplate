import { ButtonGroup, Form, Nav, Tab, Table } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import debounce from "debounce";
import Link from "next/link";

import { Button } from "@/ui";
import { callFetch } from "@/helpers/server";
import { Main } from "@/layouts";
import { Pagination, Limit } from "@/components";
import { searchRedirect, toHuman } from "@/helpers/clients";

export async function getServerSideProps(context) {
  const { page = 1, limit = 10, remark = "" } = context.query;
  const [
    status,
    { business_cashflows, currentPage, limit: returnedLimit, pages, total },
  ] = await callFetch(
    `/business-cashflows/${context.params.id}/of-business?limit=${limit}&page=${page}&remark=${remark}`,
    "GET"
  );

  if (!business_cashflows) {
    return {
      notFound: true,
    };
  }

  return {
    props: { business_cashflows, currentPage, limit, pages, total },
  };
}

export default function AdminList({
  __state,
  business_cashflows: businessCashflows,
  currentPage,
  limit,
  pages,
  total,
}) {
  const defaultValues = {
    is_super_admin: "All",
    active: "All",
  };
  const router = useRouter();

  const {
    formState: { errors },
  } = useForm({
    defaultValues: defaultValues,
  });

  return (
    <>
      <Main title={`Business Cashfolows: ${total}`} icon="fa-solid fa-users">
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
                <Button variant="warning">Business Cashflows</Button>
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

        <div className="d-flex justify-content-end gap-4  pt-3">
          <Form
            className="d-flex justify-content-end"
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
                defaultValue={router.query.remark || ""}
                placeholder="Search by remark..."
                onChange={debounce(
                  (e) =>
                    searchRedirect(
                      router.pathname,
                      "remark",
                      e.target.value,
                      router
                    ),
                  500
                )}
              />
            </Form.Group>
          </Form>
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
              <th>Business</th>
              <th>Type</th>
              <th>Amount Added</th>
              <th>Amount Deduct</th>
              <th>Date</th>
              <th>Remark</th>
              <th>Options</th>
            </tr>
          </thead>
          <tbody style={{ overflowY: "auto" }}>
            {businessCashflows.length > 0 ? (
              businessCashflows.map((cashflow) => (
                <tr key={cashflow.id} className="align-middle">
                  <td>{cashflow.business.name}</td>
                  <td>{cashflow.type}</td>
                  <td>{cashflow.amount_added}</td>
                  <td>{cashflow.amount_deducted}</td>
                  <td>{toHuman(cashflow.created_at)}</td>
                  <td>{cashflow.remark}</td>
                  <td>
                    <ButtonGroup size="sm">
                      <Button
                        as={Link}
                        href={`/business-cashflows/show/${cashflow.id}`}
                      >
                        <i className="fas fa-eye me-1"></i> View
                      </Button>
                      <Button
                        variant="success"
                        as={Link}
                        href={`/business-cashflows/${cashflow.id}/update-remark`}
                      >
                        <i className="fas fa-edit me-1"></i> Update Remark
                      </Button>
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
          pathname={router.pathname}
          currentPage={currentPage}
          pages={pages}
        />
      </Main>
    </>
  );
}
