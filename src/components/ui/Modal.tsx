import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { ReactNode } from "react";

interface IProps {
  isOpen: boolean;
  closeModal: () => void;
  children: ReactNode;
  title?: string;
  description?: string;
}

export default function Modal({
  isOpen,
  closeModal,
  children,
  title,
  description,
}: IProps) {
  return (
    <>
      <Dialog
        open={isOpen}
        as="div"
        className="relative z-10 focus:outline-none"
        onClose={closeModal}
        __demoMode
      >
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto backdrop-blur-xs backdrop-contrast-50">
          <div className="flex min-h-full items-center justify-center p-4">
            <DialogPanel
              transition
              className="w-full max-w-md rounded-xl bg-white p-6 duration-300 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0"
            >
              <DialogTitle
                as="h3"
                className="text-base/7 font-medium text-black"
              >
                {title}
              </DialogTitle>
              <p className="mt-2 text-sm/6 text-black">{description}</p>
              <div className="mt-4"></div>
              {children}
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
}
