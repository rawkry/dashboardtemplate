import Link from "next/link";
import {
  Accordion,
  Card,
  ListGroup,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { useAccordionButton } from "react-bootstrap/AccordionButton";
import { useRouter } from "next/router";
import { useState } from "react";

import styles from "./SideNavMenus.module.css";

const links = {
  "System Users": ["fa-solid fa-terminal", "/system_users"],
  Users: ["fa-solid fa-users", "/users"],
  Operations: ["fa-solid fa-stethoscope", "/operations"],
  Sales: ["fa-solid fa-scale-unbalanced-flip", "/sales"],
  Finance: ["fa-solid fa-coins", "/finance"],
  Trends: ["fa-solid fa-chart-simple", "/trends"],
};

function CustomToggle({ children, eventKey, index }) {
  const [opened, setOpened] = useState(true);
  const decoratedOnClick = useAccordionButton(eventKey, (e) =>
    setOpened(!opened)
  );

  return (
    <div className="d-grid">
      <button
        type="button"
        className="d-block p-0 border-0"
        onClick={decoratedOnClick}
      >
        <div
          className={`d-flex text-start justify-content-start align-items-center p-0 bg-zapp-gradient${
            index % 2 === 0 ? "-alt" : ""
          } text-white rounded-0 border border-1 border-zapp`}
        >
          {children}
          <i
            className={`fa-solid fa-chevron-${opened ? "down" : "right"} me-3`}
          ></i>
        </div>
      </button>
    </div>
  );
}

function IconWithToolTip({ icon, title }) {
  return (
    <OverlayTrigger
      placement="right"
      delay={{ show: 250, hide: 400 }}
      overlay={
        <Tooltip id={title}>
          <strong className="font-zapp-bold text-zapp text-lowercase">
            {title}
          </strong>
        </Tooltip>
      }
    >
      <div
        className={`d-flex justify-content-center align-items-center ${styles.iconHolder}`}
      >
        <i className={icon}></i>
      </div>
    </OverlayTrigger>
  );
}

export default function SideNavMenus({ open, routes = [] }) {
  const { asPath } = useRouter();
  const pathname = asPath.split("?")[0];
  return (
    <div style={{ width: "280px" }}>
      {routes.map((route, routeIndex) => (
        <div key={routeIndex}>
          {route.spacer && route.spacer === "top" ? (
            <div className="mb-2 border-bottom border-zapp-alt" />
          ) : null}

          {route.type === "singular" ? (
            <ListGroup variant="flush" className="rounded-0 my-2 me-2 shadow">
              <ListGroup.Item
                className={`d-flex justify-content-start align-items-center p-0 border border-1 border-zapp ${
                  pathname === route.url ? "text-zapp" : null
                }`}
                action
                active={pathname === route.url}
                variant="primary"
                as={Link}
                href={route.url}
              >
                <IconWithToolTip title={route.title} icon={route.icon} />
                <div className="flex-grow-1 font-zapp-bold px-3 ">
                  {route.title}
                </div>
              </ListGroup.Item>
            </ListGroup>
          ) : (
            <Accordion defaultActiveKey="0">
              <Card className={`my-2 me-2 shadow`}>
                <Card.Header className="p-0">
                  <CustomToggle eventKey="0" index={routeIndex}>
                    <IconWithToolTip title={route.title} icon={route.icon} />
                    <div
                      className="flex-grow-1 px-3 font-zapp-extrabold letter-spacing-1 "
                      style={{ letterSpacing: "1px" }}
                    >
                      {route.title}
                    </div>
                  </CustomToggle>
                </Card.Header>
                <Accordion.Collapse eventKey="0">
                  <ListGroup variant="flush" className="rounded-0">
                    {route.links.map((link, linkIndex) => (
                      <ListGroup.Item
                        className={`d-flex justify-content-start align-items-center p-0 border border-1 border-zapp ${
                          pathname === link.url ? "text-zapp" : null
                        }`}
                        key={linkIndex}
                        active={pathname === link.url}
                        action
                        variant="primary"
                        href={link.url}
                        as={Link}
                      >
                        <IconWithToolTip
                          title={`${route.title} / ${link.title}`}
                          icon={link.icon}
                        />
                        <div className="flex-grow-1 font-zapp-extrabold px-3 text-lowercase">
                          {link.title}
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </Accordion.Collapse>
              </Card>
            </Accordion>
          )}
          {route.spacer && route.spacer === "bottom" ? (
            <div className="mb-2 border-bottom border-zapp-alt" />
          ) : null}
        </div>
      ))}
    </div>
  );
}
