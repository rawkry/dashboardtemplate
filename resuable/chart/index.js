import { Card, Row, Col } from "react-bootstrap";
import React from "react";
import Link from "next/link";

const Chart = ({
  Activebusinesses,
  InActiveBusiness,
  applicants,
  users,
  admins,
}) => {
  return (
    <Row>
      <Col md={4} className="mb-4">
        <Card className="shadow h-100">
          <Card.Title className="font-zapp-bold text-zapp ellipsis  p-3 m-auto ">
            <Link href="/businesses">
              <i className="fa-solid fa-briefcase"></i> Businesses
            </Link>
          </Card.Title>
          <Card.Body>
            <div className="d-flex flex-column align-items-center">
              <div>
                <h1 className="text-muted">Total</h1>
                <h2>{Activebusinesses + InActiveBusiness} </h2>
              </div>
              <div>
                <h6 className="text-muted">Active</h6>
                <h4>{Activebusinesses}</h4>
              </div>
              <div>
                <h6 className="text-muted">Inactive</h6>
                <h4>{InActiveBusiness}</h4>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
      <Col md={4} className="mb-4">
        <Card className="shadow h-100">
          <Card.Title className="font-zapp-bold text-zapp h2 ellipsis  p-3 m-auto">
            <Link href="/business-admins">
              <i className=" fa-solid fa-users"></i> Admins
            </Link>
          </Card.Title>
          <Card.Body>
            <div className="d-flex flex-column align-items-center">
              <div>
                <h1 className="text-muted">Total</h1>
                <h2>{admins}</h2>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
      <Col md={4} className="mb-4">
        <Card className="shadow h-100">
          <Card.Title className="font-zapp-bold text-zapp h2 ellipsis p-3 m-auto">
            <Link href="/business-users">
              <i className="fa-solid  fa-users"></i> Users
            </Link>
          </Card.Title>
          <Card.Body>
            <div className="d-flex flex-column align-items-center">
              <div>
                <h1 className="text-muted">Total</h1>
                <h2>{users}</h2>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
      <Col md={4} className="mb-4">
        <Card className="shadow h-100">
          <Card.Title className="font-zapp-bold text-zapp h2 ellipsis p-3 m-auto">
            <Link href="/applicants">
              <i className="fa-solid  fa-blender-phone"></i> Applicants
            </Link>
          </Card.Title>
          <Card.Body>
            <div className="d-flex flex-column align-items-center">
              <div>
                <h1 className="text-muted">Total</h1>
                <h2>{applicants}</h2>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default Chart;
