import Link from "next/link";

export default function Custom404() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
      }}
    >
      <h1 className="text-6xl font-bold">404 !</h1>
      <h2 className="text-4xl font-bold">Page Not Found</h2>
      <Link href="/">
        <p className="text-2xl font-bold">go back</p>
      </Link>
    </div>
  );
}
