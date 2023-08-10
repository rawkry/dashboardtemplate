import { Else, If, Then } from "react-if";
import { useRouter } from "next/router";
import Link from "next/link";

function getPaginatedValue(c, m) {
  var current = c,
    last = m,
    delta = 2,
    left = current - delta,
    right = current + delta + 1,
    range = [],
    rangeWithDots = [],
    l;

  for (let i = 1; i <= last; i++) {
    if (i == 1 || i == last || (i >= left && i < right)) {
      range.push(i);
    }
  }

  for (let i of range) {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1);
      } else if (i - l !== 1) {
        rangeWithDots.push("...");
      }
    }
    rangeWithDots.push(i);
    l = i;
  }

  return rangeWithDots;
}

function generateLink(pathname, prevParams, params) {
  return { pathname, query: { ...prevParams, ...params } };
}

export default function Pagination({
  pathname: path,
  currentPage,
  pages,
  position = "end",
  limit,
}) {
  const { query } = useRouter();
  const router = useRouter();
  return pages < 2 ? null : (
    <div
      className={`my-3 align-middle d-flex justify-content-${position}
    `}
    >
      <ul className="pagination mb-0">
        <li className={`page-item${currentPage === 1 ? " d-none" : ""}`}>
          <Link
            href={generateLink(path, query, { page: 1 })}
            className="page-link"
          >
            <span>&laquo;</span>
          </Link>
        </li>
        <li className={`page-item${currentPage === 1 ? " d-none" : ""}`}>
          <Link
            href={generateLink(path, query, { page: currentPage - 1 })}
            className="page-link"
          >
            <span>‹</span>
          </Link>
        </li>
        {getPaginatedValue(currentPage, pages).map((page, index) => (
          <If condition={page === "..."} key={index}>
            <Then>
              <li className="page-item disabled">
                <a className="page-link">
                  <span>...</span>
                </a>
              </li>
            </Then>
            <Else>
              <li
                className={`page-item ${currentPage === page ? " active" : ""}`}
              >
                <Link
                  href={generateLink(path, query, { page })}
                  className="page-link"
                >
                  {page}
                </Link>
              </li>
            </Else>
          </If>
        ))}
        <li className={`page-item${currentPage === pages ? " d-none" : ""}`}>
          <Link
            href={generateLink(path, query, { page: currentPage + 1 })}
            className="page-link"
          >
            <span>›</span>
          </Link>
        </li>
        <li className={`page-item${currentPage === pages ? " d-none" : ""}`}>
          <Link
            href={generateLink(path, query, { page: pages })}
            className="page-link"
          >
            <span>&raquo;</span>
          </Link>
        </li>
      </ul>
    </div>
  );
}
