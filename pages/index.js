import { Row } from "react-bootstrap";

import { Main } from "@/layouts";
import Chart from "@/resuable/chart";

const { url_one, url_two, headers } = JSON.parse(
  process.env.NEXT_PUBLIC_BUSINESS_INTERNAL_BASE_SERVICE
);

export async function getServerSideProps(context) {
  const response = Promise.all([
    fetch(`${url_one}/businesses?active=yes`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    }).then((res) => res.json()),
    fetch(`${url_one}/businesses?active=no`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    }).then((res) => res.json()),
    fetch(`${url_one}/business-admins`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    }).then((res) => res.json()),
    fetch(`${url_one}/business-users`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    }).then((res) => res.json()),
    fetch(`${url_two}/applicants`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    }).then((res) => res.json()),
  ]);
  const [Activebusinesses, InActiveBusiness, admins, users, applicants] =
    await response;
  return {
    props: {
      Activebusinesses,
      InActiveBusiness,
      applicants,
      users,
      admins,
    },
  };
}

export default function Index({
  Activebusinesses,
  InActiveBusiness,
  applicants,
  users,
  admins,
}) {
  return (
    <Main icon="fas fa-columns" title="Dashboard">
      <div className="mt-3">
        <Row>
          <Chart
            Activebusinesses={Activebusinesses.total}
            InActiveBusiness={InActiveBusiness.total}
            applicants={applicants.total}
            users={users.total}
            admins={admins.total}
          />
        </Row>
      </div>
    </Main>
  );
}
