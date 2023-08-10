import Head from "next/head";
import { Fragment } from "react";

export default function WrapWithHead({ children, title }) {
  const appName = process.env.NEXT_PUBLIC_APP_NAME;
  return (
    <Fragment>
      <Head>
        <title>{appName ? `${title} - ${appName}` : title}</title>
      </Head>
      {children}
    </Fragment>
  );
}
