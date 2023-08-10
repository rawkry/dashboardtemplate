import { ButtonGroup, Form, Nav, Tab, Table } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import debounce from "debounce";
import Link from "next/link";

import { Button } from "@/ui";
import { callFetch } from "@/helpers/server";
import { Main } from "@/layouts";
import { Limit, Pagination } from "@/components";
import { searchRedirect } from "@/helpers/clients";

export async function getServerSideProps(context) {
  const { page = 1, limit = 10 } = context.query;
  const [
    status,
    { business_cashflows, currentPage, limit: returnedLimit, pages, total },
  ] = await callFetch(
    `/business-cashflows/${context.params.id}/by-admin?limit=${limit}&page=${page}`,
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

export default function AdminCashflows({
  __state,
  business_cashflows: businessCashflows,
  currentPage,
  limit,
  pages,
  total,
}) {
  const router = useRouter();

  const defaultValues = {
    is_super_admin: "All",
    active: "All",
  };

  const {
    formState: { errors },
  } = useForm({
    defaultValues: defaultValues,
  });

  return (
    <>
      <Main title={`Business Cashflows: ${total}`} icon="fa-solid fa-users">
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
              <Link href={`/business-admins/show/${router.query.id}`}>
                <Button>Admin detail</Button>
              </Link>
            </div>
            <div>
              <Button variant="warning">Business Cashflows </Button>
            </div>
          </Nav>
        </Tab.Container>

        <>
          <div className="d-flex justify-content-end gap-4 align-items-center pt-3">
            <Limit
              limit={limit}
              total={total}
              pages={pages}
              currentPage={currentPage}
            />
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
          </div>

          <Table responsive="xl" bordered striped className="shadow">
            <thead className="bg-secondary shadow">
              <tr className="align-middle">
                <th>Business</th>
                <th>Type</th>
                <th>Amount Added</th>
                <th>Amount Deduct</th>
                <th>Remark</th>
                <th>Options</th>
              </tr>
            </thead>
            <tbody style={{ overflowY: "auto" }}>
              {businessCashflows.length > 0 ? (
                businessCashflows.map((cashflow) => (
                  <tr key={cashflow.id} className="align-middle">
                    <td>{cashflow.business_id}</td>
                    <td>{cashflow.type}</td>
                    <td>{cashflow.amount_added}</td>
                    <td>{cashflow.amount_deducted}</td>
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
        </>
      </Main>
    </>
  );
}
