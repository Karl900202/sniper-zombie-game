import { memo } from "react";

interface ModalProps {
  title: string;
  description: string;
  onClick: () => void;
  show: boolean;
  buttonText?: string;
}

function Modal({
  title,
  description,
  onClick,
  show,
  buttonText = "확인",
}: ModalProps) {
  if (!show) {
    return null;
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center z-40">
      <div className="bg-white rounded-[50px] border-[2px] border-gray-300 p-5 mx-2 max-w-sm w-full shadow-xl">
        <h2 className="text-center text-2xl text-black font-bold mb-4">
          {title}
        </h2>
        <p className="text-center text-md text-black mb-6">{description}</p>
        <div className="flex justify-center">
          <button
            onClick={onClick}
            className="w-1/2 py-4 text-white rounded-full font-normal text-lg transition-colors bg-[#4F00FF]"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(Modal);
