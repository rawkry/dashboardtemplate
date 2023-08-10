import { ToastContainer } from "react-toastify";

import { Guest as GuestBaseLayout } from "@/ui/layouts";

export default function Guest({ children, title = "" }) {
  return (
    <GuestBaseLayout title={title}>
      {children}
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </GuestBaseLayout>
  );
}
