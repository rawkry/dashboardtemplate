import React from "react";
import { useRouter } from "next/router";

import { callFetch } from "@/helpers/server";

const { url_one } = JSON.parse(
  process.env.NEXT_PUBLIC_BUSINESS_INTERNAL_BASE_SERVICE
);

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

const pan = () => {
  const router = useRouter();
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div>
        <img
          className=""
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            boxShadow: "0px 0px 10px 0px rgba(0,0,0,0.75)",
          }}
          src={`${url_one}/businesses/${router.query.id}/preview-image/registration`}
          alt="Business Registration Image"
        />
      </div>
    </div>
  );
};

export default pan;
